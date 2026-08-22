import { z } from "zod";

// Copied verbatim from HOURS_OPTIONS in lib/audit.ts (sourced from
// components/AuditForm.tsx's hours-per-week select). These are the only
// values the website form can ever submit — keep this list in sync with
// that source, character-for-character (note the en dashes, not hyphens).
export const HOURS_PER_WEEK_BANDS = [
  "Under 5",
  "5–10",
  "10–20",
  "20+",
  "Not sure",
] as const;

export const HoursPerWeekBandSchema = z.enum(HOURS_PER_WEEK_BANDS);

export type HoursPerWeekBand = z.infer<typeof HoursPerWeekBandSchema>;

export type Priority = "High" | "Medium" | "Standard";

// Deterministic, exhaustive mapping — never influenced by model output.
// Typing this as Record<HoursPerWeekBand, Priority> means adding a band to
// HOURS_PER_WEEK_BANDS without adding it here fails to compile, forcing an
// intentional priority decision for every band.
const PRIORITY_BY_HOURS_BAND: Record<HoursPerWeekBand, Priority> = {
  "Under 5": "Standard",
  "5–10": "Medium",
  "10–20": "High",
  "20+": "High",
  "Not sure": "Standard",
};

export function calculatePriority(hoursPerWeek: HoursPerWeekBand): Priority {
  return PRIORITY_BY_HOURS_BAND[hoursPerWeek];
}
