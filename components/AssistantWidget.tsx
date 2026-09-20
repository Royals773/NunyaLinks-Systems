"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Send, Loader2, ArrowRight } from "lucide-react";
import { AssistantAvatar } from "./AssistantAvatar";
import {
  CLIENT_TIMEOUT_MS,
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES,
  type ChatMessage,
} from "@/lib/assistant-limits";

const STARTER_PROMPTS = [
  "What does NunyaLink automate?",
  "Which service might fit me?",
  "How does the free review work?",
];

const GENERIC_RETRY_ERROR = "Something went wrong. Please try again.";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Status = "idle" | "sending" | "error";

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<ChatMessage[] | null>(null);
  const pendingReviewFocusRef = useRef(false);
  // Belt-and-suspenders against a double-submit: set synchronously the
  // instant a send starts (before any state update/re-render lands), so
  // two rapid-fire triggers in the same tick — e.g. Enter plus a stray
  // click event — can't both pass the guard in sendMessage().
  const isSendingRef = useRef(false);
  // The launcher button unmounts while the panel is open (it's only
  // rendered when `!open`), so launcherRef.current is null at the moment
  // Escape/close fires — focusing it has to wait for the re-render that
  // brings it back, hence this flag + the effect below rather than a
  // direct .focus() call inline.
  const focusLauncherOnCloseRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();

  // Focus the close button on open, trap Tab inside the panel, and close
  // on Escape — mirrors the same pattern used by the mobile nav menu in
  // components/Header.tsx.
  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        focusLauncherOnCloseRef.current = true;
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      const focusables = panel
        ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        : [];
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    const el = messageListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // If "Book a Free Opportunity Review" was used from a page other than
  // the homepage, finish the job once the client-side navigation to "/" lands.
  useEffect(() => {
    if (pathname === "/" && pendingReviewFocusRef.current) {
      pendingReviewFocusRef.current = false;
      focusReviewForm();
    }
  }, [pathname]);

  // Runs after the panel has actually closed and the launcher has
  // re-mounted, so the ref is populated by the time this fires.
  useEffect(() => {
    if (!open && focusLauncherOnCloseRef.current) {
      focusLauncherOnCloseRef.current = false;
      launcherRef.current?.focus();
    }
  }, [open]);

  function focusReviewForm() {
    requestAnimationFrame(() => {
      const heading = document.getElementById("contact-heading");
      const firstField = document.getElementById("fullName");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      heading?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      firstField?.focus({ preventScroll: true });
    });
  }

  function handleBookReview() {
    setOpen(false);
    if (pathname === "/") {
      focusReviewForm();
    } else {
      pendingReviewFocusRef.current = true;
      router.push("/#contact");
    }
  }

  async function doSend(nextMessages: ChatMessage[]) {
    setErrorMessage(null);
    setStatus("sending");
    lastRequestRef.current = nextMessages;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || typeof result?.reply !== "string") {
        setErrorMessage(result?.error ?? GENERIC_RETRY_ERROR);
        setStatus("error");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
      lastRequestRef.current = null;
      setStatus("idle");
    } catch {
      setErrorMessage(GENERIC_RETRY_ERROR);
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      isSendingRef.current = false;
    }
  }

  function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isSendingRef.current || messages.length >= MAX_MESSAGES) return;

    isSendingRef.current = true;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    void doSend(nextMessages);
  }

  function retry() {
    if (!lastRequestRef.current || isSendingRef.current) return;
    isSendingRef.current = true;
    void doSend(lastRequestRef.current);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleComposerKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  const atMessageLimit = messages.length >= MAX_MESSAGES;
  const canSend =
    input.trim().length > 0 &&
    input.length <= MAX_MESSAGE_LENGTH &&
    status !== "sending" &&
    !atMessageLimit;

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open NunyaLink AI assistant"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-colors hover:bg-navy sm:bottom-6 sm:right-6"
        >
          <AssistantAvatar className="h-9 w-9" />
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-heading"
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-ink/10 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:rounded-2xl"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
            <div>
              <p
                id="assistant-heading"
                className="font-display text-lg font-semibold text-navy"
              >
                Ask NunyaLink
              </p>
              <span className="mt-1 inline-block rounded-full bg-accent-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-dark">
                AI assistant
              </span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => {
                focusLauncherOnCloseRef.current = true;
                setOpen(false);
              }}
              aria-label="Close NunyaLink AI assistant"
              className="-m-1.5 shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div
            ref={messageListRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-busy={status === "sending"}
            aria-label="Conversation with NunyaLink's AI assistant"
            className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
          >
            <div className="flex max-w-[85%] items-start gap-2">
              <AssistantAvatar className="mt-0.5 h-6 w-6" />
              <div className="min-w-0 flex-1 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                Hello — I&rsquo;m NunyaLink&rsquo;s AI assistant. I can answer
                questions about what NunyaLink does, help you work out which
                service might fit, and point you to the free Automation
                Opportunity Review when you&rsquo;re ready.
              </div>
            </div>

            {messages.length === 0 && (
              <div className="flex flex-col gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:border-accent/40 hover:bg-accent-light/40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="flex justify-end">
                  <p className="max-w-[85%] rounded-lg rounded-br-sm bg-ink px-3.5 py-2.5 text-sm leading-relaxed text-white">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={index} className="flex max-w-[85%] items-start gap-2">
                  <AssistantAvatar className="mt-0.5 h-6 w-6" />
                  <p className="min-w-0 flex-1 rounded-lg rounded-bl-sm bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
                    {message.content}
                  </p>
                </div>
              )
            )}

            {status === "sending" && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="flex flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
              >
                <span>{errorMessage}</span>
                {lastRequestRef.current && (
                  <button
                    type="button"
                    onClick={retry}
                    className="font-semibold underline decoration-dotted underline-offset-2 hover:text-red-800"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-ink/10 px-5 py-3.5">
            <button
              type="button"
              onClick={handleBookReview}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-accent/30 bg-accent-light/40 px-3.5 py-2 text-sm font-semibold text-accent-dark transition-colors hover:bg-accent-light"
            >
              Book a Free Opportunity Review
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            {atMessageLimit ? (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                This conversation has reached its limit. Reload the page to
                start a new one, or use the Automation Opportunity Review
                form above.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
                <label htmlFor="assistant-input" className="sr-only">
                  Message NunyaLink&rsquo;s AI assistant
                </label>
                <textarea
                  id="assistant-input"
                  rows={1}
                  value={input}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask a question…"
                  disabled={status === "sending"}
                  className="block max-h-28 w-full flex-1 resize-none rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy shadow-sm transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
