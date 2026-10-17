"use client";

import { useActionState } from "react";
import { sendMagicLink } from "@/lib/admin/actions/session";
import { SubmitButton } from "@/components/admin/ActionForm";
import { inputClass } from "@/components/admin/ui";

export default function LoginForm() {
  const [state, formAction] = useActionState(sendMagicLink, null);

  if (state?.ok) {
    return (
      <p role="status" className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
        {state.ok}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <SubmitButton label="Email me a sign-in link" />
    </form>
  );
}
