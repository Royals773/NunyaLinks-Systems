// Status and type options for the admin area. Values must match the CHECK
// constraints in supabase/migrations.

export type Option = { value: string; label: string; tone: Tone };
export type Tone = "slate" | "blue" | "amber" | "green" | "red" | "teal";

export const LEAD_STATUSES: Option[] = [
  { value: "new", label: "New", tone: "blue" },
  { value: "contacted", label: "Contacted", tone: "teal" },
  { value: "qualified", label: "Qualified", tone: "amber" },
  { value: "proposal", label: "Proposal sent", tone: "amber" },
  { value: "won", label: "Won", tone: "green" },
  { value: "lost", label: "Lost", tone: "slate" },
];

export const LEAD_SOURCES: Option[] = [
  { value: "website", label: "Website", tone: "blue" },
  { value: "referral", label: "Referral", tone: "teal" },
  { value: "phone", label: "Phone", tone: "slate" },
  { value: "email", label: "Email", tone: "slate" },
  { value: "social", label: "Social media", tone: "slate" },
  { value: "other", label: "Other", tone: "slate" },
];

export const CLIENT_STATUSES: Option[] = [
  { value: "active", label: "Active", tone: "green" },
  { value: "inactive", label: "Inactive", tone: "slate" },
];

export const PROJECT_TYPES: Option[] = [
  { value: "automation", label: "Automation", tone: "slate" },
  { value: "website", label: "Website", tone: "slate" },
  { value: "software", label: "Custom software", tone: "slate" },
  { value: "ai_receptionist", label: "AI receptionist", tone: "slate" },
  { value: "audit", label: "Audit & roadmap", tone: "slate" },
  { value: "other", label: "Other", tone: "slate" },
];

export const PROJECT_STATUSES: Option[] = [
  { value: "planned", label: "Planned", tone: "blue" },
  { value: "in_progress", label: "In progress", tone: "amber" },
  { value: "on_hold", label: "On hold", tone: "slate" },
  { value: "completed", label: "Completed", tone: "green" },
  { value: "cancelled", label: "Cancelled", tone: "red" },
];

export const QUOTE_STATUSES: Option[] = [
  { value: "draft", label: "Draft", tone: "slate" },
  { value: "sent", label: "Sent", tone: "blue" },
  { value: "accepted", label: "Accepted", tone: "green" },
  { value: "declined", label: "Declined", tone: "red" },
  { value: "expired", label: "Expired", tone: "slate" },
];

export const INVOICE_STATUSES: Option[] = [
  { value: "draft", label: "Draft", tone: "slate" },
  { value: "sent", label: "Sent", tone: "blue" },
  { value: "paid", label: "Paid", tone: "green" },
  { value: "void", label: "Void", tone: "slate" },
];

/** Shown in place of "Sent" when an unpaid invoice is past its due date. */
export const OVERDUE: Option = { value: "overdue", label: "Overdue", tone: "red" };

export function findOption(options: Option[], value: string | null | undefined) {
  return options.find((o) => o.value === value);
}

export function values(options: Option[]) {
  return options.map((o) => o.value) as [string, ...string[]];
}

export const DOCUMENT_KINDS: Option[] = [
  { value: "proposal", label: "Proposal", tone: "blue" },
  { value: "contract", label: "Contract", tone: "teal" },
];

export const DOCUMENT_STATUSES: Option[] = [
  { value: "draft", label: "Draft", tone: "slate" },
  { value: "sent", label: "Sent", tone: "blue" },
  { value: "accepted", label: "Accepted", tone: "green" },
  { value: "signed", label: "Signed", tone: "green" },
  { value: "declined", label: "Declined", tone: "red" },
  { value: "cancelled", label: "Cancelled", tone: "slate" },
];
