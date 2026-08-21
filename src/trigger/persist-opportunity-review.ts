import { Composio } from "@composio/core";
import { logger, task } from "@trigger.dev/sdk";
import { z } from "zod";

// Pinned toolkit versions — verified against the current tool schemas at
// build time. Update deliberately, not implicitly. Never "latest".
const GOOGLESHEETS_TOOLKIT_VERSION = "20260813_00";
const GMAIL_TOOLKIT_VERSION = "20260817_00";

const SEARCH_TOOL = "GOOGLESHEETS_BATCH_GET";
const APPEND_TOOL = "GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND";
const UPDATE_TOOL = "GOOGLESHEETS_VALUES_UPDATE";
const CREATE_DRAFT_TOOL = "GMAIL_CREATE_EMAIL_DRAFT";

const LEADS_SEARCH_RANGE = "Leads!A2:S1000";
const LEADS_APPEND_RANGE = "Leads!A2:S1000";

// Column order within a Leads row (0-indexed, A:S).
const COL = {
  leadId: 0,
  gmailDraftId: 17,
  lastUpdated: 18,
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

type PlanStage = {
  stage: "search-existing-lead" | "append-row" | "create-gmail-draft" | "update-draft-id";
  tool: string;
  toolkitVersion: string;
  executed: boolean;
};

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
): (string | number)[] {
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
      stage: "append-row",
      tool: APPEND_TOOL,
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

    // 1. Search a bounded range for an existing lead by Lead ID.
    const searchResult = await execute(SEARCH_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
      spreadsheet_id: spreadsheetId,
      ranges: [LEADS_SEARCH_RANGE],
    });
    const existingRows =
      (searchResult.data as { valueRanges?: { values?: (string | number)[][] }[] } | undefined)
        ?.valueRanges?.[0]?.values ?? [];
    const existingIndex = existingRows.findIndex(
      (row) => String(row[COL.leadId] ?? "") === input.leadId
    );

    if (existingIndex !== -1) {
      const existingGmailDraftId = String(existingRows[existingIndex][COL.gmailDraftId] ?? "").trim();
      if (existingGmailDraftId) {
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
      // Existing lead with a blank Gmail Draft ID — resume rather than
      // append a duplicate row. Sheet row number = search-range offset + 2
      // (LEADS_SEARCH_RANGE starts at row 2).
      const sheetRow = existingIndex + 2;
      const draft = await execute(CREATE_DRAFT_TOOL, GMAIL_TOOLKIT_VERSION, {
        recipient_email: input.email,
        subject: input.draftEmailSubject,
        body: input.draftEmailBody,
      });
      const draftId = (draft.data as { id?: string } | undefined)?.id;
      if (!draftId) throw new Error("Gmail draft creation did not return a draft id.");

      await execute(UPDATE_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
        spreadsheet_id: spreadsheetId,
        range: `Leads!R${sheetRow}:S${sheetRow}`,
        values: [[draftId, new Date().toISOString()]],
      });

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

    // 2. Absent lead — append once, then create the Gmail draft, then
    // update the row's Gmail Draft ID and Last Updated columns.
    const appendResult = await execute(APPEND_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
      range: LEADS_APPEND_RANGE,
      spreadsheetId,
      values: [plannedRow],
    });
    const updatedRange = (
      appendResult.data as { updates?: { updatedRange?: string } } | undefined
    )?.updates?.updatedRange;
    const rowMatch = updatedRange?.match(/![A-Z]+(\d+):/);
    const appendedRow = rowMatch ? Number(rowMatch[1]) : undefined;
    if (!appendedRow) {
      throw new Error("Append did not return a resolvable row number.");
    }

    const draft = await execute(CREATE_DRAFT_TOOL, GMAIL_TOOLKIT_VERSION, {
      recipient_email: input.email,
      subject: input.draftEmailSubject,
      body: input.draftEmailBody,
    });
    const draftId = (draft.data as { id?: string } | undefined)?.id;
    if (!draftId) throw new Error("Gmail draft creation did not return a draft id.");

    await execute(UPDATE_TOOL, GOOGLESHEETS_TOOLKIT_VERSION, {
      spreadsheet_id: spreadsheetId,
      range: `Leads!R${appendedRow}:S${appendedRow}`,
      values: [[draftId, new Date().toISOString()]],
    });

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
