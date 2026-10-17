"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-navy"
    >
      Print or save as PDF
    </button>
  );
}
