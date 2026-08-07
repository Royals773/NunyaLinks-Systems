import { Mail } from "lucide-react";
import { Logo } from "./Logo";
import { ENQUIRIES_EMAIL, ENQUIRIES_MAILTO } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark py-10 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div>
          <Logo
            className="justify-center sm:justify-start"
            primaryTextClassName="text-white"
          />
          <p className="mt-2 text-sm text-slate-400">
            Automate the busywork. Run the business.
          </p>
          <a
            href={ENQUIRIES_MAILTO}
            className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white sm:justify-start"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {ENQUIRIES_EMAIL}
          </a>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm">
          <a href="#what-we-do" className="hover:text-white">
            What We Do
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How It Works
          </a>
          <a href="#packages" className="hover:text-white">
            Packages
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </nav>
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {year} NunyaLink Systems. All rights reserved.
      </p>
    </footer>
  );
}
