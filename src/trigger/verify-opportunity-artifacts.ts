import { Composio } from "@composio/core";
import { logger, task } from "@trigger.dev/sdk";
import { z } from "zod";
import { HoursPerWeekBandSchema } from "./opportunity-review-shared";

// Pinned toolkit versions — verified against the current tool schemas at
// build time. Update deliberately, not implicitly. Never "latest".
const GOOGLESHEETS_TOOLKIT_VERSION = "20260813_00";
const GMAIL_TOOLKIT_VERSION = "20260817_00";

const SEARCH_TOOL = "GOOGLESHEETS_BATCH_GET";
const GET_DRAFT_TOOL = "GMAIL_GET_DRAFT";

const LEADS_SEARCH_RANGE = "Leads!A2:S1000";

// Committed A:S column order — copied verbatim from persist-opportunity-review.ts's
// row layout. Do not invent a new order here.
const COL = {
  leadId: 0,
  hoursPerWeek: 10,
  priority: 14,
  status: 15,
  followUpDue: 16,
  gmailDraftId: 17,
  lastUpdated: 18,
} as const;
const ROW_LENGTH = 19;

const PriorityEnum = z.enum(["Standard", "Medium", "High"]);

export const VerifyOpportunityArtifactsInputSchema = z
  .object({
    leadId: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^PROD-LIVE-[A-Z0-9-]+$/, "leadId must be a synthetic PROD-LIVE test ID."),
    expectedSubmittedAt: z.iso.datetime({
      message: "expectedSubmittedAt must be a valid ISO timestamp.",
    }),
    expectedHoursBand: HoursPerWeekBandSchema,
    expectedPriority: PriorityEnum,
    expectedFollowUpDelayHours: z.number().finite().nonnegative().default(24),
  })
  .strict();

export type SheetRow = (string | number)[];

export type VerifyOpportunityArtifactsOutput = {
  status: "absent" | "duplicate" | "verified";
  rowCount: number;
  rowShapeValid: boolean;
  hoursBandMatches: boolean;
  priorityMatches: boolean;
  statusPopulated: boolean;
  followUpDueMatches: boolean;
  lastUpdatedPopulated: boolean;
  draftReferencePresent: boolean;
  draftExists: boolean;
  sheetReadCount: number;
  gmailReadCount: number;
};

function cell(row: SheetRow, index: number): string {
  return String(row[index] ?? "");
}

// Sanitised decoder — the thrown message names only the operation, never
// spreadsheet/account/lead/draft identifiers, email addresses, row content,
// Gmail content, or raw tool data.
export function decodeToolResult(operationName: string, result: unknown): Record<string, unknown> {
  if (!result || typeof result !== "object") {
    throw new Error(`Composio operation "${operationName}" returned an unrecognised response shape.`);
  }
  const r = result as { successful?: unknown; data?: unknown };
  if (r.successful !== true) {
    throw new Error(`Composio operation "${operationName}" did not succeed.`);
  }
  if (!r.data || typeof r.data !== "object") {
    throw new Error(`Composio operation "${operationName}" returned no usable data.`);
  }
  return r.data as Record<string, unknown>;
}

// Exact match only on column A — no partial, normalised, case-insensitive or
// email-based matching.
export function matchRows(values: SheetRow[], leadId: string): SheetRow[] {
  return values.filter((row) => cell(row, COL.leadId) === leadId);
}

// Pure classification of the match set. Absent/duplicate never carry a row,
// so the Gmail-lookup code path in `run` is structurally unreachable for
// those two outcomes — it only exists inside the single-match branch.
export function classifyMatches(matches: SheetRow[]): "absent" | "duplicate" | "single-match" {
  if (matches.length === 0) return "absent";
  if (matches.length > 1) return "duplicate";
  return "single-match";
}

function calculateExpectedFollowUpDue(expectedSubmittedAt: string, delayHours: number): string {
  const submittedMs = new Date(expectedSubmittedAt).getTime();
  return new Date(submittedMs + delayHours * 60 * 60 * 1000).toISOString();
}

// Pure, independently testable row-evaluation helper. Never returns row
// content — only the safe booleans the task reports.
export function evaluateMatchedRow(
  row: SheetRow,
  expected: {
    expectedHoursBand: string;
    expectedPriority: string;
    expectedSubmittedAt: string;
    expectedFollowUpDelayHours: number;
  }
): {
  rowShapeValid: boolean;
  hoursBandMatches: boolean;
  priorityMatches: boolean;
  statusPopulated: boolean;
  followUpDueMatches: boolean;
  lastUpdatedPopulated: boolean;
  draftReferencePresent: boolean;
} {
  // The Sheets API may omit trailing blank cells, so a shorter-than-19 row
  // is expected and valid; a row longer than 19 A:S columns is not.
  const rowShapeValid = row.length >= 1 && row.length <= ROW_LENGTH;
  const expectedFollowUpDue = calculateExpectedFollowUpDue(
    expected.expectedSubmittedAt,
    expected.expectedFollowUpDelayHours
  );
  return {
    rowShapeValid,
    hoursBandMatches: cell(row, COL.hoursPerWeek) === expected.expectedHoursBand,
    priorityMatches: cell(row, COL.priority) === expected.expectedPriority,
    statusPopulated: cell(row, COL.status).trim() !== "",
    followUpDueMatches: cell(row, COL.followUpDue) === expectedFollowUpDue,
    lastUpdatedPopulated: cell(row, COL.lastUpdated).trim() !== "",
    draftReferencePresent: cell(row, COL.gmailDraftId).trim() !== "",
  };
}

export const verifyOpportunityArtifactsTask = task({
  id: "verify-opportunity-artifacts",
  maxDuration: 60,
  retry: {
    maxAttempts: 1,
  },
  queue: {
    concurrencyLimit: 1,
  },
  run: async (rawInput: unknown): Promise<VerifyOpportunityArtifactsOutput> => {
    const input = VerifyOpportunityArtifactsInputSchema.parse(rawInput);

    const apiKey = process.env.COMPOSIO_API_KEY;
    const userId = process.env.COMPOSIO_USER_ID;
    const spreadsheetId = process.env.NUNYALINK_LEADS_SHEET_ID;
    if (!apiKey) throw new Error("COMPOSIO_API_KEY is not set.");
    if (!userId) throw new Error("COMPOSIO_USER_ID is not set.");
    if (!spreadsheetId) throw new Error("NUNYALINK_LEADS_SHEET_ID is not set.");

    const composio = new Composio({ apiKey });

    logger.log("stage: sheet-search, status: started");

    const batch = await composio.tools.execute(SEARCH_TOOL, {
      userId,
      version: GOOGLESHEETS_TOOLKIT_VERSION,
      arguments: {
        spreadsheet_id: spreadsheetId,
        ranges: [LEADS_SEARCH_RANGE],
      },
    });
    const sheetData = decodeToolResult("search-leads", batch);
    const sheetReadCount = 1;

    const values =
      (sheetData.valueRanges as { values?: SheetRow[] }[] | undefined)?.[0]?.values ?? [];

    const matches = matchRows(values, input.leadId);
    const classification = classifyMatches(matches);

    if (classification === "absent") {
      logger.log("stage: sheet-search, status: completed, result: absent, rowCount: 0, sheetReadCount: 1, gmailReadCount: 0");
      return {
        status: "absent",
        rowCount: 0,
        rowShapeValid: false,
        hoursBandMatches: false,
        priorityMatches: false,
        statusPopulated: false,
        followUpDueMatches: false,
        lastUpdatedPopulated: false,
        draftReferencePresent: false,
        draftExists: false,
        sheetReadCount,
        gmailReadCount: 0,
      };
    }

    if (classification === "duplicate") {
      logger.log(
        `stage: sheet-search, status: completed, result: duplicate, rowCount: ${matches.length}, sheetReadCount: 1, gmailReadCount: 0`
      );
      return {
        status: "duplicate",
        rowCount: matches.length,
        rowShapeValid: false,
        hoursBandMatches: false,
        priorityMatches: false,
        statusPopulated: false,
        followUpDueMatches: false,
        lastUpdatedPopulated: false,
        draftReferencePresent: false,
        draftExists: false,
        sheetReadCount,
        gmailReadCount: 0,
      };
    }

    const row = matches[0];
    const evaluation = evaluateMatchedRow(row, {
      expectedHoursBand: input.expectedHoursBand,
      expectedPriority: input.expectedPriority,
      expectedSubmittedAt: input.expectedSubmittedAt,
      expectedFollowUpDelayHours: input.expectedFollowUpDelayHours,
    });

    logger.log(
      `stage: row-evaluation, status: completed, rowShapeValid: ${evaluation.rowShapeValid}, hoursBandMatches: ${evaluation.hoursBandMatches}, priorityMatches: ${evaluation.priorityMatches}, statusPopulated: ${evaluation.statusPopulated}, followUpDueMatches: ${evaluation.followUpDueMatches}, lastUpdatedPopulated: ${evaluation.lastUpdatedPopulated}, draftReferencePresent: ${evaluation.draftReferencePresent}`
    );

    let draftExists = false;
    let gmailReadCount = 0;

    if (evaluation.draftReferencePresent) {
      const draftReference = cell(row, COL.gmailDraftId);
      logger.log("stage: gmail-lookup, status: started");
      try {
        const draftResult = await composio.tools.execute(GET_DRAFT_TOOL, {
          userId,
          version: GMAIL_TOOLKIT_VERSION,
          arguments: { draft_id: draftReference },
        });
        gmailReadCount = 1;
        decodeToolResult("get-draft", draftResult);
        draftExists = true;
        logger.log("stage: gmail-lookup, status: completed, draftExists: true");
      } catch {
        // Any failure (not found, revoked, permission issue) surfaces only
        // as draftExists: false — never thrown, never logged with detail.
        gmailReadCount = 1;
        draftExists = false;
        logger.log("stage: gmail-lookup, status: completed, draftExists: false");
      }
    }

    return {
      status: "verified",
      rowCount: 1,
      rowShapeValid: evaluation.rowShapeValid,
      hoursBandMatches: evaluation.hoursBandMatches,
      priorityMatches: evaluation.priorityMatches,
      statusPopulated: evaluation.statusPopulated,
      followUpDueMatches: evaluation.followUpDueMatches,
      lastUpdatedPopulated: evaluation.lastUpdatedPopulated,
      draftReferencePresent: evaluation.draftReferencePresent,
      draftExists,
      sheetReadCount,
      gmailReadCount,
    };
  },
});
