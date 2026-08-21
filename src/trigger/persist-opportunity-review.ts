import { Composio } from "@composio/core";
import { logger, task } from "@trigger.dev/sdk";
import { z } from "zod";

// Pinned toolkit versions — verified against the current tool schemas at
// build time. Update deliberately, not implicitly. Never "latest".
const GOOGLESHEETS_TOOLKIT_VERSION = "20260813_00";
const GMAIL_TOOLKIT_VERSION = "20260817_00";

const SEARCH_TOOL = "GOOGLESHEETS_BATCH_GET";
const UPDATE_TOOL = "GOOGLESHEETS_VALUES_UPDATE";
const CREATE_DRAFT_TOOL = "GMAIL_CREATE_EMAIL_DRAFT";

const LEADS_SEARCH_RANGE = "Leads!A2:S1000";
const SEARCH_RANGE_FIRST_ROW = 2;
const SEARCH_RANGE_ROW_COUNT = 999; // rows 2..1000 inclusive

// Column order within a Leads row (0-indexed, A:S).
const COL = {
  leadId: 0,
  gmailDraftId: 17,
} as const;

const PriorityEnum = z.enum(["High", "Medium", "Standard"]);

const PersistLeadInputSchema = z.object({
  leadId: z.string().min(1),
  submittedAt: z.string().min(1),
  fullName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.email(),
  phone: z.string().nullable(),
  businessLocation: z.string().min(1),
  industry: z.string().min(1),
  numberOfEmployees: z.string().min(1),
  timeDrainingProcess: z.string().min(1),
  hoursPerWeek: z.number().nonnegative(),
  preferredContact: z.string().min(1),
  priority: PriorityEnum,
  summary: z.string().min(1),
  suggestedQuestions: z.array(z.string().min(1)).length(3),
  draftEmailSubject: z.string().min(1),
  draftEmailBody: z.string().min(1),
  followUpDelayHours: z.number().nonnegative(),
  dryRun: z.boolean().default(true),
});

type PersistLeadInput = z.infer<typeof PersistLeadInputSchema>;

type SheetRow = (string | number)[];

type PlanStage = {
  stage: "search-existing-lead" | "write-exact-row" | "create-gmail-draft" | "update-draft-id";
  tool: string;
  toolkitVersion: string;
  executed: boolean;
};

type LeadAction =
  | { action: "skip-already-complete" }
  | { action: "resume"; rowIndex: number }
  | { action: "create"; emptyRowIndex: number }
  | { action: "sheet-full" };

// --- Pure helpers (no I/O — independently checkable) ---

export function findFirstEmptyRowIndex(
  existingRows: SheetRow[],
  maxRows: number
): number | null {
  for (let i = 0; i < maxRows; i++) {
    const leadIdCell = existingRows[i]?.[COL.leadId];
    if (leadIdCell === undefined || leadIdCell === null || String(leadIdCell).trim() === "") {
      return i;
    }
  }
  return null;
}

export function determineLeadAction(
  existingRows: SheetRow[],
  leadId: string,
  maxRows: number
): LeadAction {
  const existingIndex = existingRows.findIndex(
    (row) => String(row[COL.leadId] ?? "") === leadId
  );

  if (existingIndex !== -1) {
    const existingGmailDraftId = String(existingRows[existingIndex][COL.gmailDraftId] ?? "").trim();
    if (existingGmailDraftId) {
      return { action: "skip-already-complete" };
    }
    return { action: "resume", rowIndex: existingIndex };
  }

  const emptyRowIndex = findFirstEmptyRowIndex(existingRows, maxRows);
  if (emptyRowIndex === null) {
    return { action: "sheet-full" };
  }
  return { action: "create", emptyRowIndex };
}

// Shared Composio-result assertion/decoder. Applied immediately after every
// tool execution. Never treats an HTTP 200 wrapper as tool success — checks
// `successful` explicitly before trusting `data`. Thrown errors carry only
// the operation name and a safe category, never arguments, response bodies,
// spreadsheet ID, email, draft ID, generated text, credentials, or account
// IDs.
export function decodeToolResult(
  operationName: string,
  result: unknown
): Record<string, unknown> {
  if (!result || typeof result !== "object") {
    throw new Error(`Composio operation "${operationName}" returned an unrecognised response shape.`);
  }
  const r = result as { successful?: unknown; data?: unknown; error?: unknown };

  if (r.successful !== true) {
    throw new Error(`Composio operation "${operationName}" did not succeed (successful=false).`);
  }
  if (!r.data || typeof r.data !== "object") {
    throw new Error(`Composio operation "${operationName}" succeeded but returned no usable data.`);
  }
  return r.data as Record<string, unknown>;
}

function calculateFollowUpDue(submittedAt: string, followUpDelayHours: number): string {
  const submittedMs = new Date(submittedAt).getTime();
  if (Number.isNaN(submittedMs)) {
    throw new Error("submittedAt is not a valid ISO timestamp.");
  }
  return new Date(submittedMs + followUpDelayHours * 60 * 60 * 1000).toISOString();
}

function buildLeadsRow(
  input: PersistLeadInput,
  followUpDueIso: string,
  lastUpdatedIso: string,
  gmailDraftId = ""
): SheetRow {
  const questionsText = input.suggestedQuestions
    .map((question, i) => `${i + 1}. ${question}`)
    .join("\n");

  return [
    input.leadId, // A Lead ID
    input.submittedAt, // B Submitted At
    input.fullName, // C Full Name
    input.businessName, // D Business Name
    input.email, // E Email
    input.phone ?? "", // F Phone
    input.businessLocation, // G Business Location
    input.industry, // H Industry
    input.numberOfEmployees, // I Number of Employees
    input.timeDrainingProcess, // J Time-Draining Process
    input.hoursPerWeek, // K Hours Per Week
    input.preferredContact, // L Preferred Contact
    input.summary, // M AI Summary
    questionsText, // N Suggested Questions
    input.priority, // O Priority
    "New", // P Status
    followUpDueIso, // Q Follow-Up Due
    gmailDraftId, // R Gmail Draft ID (blank until a draft is created)
    lastUpdatedIso, // S Last Updated
  ];
}

function describePermissionError(error: unknown): string | null {
  const cause = (error as { cause?: unknown })?.cause as
    | { status?: number; error?: { error?: { message?: string; slug?: string } } }
    | undefined;
  if (cause?.status !== 403) return null;
  return cause.error?.error?.message ?? "Composio denied this request (403).";
}

function planStages(): PlanStage[] {
  return [
    {
      stage: "search-existing-lead",
      tool: SEARCH_TOOL,
      toolkitVersion: GOOGLESHEETS_TOOLKIT_VERSION,
      executed: false,
    },
    {
      stage: "write-exact-row",
      tool: UPDATE_TOOL,
      toolkitVersion: GOOGLESHEETS_TOOLKIT_VERSION,
      executed: false,
    },
    {
      stage: "create-gmail-draft",
      tool: CREATE_DRAFT_TOOL,
      toolkitVersion: GMAIL_TOOLKIT_VERSION,
      executed: false,
    },
    {
      stage: "update-draft-id",
      tool: UPDATE_TOOL,
      toolkitVersion: GOOGLESHEETS_TOOLKIT_VERSION,
      executed: false,
    },
  ];
}

export const persistOpportunityReviewTask = task({
  id: "persist-opportunity-review",
  maxDuration: 60,
  // Task-level retry protection — overrides the project's 3-attempt default.
  retry: {
    maxAttempts: 1,
  },
  // Only one persistence run at a time, so two runs can never select the
  // same empty row concurrently.
  queue: {
    concurrencyLimit: 1,
  },
  run: async (rawInput: unknown) => {
    const input = PersistLeadInputSchema.parse(rawInput);

    const followUpDueIso = calculateFollowUpDue(input.submittedAt, input.followUpDelayHours);
    const lastUpdatedIso = new Date().toISOString();
    const plannedRow = buildLeadsRow(input, followUpDueIso, lastUpdatedIso);

    if (input.dryRun) {
      logger.log(
        `dryRun: true, priority: ${input.priority}, status: planned, toolExecutions: 0`
      );
      return {
        dryRun: true,
        priority: input.priority,
        toolExecutionCount: 0,
        plan: planStages(),
        plannedRow,
        rowLength: plannedRow.length,
      };
    }

    // Live path — fails closed before any write unless explicitly enabled.
    if (process.env.NUNYALINK_ENABLE_WRITES !== "true") {
      throw new Error(
        "Writes are disabled. Set NUNYALINK_ENABLE_WRITES=true to allow a non-dry-run persistence operation."
      );
    }

    const userId = process.env.COMPOSIO_USER_ID;
    const spreadsheetId = process.env.NUNYALINK_LEADS_SHEET_ID;
    if (!userId) throw new Error("COMPOSIO_USER_ID is not set.");
    if (!spreadsheetId) throw new Error("NUNYALINK_LEADS_SHEET_ID is not set.");

    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
    let toolExecutionCount = 0;

    async function execute(slug: string, version: string, args: Record<string, unknown>) {
      try {
        const result = await composio.tools.execute(slug, {
          userId: userId as string,
          version,
          arguments: args,
        });
        toolExecutionCount += 1;
        return result;
      } catch (error) {
        const permissionDetail = describePermissionError(error);
        if (permissionDetail) {
          throw new Error(
            `Composio permission error — stopping without a workaround. Required permission area: ${permissionDetail}`
          );
        }
        throw error;
      }
    }

    async function createDraftAndUpdateRow(sheetRow: number) {
      const draftResult = await execute(CREATE_DRAFT_TOOL, GMAIL_TOOLKIT_VERSION, {
        recipient_email: input.email,
        subject: input.draftEmailSubject,
        body: input.draftEmailBody,
      });
      const draftData = decodeToolResult("create-gmail-draft", draftResult);
      const draftId = typeof draftData.id === "string" ? draftData.id : undefined;
      if (!draftId) {
        throw new Error("Composio operation \"create-gmail-draft\" did not return a draft id.");
      }

      const updateResult = await execute(UPDATE_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
        spreadsheet_id: spreadsheetId,
        range: `Leads!R${sheetRow}:S${sheetRow}`,
        value_input_option: "RAW",
        values: [[draftId, new Date().toISOString()]],
      });
      decodeToolResult("update-draft-id", updateResult);
    }

    // 1. Search a bounded range for an existing lead by Lead ID.
    const searchResult = await execute(SEARCH_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
      spreadsheet_id: spreadsheetId,
      ranges: [LEADS_SEARCH_RANGE],
    });
    const searchData = decodeToolResult("search-existing-lead", searchResult);
    const existingRows =
      (searchData.valueRanges as { values?: SheetRow[] }[] | undefined)?.[0]?.values ?? [];

    const decision = determineLeadAction(existingRows, input.leadId, SEARCH_RANGE_ROW_COUNT);

    if (decision.action === "skip-already-complete") {
      logger.log(
        `dryRun: false, priority: ${input.priority}, status: skipped-already-complete, toolExecutions: ${toolExecutionCount}`
      );
      return {
        dryRun: false,
        priority: input.priority,
        status: "skipped-already-complete" as const,
        toolExecutionCount,
      };
    }

    if (decision.action === "resume") {
      // Existing lead with a blank Gmail Draft ID — resume rather than
      // write a duplicate row.
      const sheetRow = decision.rowIndex + SEARCH_RANGE_FIRST_ROW;
      await createDraftAndUpdateRow(sheetRow);

      logger.log(
        `dryRun: false, priority: ${input.priority}, status: resumed, toolExecutions: ${toolExecutionCount}`
      );
      return {
        dryRun: false,
        priority: input.priority,
        status: "resumed" as const,
        toolExecutionCount,
      };
    }

    if (decision.action === "sheet-full") {
      throw new Error(
        "No available row found in the bounded Leads range. The sheet may be full."
      );
    }

    // 2. Absent lead — write the row at the first genuinely empty row
    // within the same bounded range, then create the Gmail draft, then
    // update that exact row's Gmail Draft ID and Last Updated columns.
    const sheetRow = decision.emptyRowIndex + SEARCH_RANGE_FIRST_ROW;
    const writeResult = await execute(UPDATE_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
      spreadsheet_id: spreadsheetId,
      range: `Leads!A${sheetRow}:S${sheetRow}`,
      value_input_option: "RAW",
      values: [plannedRow],
    });
    decodeToolResult("write-exact-row", writeResult);

    await createDraftAndUpdateRow(sheetRow);

    logger.log(
      `dryRun: false, priority: ${input.priority}, status: created, toolExecutions: ${toolExecutionCount}`
    );
    return {
      dryRun: false,
      priority: input.priority,
      status: "created" as const,
      toolExecutionCount,
    };
  },
});
