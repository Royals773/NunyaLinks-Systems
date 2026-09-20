import { Fragment } from "react";
import {
  Inbox,
  BellRing,
  UserCheck,
  LayoutDashboard,
  AlertCircle,
  Workflow,
  TrendingUp,
  ArrowRight,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";

interface Example {
  icon: LucideIcon;
  title: string;
  problem: string;
  system: string;
  outcome: string;
}

const EXAMPLES: Example[] = [
  {
    icon: Inbox,
    title: "Enquiry capture & follow-up",
    problem:
      "Enquiries land by phone, form and WhatsApp, and follow-up depends on someone remembering.",
    system:
      "Every enquiry lands in one place automatically, with follow-up triggered on schedule.",
    outcome: "Nothing sits untouched, and nothing depends on memory.",
  },
  {
    icon: BellRing,
    title: "Payment & document reminders",
    problem:
      "Chasing overdue invoices or missing paperwork usually falls to whoever has time that week.",
    system:
      "Reminders go out automatically, escalate if there's no response, and stop once resolved.",
    outcome: "Fewer late payments, less awkward chasing.",
  },
  {
    icon: UserCheck,
    title: "Staff & client onboarding",
    problem:
      "Onboarding means the same forms and steps, assembled slightly differently every time.",
    system:
      "A fixed sequence of steps and documents fires automatically the moment someone's added.",
    outcome: "Every onboarding looks the same, and nothing gets missed.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard for the business",
    problem:
      "Knowing how the business is really running means pulling numbers from several places.",
    system:
      "Key numbers from your existing tools, pulled into one view, updated automatically.",
    outcome: "Less time compiling reports, more time acting on them.",
  },
];

const STAGES: {
  key: keyof Pick<Example, "problem" | "system" | "outcome">;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "problem", label: "The problem", icon: AlertCircle },
  { key: "system", label: "What we'd build", icon: Workflow },
  { key: "outcome", label: "The outcome", icon: TrendingUp },
];

export default function ExampleSystems() {
  return (
    <section
      id="example-systems"
      aria-labelledby="example-systems-heading"
      className="bg-white py-14 sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="example-systems-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            What This Could Look Like
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A few examples of the kind of system NunyaLink could build.
          </p>
          <p className="mt-2 text-sm font-medium italic text-slate-500">
            Illustrative examples — not a list of completed client projects
          </p>
        </Reveal>

        <div className="mt-14 divide-y divide-slate-200 border-y border-slate-200">
          {EXAMPLES.map((example, i) => (
            <Reveal key={example.title} delay={i * 50}>
              <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-[13rem_1fr] sm:gap-8">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-navy text-navy"
                    aria-hidden="true"
                  >
                    <example.icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-navy">
                    {example.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
                  {STAGES.map((stage, si) => (
                    <Fragment key={stage.key}>
                      <div className="flex flex-col gap-1 sm:flex-1">
                        <div className="flex items-center gap-1.5">
                          <stage.icon
                            className="h-3.5 w-3.5 text-accent"
                            aria-hidden="true"
                          />
                          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                            {stage.label}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {example[stage.key]}
                        </p>
                      </div>
                      {si < STAGES.length - 1 && (
                        <div
                          className="flex shrink-0 items-center justify-center py-1 sm:pt-6"
                          aria-hidden="true"
                        >
                          <ArrowDown className="h-4 w-4 text-slate-300 sm:hidden" />
                          <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
