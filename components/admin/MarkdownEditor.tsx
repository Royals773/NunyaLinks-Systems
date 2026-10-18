"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import type { ActionState } from "@/lib/admin/forms";
import { SubmitButton } from "./ActionForm";
import MarkdownView from "./MarkdownView";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

/**
 * Edit a document's text (Markdown) with a live branded preview. Extra form
 * fields (title, status, hidden ids) are passed as children.
 */
export default function MarkdownEditor({
  action,
  initialBody,
  children,
  submitLabel = "Save",
}: {
  action: Action;
  initialBody: string;
  children?: ReactNode;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const [body, setBody] = useState(initialBody);
  const [savedBody, setSavedBody] = useState(initialBody);
  const [view, setView] = useState<"both" | "edit" | "preview">("both");
  const submitted = useRef(initialBody);
  const unsaved = body !== savedBody;

  // Only mark as saved once the server confirms it.
  useEffect(() => {
    if (state?.ok) setSavedBody(submitted.current);
  }, [state]);
  const unfilled = (body.match(/\[[^\]\n]{2,160}\]|\{\{\s*[a-z_.]+\s*\}\}/g) ?? []).length;

  return (
    <form
      action={formAction}
      onSubmit={() => {
        submitted.current = body;
      }}
    >
      {children}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Editor view" className="inline-flex rounded-md bg-slate-100 p-1 text-sm">
          {(["both", "edit", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded px-3 py-1 font-medium capitalize ${view === v ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}
            >
              {v === "both" ? "Side by side" : v}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {unfilled > 0 ? (
            <span className="font-semibold text-amber-700">{unfilled} highlighted item{unfilled === 1 ? "" : "s"} to fill in</span>
          ) : (
            "No placeholders left"
          )}
        </p>
      </div>

      <div className={`mt-3 grid gap-4 ${view === "both" ? "xl:grid-cols-2" : "grid-cols-1"}`}>
        <div className={view === "preview" ? "hidden" : ""}>
          <label htmlFor="body" className="sr-only">Document text</label>
          <textarea
            id="body"
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck
            className="h-[70vh] w-full resize-y rounded-md border border-slate-300 bg-white p-4 font-mono text-[13px] leading-relaxed text-ink focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <p className="mt-2 text-xs text-slate-500">
            Formatting: <code># Heading</code>, <code>## Section</code>, <code>**bold**</code>, <code>- bullet</code>,{" "}
            <code>1. numbered</code>, tables with <code>|</code>, and <code>---</code> for a new page when printed.
            Text in [square brackets] is highlighted as a reminder to fill it in.
          </p>
        </div>
        <div className={view === "edit" ? "hidden" : ""}>
          <div className="h-[70vh] overflow-y-auto rounded-md border border-slate-200 bg-white p-6 sm:p-8">
            <MarkdownView body={body} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        {unsaved && <span className="text-sm text-amber-700">Unsaved changes</span>}
        {state?.error && <p role="alert" className="text-sm font-medium text-red-700">{state.error}</p>}
        {!unsaved && state?.ok && <p role="status" className="text-sm font-medium text-emerald-700">{state.ok}</p>}
      </div>
    </form>
  );
}
