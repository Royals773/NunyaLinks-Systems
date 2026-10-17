// FormData helpers for admin Server Actions.

export type ActionState = { error?: string; ok?: string } | null;

export function text(form: FormData, key: string, max = 20000): string | null {
  const raw = form.get(key);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function required(form: FormData, key: string, label: string, max = 200): string {
  const value = text(form, key, max);
  if (!value) throw new FormError(`${label} is required.`);
  return value;
}

export function oneOf(form: FormData, key: string, allowed: readonly string[], fallback: string) {
  const value = text(form, key, 50);
  return value && allowed.includes(value) ? value : fallback;
}

export function date(form: FormData, key: string): string | null {
  const value = text(form, key, 10);
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

/** "1,250.50" → 125050 pence. Empty → null. */
export function pence(form: FormData, key: string): number | null {
  const value = text(form, key, 20);
  if (!value) return null;
  const n = Number(value.replace(/[£,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) throw new FormError("Enter a valid amount, e.g. 1250.00");
  return Math.round(n * 100);
}

export function decimal(form: FormData, key: string, fallback: number, min = 0, max = 1_000_000) {
  const value = text(form, key, 20);
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new FormError(`Enter a number between ${min} and ${max}.`);
  return Math.round(n * 100) / 100;
}

export function uuid(form: FormData, key: string): string | null {
  const value = text(form, key, 40);
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

export class FormError extends Error {}

/** Turns thrown FormErrors and database errors into a message for the form. */
export function toState(error: unknown): ActionState {
  if (error instanceof FormError) return { error: error.message };
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message.includes("violates row-level security")) {
      return { error: "You don't have permission to do that." };
    }
    if (message.includes("violates foreign key constraint")) {
      return { error: "This record is still linked to other records." };
    }
    return { error: "Something went wrong saving that. Please try again." };
  }
  return { error: "Something went wrong. Please try again." };
}
