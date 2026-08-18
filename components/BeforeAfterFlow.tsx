import {
  MessageCircle,
  FileSpreadsheet,
  Clock,
  XCircle,
  Inbox,
  Database,
  BellRing,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

interface FlowStep {
  icon: typeof MessageCircle;
  title: string;
  description: string;
}

const BEFORE_STEPS: FlowStep[] = [
  {
    icon: MessageCircle,
    title: "Enquiry comes in",
    description: "By WhatsApp, email or a phone call — wherever it lands.",
  },
  {
    icon: FileSpreadsheet,
    title: "Someone copies it into a spreadsheet",
    description: "If they remember to, and if they have a spare minute.",
  },
  {
    icon: Clock,
    title: "A reminder, eventually",
    description: "Whenever someone next has time to check.",
  },
  {
    icon: XCircle,
    title: "Follow-up gets missed",
    description: "The lead goes cold. No one notices until it's too late.",
  },
];

const AFTER_STEPS: FlowStep[] = [
  {
    icon: Inbox,
    title: "Enquiry comes in",
    description: "From any channel, captured automatically the moment it lands.",
  },
  {
    icon: Database,
    title: "Logged automatically, in one place",
    description: "No re-typing, nothing missed, nothing left to memory.",
  },
  {
    icon: BellRing,
    title: "Your team is notified instantly",
    description: "Follow-up goes out on schedule, every time.",
  },
  {
    icon: LayoutDashboard,
    title: "It's on one dashboard",
    description: "You can see exactly where every enquiry stands, always.",
  },
];

function FlowColumn({
  label,
  steps,
  tone,
}: {
  label: string;
  steps: FlowStep[];
  tone: "before" | "after";
}) {
  const isAfter = tone === "after";
  return (
    <div className="flex-1">
      <p
        className={`mb-6 text-xs font-semibold uppercase tracking-widest ${
          isAfter ? "text-accent" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <div className="relative">
        <div
          aria-hidden="true"
          className={`absolute left-5 top-5 bottom-5 w-px ${
            isAfter ? "bg-signal/40" : "bg-slate-300"
          }`}
        />
        <ol className="space-y-7">
          {steps.map((step, i) => {
            const isFinal = i === steps.length - 1;
            return (
              <li key={step.title} className="relative flex gap-4">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    isAfter
                      ? isFinal
                        ? "border-signal bg-signal-light text-signal"
                        : "border-accent bg-white text-accent"
                      : isFinal
                        ? "border-red-300 bg-red-50 text-red-400"
                        : "border-slate-300 bg-white text-slate-400"
                  }`}
                  aria-hidden="true"
                >
                  <step.icon className="h-4.5 w-4.5" />
                </div>
                <div className="pt-1.5">
                  <p
                    className={`text-sm font-semibold ${
                      isAfter ? "text-navy" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/**
 * The site's one flagship diagram: makes "we automate the busywork" concrete
 * by showing the same enquiry handled two ways. Two independent node chains
 * (not a branching diagram) so it reads clearly at a glance, including on
 * narrow screens where the columns stack.
 */
export default function BeforeAfterFlow() {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-stretch gap-10 sm:flex-row sm:items-start sm:gap-6">
        <FlowColumn label="Without NunyaLink" steps={BEFORE_STEPS} tone="before" />

        <div
          className="flex shrink-0 flex-row items-center justify-center gap-2 py-1 sm:flex-col sm:justify-start sm:pt-16"
          aria-hidden="true"
        >
          <ArrowDown className="h-5 w-5 text-slate-300 sm:hidden" />
          <ArrowRight className="hidden h-5 w-5 text-slate-300 sm:block" />
        </div>

        <FlowColumn label="With NunyaLink" steps={AFTER_STEPS} tone="after" />
      </div>
    </div>
  );
}
