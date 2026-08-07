// Shared types and option lists for the audit request form + API route.

export const INDUSTRY_OPTIONS = [
  "Recruitment & staffing",
  "Care & healthcare",
  "Retail, wholesale & e-commerce",
  "Fashion & creative",
  "Beauty & wellness",
  "Catering & events",
  "Professional services",
  "Training & education",
  "Other",
] as const;

export const EMPLOYEE_OPTIONS = ["1–5", "6–10", "11–25", "26–50", "50+"] as const;

export const HOURS_OPTIONS = [
  "Under 5",
  "5–10",
  "10–20",
  "20+",
  "Not sure",
] as const;

export const CONTACT_METHOD_OPTIONS = ["Email", "Phone", "Either"] as const;

export interface AuditRequestPayload {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  employees: string;
  process: string;
  hoursPerWeek: string;
  contactMethod: string;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fields that must be non-empty for a submission to be valid. */
export const REQUIRED_FIELDS: (keyof AuditRequestPayload)[] = [
  "fullName",
  "businessName",
  "email",
  "process",
];

/** Per-field character caps applied server-side before use. */
export const FIELD_MAX_LENGTHS: Record<keyof AuditRequestPayload, number> = {
  fullName: 200,
  businessName: 200,
  email: 320,
  phone: 40,
  location: 200,
  industry: 100,
  employees: 20,
  process: 4000,
  hoursPerWeek: 20,
  contactMethod: 20,
};

/**
 * Name of the honeypot field sent alongside the real payload. Real users
 * never see or fill it (it's visually and semantically hidden); bots that
 * fill every field on a form will populate it. Shared here so the client
 * and server agree on the field name without duplicating the literal.
 */
export const HONEYPOT_FIELD_NAME = "website";

/** Trims and length-caps every field. Never trust client-side trimming alone. */
export function sanitizeAuditPayload(
  payload: Partial<Record<keyof AuditRequestPayload, unknown>>
): AuditRequestPayload {
  const result = {} as AuditRequestPayload;
  for (const field of Object.keys(FIELD_MAX_LENGTHS) as Array<
    keyof AuditRequestPayload
  >) {
    const raw = payload[field];
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    result[field] = trimmed.slice(0, FIELD_MAX_LENGTHS[field]);
  }
  return result;
}

export function validateAuditPayload(
  payload: Partial<AuditRequestPayload>
): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (!payload[field] || !payload[field]?.toString().trim()) {
      return "Please fill in all required fields.";
    }
  }
  if (!EMAIL_REGEX.test(payload.email ?? "")) {
    return "Please enter a valid email address.";
  }
  return null;
}
