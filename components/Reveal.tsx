"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms, useful for grids of cards. */
  delay?: number;
}

type RevealState = "plain" | "pending" | "revealed";

// useLayoutEffect warns when it runs during actual SSR (no DOM to measure
// against). It's only ever needed here once hydrated in the browser, so
// fall back to the no-op-on-server useEffect during the server render.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Fades + slides content in once it scrolls into view — but content is
 * visible by default (SSR, no-JS, and the first client render all render
 * plain, matching each other exactly). Only once we've synchronously
 * confirmed, client-side and before the browser paints, that an element
 * starts below the fold do we hide it and hand it off to an
 * IntersectionObserver to reveal later. Above-the-fold content (a page's
 * hero band, for example) is detected as already visible on mount and
 * never depends on JavaScript or an observer to be readable — if JS
 * fails or is slow, everything stays visible.
 */
export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("plain");

  // Runs synchronously before paint, so an off-screen element is hidden
  // before the browser ever shows it — no flash of visible-then-hidden.
  // Elements already in view, or when IntersectionObserver isn't
  // available at all, are left in the default visible "plain" state.
  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const rect = node.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!alreadyInView) setState("pending");
  }, []);

  useEffect(() => {
    if (state !== "pending") return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [state]);

  return (
    <div
      ref={ref}
      className={`${state === "pending" ? "reveal-init" : state === "revealed" ? "animate-reveal" : ""} ${className}`}
      style={state === "revealed" ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
