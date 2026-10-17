"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/admin/forms";
import { buttonClass } from "./ui";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

/**
 * A form wired to a Server Action that shows the action's error or success
 * message inline. Successful create actions usually redirect instead.
 */
export function ActionForm({
  action,
  children,
  className = "",
  submitLabel,
  submitVariant = "primary",
  confirm,
  resetOnSuccess = false,
}: {
  action: Action;
  children?: ReactNode;
  className?: string;
  submitLabel: string;
  submitVariant?: "primary" | "secondary" | "danger";
  /** If set, asks the user to confirm before submitting. */
  confirm?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} variant={submitVariant} />
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            {state.ok}
          </p>
        )}
      </div>
    </form>
  );
}

export function SubmitButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant)}>
      {pending ? "Saving…" : label}
    </button>
  );
}

/** Compact one-button form, e.g. "Delete" or "Mark as paid". */
export function InlineAction({
  action,
  label,
  variant = "secondary",
  confirm,
  hidden,
}: {
  action: Action;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  confirm?: string;
  hidden?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      className="inline-flex flex-col items-start"
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton label={label} variant={variant} />
      {state?.error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
