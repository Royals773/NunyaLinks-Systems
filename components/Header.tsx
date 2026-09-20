"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

// Homepage-section links are prefixed with "/" so they work correctly
// from any route, not just when already on the homepage. Work and
// Products are real routes (not homepage anchors), so they get an
// active state based on the current pathname — see isActive below.
const NAV_LINKS = [
  { label: "What We Do", href: "/#what-we-do" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Packages", href: "/#packages" },
  { label: "Why NunyaLink", href: "/#why-nunyalink" },
  { label: "Work", href: "/work" },
  { label: "Products", href: "/products" },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Real routes (not homepage anchors) get an active nav state. */
function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trap focus inside the open mobile menu and close it on Escape,
  // returning focus to the toggle button.
  useEffect(() => {
    if (!menuOpen) return;

    const menu = menuRef.current;
    const focusables = menu
      ? Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    focusables[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        toggleButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) return;

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
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur transition-all duration-300 ${
        scrolled ? "border-slate-200 shadow-sm" : "border-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <Link href="/" aria-label="NunyaLink Systems — home">
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-6 xl:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active = !link.href.includes("#") && isActiveRoute(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium tracking-tight transition-colors hover:text-ink ${
                  active ? "text-ink" : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/#contact"
          className="hidden whitespace-nowrap rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy xl:inline-block"
        >
          Book a Free Opportunity Review
        </Link>

        <button
          ref={toggleButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-md p-2 text-ink xl:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          ref={menuRef}
          aria-label="Primary"
          className="border-t border-slate-200 bg-white px-4 pb-4 xl:hidden"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => {
              const active = !link.href.includes("#") && isActiveRoute(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-2.5 text-base font-medium hover:bg-slate-50 hover:text-ink ${
                      active ? "text-ink" : "text-slate-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/#contact"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md bg-ink px-3 py-3 text-center text-base font-semibold text-white hover:bg-navy"
              >
                Book a Free Opportunity Review
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
