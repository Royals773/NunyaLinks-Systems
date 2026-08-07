"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyEmailButtonProps {
  email: string;
  className?: string;
}

/**
 * Fallback for mailto: links, which silently do nothing if the visitor's
 * browser/OS has no default mail client configured (common for anyone
 * using webmail in a browser tab). Copies the address to the clipboard
 * instead, with a brief visible + screen-reader confirmation.
 */
export default function CopyEmailButton({
  email,
  className = "",
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — no further
      // fallback; the visible email text next to this button is still
      // manually selectable and copyable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-current underline decoration-dotted underline-offset-2 ${className}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </button>
  );
}
