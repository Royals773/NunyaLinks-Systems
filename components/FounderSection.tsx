import { UserRound, Briefcase, Workflow, Store } from "lucide-react";
import Reveal from "./Reveal";

// The narrative below is written from copy already verified and approved
// elsewhere on this site (ProblemSection's pain points, WhyUs's ROI claim,
// WhoWeWorkWith's closing line, HowItWorks step 1) — it adds texture to an
// already-approved claim, not new facts. Founder name and title are
// verified; the photo is still a placeholder pending a real image — see
// the placeholder marker below.
const THEMES = [
  {
    icon: Briefcase,
    title: "Operational experience",
    description:
      "We've run the kind of business these workflows come from, not just studied them from outside.",
  },
  {
    icon: Workflow,
    title: "Practical systems thinking",
    description:
      "We think in workflows and outcomes first, then decide what tooling actually earns its place.",
  },
  {
    icon: Store,
    title: "SME-focused implementation",
    description:
      "Built and priced for small teams — not scaled down from an enterprise product.",
  },
];

export default function FounderSection() {
  return (
    <section
      aria-labelledby="founder-heading"
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid grid-cols-1 items-start gap-10 sm:grid-cols-[15rem_1fr] sm:gap-12">
          <div className="mx-auto flex aspect-square w-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 sm:mx-0 sm:w-full">
            <UserRound className="h-9 w-9" aria-hidden="true" />
            <p className="px-4 text-center text-xs leading-relaxed">
              Founder photo — to be added
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Who&rsquo;s behind NunyaLink
            </p>
            <h2
              id="founder-heading"
              className="font-display mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl"
            >
              We come from running real operations, not just building tech.
            </h2>

            <div className="mt-5 space-y-4 max-w-2xl text-base leading-relaxed text-slate-600">
              <p>
                NunyaLink is built by operators, not just developers. Before
                this became a business that builds automations, it was
                people running businesses that needed them — chasing
                enquiries, reminding people about payments, onboarding staff
                through inconsistent steps, and copying the same information
                between apps because there wasn&rsquo;t time to fix it
                properly.
              </p>
              <p>
                That&rsquo;s the perspective NunyaLink builds from: not
                &ldquo;what feature could we add&rdquo;, but &ldquo;what is
                actually costing this business time, and is it worth
                fixing&rdquo;. It&rsquo;s why every engagement starts with a
                review of the real process, not a pitch for a platform.
              </p>
              <p>
                If you&rsquo;re running a people-driven, compliance-heavy
                business and recognise the signs — the missed follow-ups,
                the manual reminders, the reporting that only happens when
                someone finds the time — that&rsquo;s exactly the kind of
                problem NunyaLink was built to solve.
              </p>
            </div>

            <p className="mt-5 text-base">
              <span className="font-semibold text-navy">
                Courage Atsu Sewonyadzi
              </span>
              <span className="text-slate-500">
                {" "}
                — Founder, NunyaLink Systems
              </span>
            </p>

            <ul className="mt-9 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-slate-200 pt-7 sm:grid-cols-3">
              {THEMES.map((theme) => (
                <li key={theme.title}>
                  <theme.icon
                    className="h-5 w-5 text-accent"
                    aria-hidden="true"
                  />
                  <h3 className="mt-2.5 text-sm font-semibold leading-snug text-navy">
                    {theme.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {theme.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
