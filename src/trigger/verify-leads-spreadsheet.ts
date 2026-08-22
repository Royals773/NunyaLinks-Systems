import { Composio } from "@composio/core";
import { logger, task } from "@trigger.dev/sdk";
import { HOURS_PER_WEEK_BANDS, calculatePriority, type Priority } from "./opportunity-review-shared";

// Pinned Google Sheets toolkit version — verified against the current
// tool schemas at build time. Update deliberately, not implicitly.
const TOOLKIT_VERSION = "20260813_00";

const EXPECTED_WORKBOOK_TITLE = "NunyaLink Opportunity Review Leads";
const REQUIRED_TABS = ["Leads", "Automation Rules"];

const EXPECTED_LEADS_HEADERS = [
  "Lead ID",
  "Submitted At",
  "Full Name",
  "Business Name",
  "Email",
  "Phone",
  "Business Location",
  "Industry",
  "Number of Employees",
  "Time-Draining Process",
  "Hours Per Week",
  "Preferred Contact",
  "AI Summary",
  "Suggested Questions",
  "Priority",
  "Status",
  "Follow-Up Due",
  "Gmail Draft ID",
  "Last Updated",
];

// Derived from the committed shared source of truth (opportunity-review-shared.ts)
// rather than a second independent priority map — preserves the original
// band order from HOURS_PER_WEEK_BANDS within each priority group.
export function bandsForPriority(priority: Priority): string {
  return HOURS_PER_WEEK_BANDS.filter((band) => calculatePriority(band) === priority).join(", ");
}

export const EXPECTED_AUTOMATION_RULES: [string, string][] = [
  ["Follow-up delay hours", "24"],
  ["High-priority hours bands", bandsForPriority("High")],
  ["Medium-priority hours bands", bandsForPriority("Medium")],
  ["Standard-priority hours bands", bandsForPriority("Standard")],
  ["Default lead status", "New"],
  ["Time zone", "Europe/London"],
];

function describePermissionError(error: unknown): string | null {
  const cause = (error as { cause?: unknown })?.cause as
    | { status?: number; error?: { error?: { message?: string; slug?: string } } }
    | undefined;
  if (cause?.status !== 403) return null;
  return cause.error?.error?.message ?? "Composio denied this request (403).";
}

export const verifyLeadsSpreadsheetTask = task({
  id: "verify-leads-spreadsheet",
  maxDuration: 60,
  run: async () => {
    const userId = process.env.COMPOSIO_USER_ID;
    const spreadsheetId = process.env.NUNYALINK_LEADS_SHEET_ID;

    if (!userId) throw new Error("COMPOSIO_USER_ID is not set.");
    if (!spreadsheetId) throw new Error("NUNYALINK_LEADS_SHEET_ID is not set.");

    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

    let info;
    try {
      info = await composio.tools.execute("GOOGLESHEETS_GET_SPREADSHEET_INFO", {
        userId,
        version: TOOLKIT_VERSION,
        arguments: { spreadsheet_id: spreadsheetId },
      });
    } catch (error) {
      const permissionDetail = describePermissionError(error);
      if (permissionDetail) {
        throw new Error(
          `Composio permission error — stopping without a workaround. Required permission area: ${permissionDetail}`
        );
      }
      throw error;
    }

    const data = info.data as {
      properties?: { title?: string };
      title?: string;
      sheets?: { properties?: { title?: string } }[];
    };
    const title = data.properties?.title ?? data.title;
    logger.log(`workbook title: ${title}`);
    if (title !== EXPECTED_WORKBOOK_TITLE) {
      throw new Error(
        `Unexpected workbook title. Expected "${EXPECTED_WORKBOOK_TITLE}".`
      );
    }

    const tabTitles = (data.sheets ?? [])
      .map((sheet) => sheet.properties?.title)
      .filter((t): t is string => Boolean(t));
    logger.log(`tabs: ${tabTitles.join(", ")}`);
    for (const tab of REQUIRED_TABS) {
      if (!tabTitles.includes(tab)) {
        throw new Error(`Missing required tab: "${tab}".`);
      }
    }

    let batch;
    try {
      batch = await composio.tools.execute("GOOGLESHEETS_BATCH_GET", {
        userId,
        version: TOOLKIT_VERSION,
        arguments: {
          spreadsheet_id: spreadsheetId,
          ranges: ["Leads!A1:S1", "Automation Rules!A1:B7"],
        },
      });
    } catch (error) {
      const permissionDetail = describePermissionError(error);
      if (permissionDetail) {
        throw new Error(
          `Composio permission error — stopping without a workaround. Required permission area: ${permissionDetail}`
        );
      }
      throw error;
    }

    const valueRanges =
      (batch.data as { valueRanges?: { values?: string[][] }[] } | undefined)
        ?.valueRanges ?? [];
    const leadsHeaderRow = valueRanges[0]?.values?.[0] ?? [];
    const automationRulesRows = valueRanges[1]?.values ?? [];

    const headersMatch =
      leadsHeaderRow.length === EXPECTED_LEADS_HEADERS.length &&
      EXPECTED_LEADS_HEADERS.every((header, i) => leadsHeaderRow[i] === header);
    if (!headersMatch) {
      throw new Error(
        "Leads!A1:S1 headers are missing, reordered, or do not match the expected schema."
      );
    }
    logger.log(`Leads header count: ${leadsHeaderRow.length}`);

    // Row 0 is the "Setting" / "Value" header; the 6 settings start at row 1.
    // Exact matching only — no normalization or partial matching.
    const ruleMismatches: string[] = [];
    for (let i = 0; i < EXPECTED_AUTOMATION_RULES.length; i++) {
      const [expectedLabel, expectedValue] = EXPECTED_AUTOMATION_RULES[i];
      const row = automationRulesRows[i + 1] ?? [];
      if (row[0] !== expectedLabel || String(row[1]) !== expectedValue) {
        ruleMismatches.push(
          `row ${i + 2}: expected "${expectedLabel}: ${expectedValue}", got "${row[0]}: ${row[1]}"`
        );
      }
    }
    if (ruleMismatches.length > 0) {
      throw new Error(
        `Automation Rules validation failed (${ruleMismatches.length} of ${EXPECTED_AUTOMATION_RULES.length}): ${ruleMismatches.join("; ")}`
      );
    }
    logger.log("automation rules: all 6 settings validated");

    return {
      workbookTitle: title,
      tabs: tabTitles,
      leadsHeaderCount: leadsHeaderRow.length,
      automationRulesValid: true,
      toolkitVersion: TOOLKIT_VERSION,
    };
  },
});
