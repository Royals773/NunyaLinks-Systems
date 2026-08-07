"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        Something went wrong
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        We hit a snag loading this page.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-slate-600">
        Please try again. If the problem keeps happening, get in touch and
        we&rsquo;ll take a look.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy-dark"
      >
        Try again
      </button>
    </main>
  );
}
