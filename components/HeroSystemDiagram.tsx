import {
  MessageCircle,
  Mail,
  FileSpreadsheet,
  Phone,
  Inbox,
  UserCheck,
  Database,
  BellRing,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp", rotate: "-rotate-2" },
  { icon: Mail, label: "Email", rotate: "rotate-1" },
  { icon: FileSpreadsheet, label: "Spreadsheet", rotate: "-rotate-1" },
  { icon: Phone, label: "Phone calls", rotate: "rotate-2" },
];

const OUTCOMES = [
  { icon: Inbox, label: "Captured" },
  { icon: UserCheck, label: "Assigned" },
  { icon: Database, label: "Recorded" },
  { icon: BellRing, label: "Followed up" },
];

/**
 * The site's signature visual device: a real operational concept, not
 * decoration. Left column shows four scattered intake channels (slightly
 * rotated "notes on a desk"); right column doesn't repeat those channels —
 * it shows what happens to every enquiry once it lands in one workflow,
 * regardless of which channel it came from. Purely illustrative, so it's
 * marked decorative — the same claim is already stated in the surrounding
 * copy.
 */
export default function HeroSystemDiagram() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-[0_1px_2px_rgba(18,25,43,0.06),0_16px_32px_-20px_rgba(18,25,43,0.25)]"
    >
      <div className="h-1.5 bg-accent" />

      <div className="grid grid-cols-1 gap-8 p-6 sm:grid-cols-[1.15fr_auto_1fr] sm:gap-5 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Right now
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {CHANNELS.map((channel) => (
              <div
                key={channel.label}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 ${channel.rotate}`}
              >
                <channel.icon
                  className="h-4 w-4 shrink-0 text-slate-500"
                  strokeWidth={2}
                />
                <span className="text-sm font-medium text-slate-600">
                  {channel.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Four channels, four places to lose track of an enquiry.
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-2 py-1 sm:flex-col sm:gap-1.5 sm:py-0">
          <div className="h-px w-8 bg-ink/15 sm:h-8 sm:w-px" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/5">
            <ArrowDown className="h-4 w-4 text-accent sm:hidden" />
            <ArrowRight className="hidden h-4 w-4 text-accent sm:block" />
          </span>
          <div className="h-px w-8 bg-ink/15 sm:h-8 sm:w-px" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            With NunyaLink
          </p>
          <div className="relative mt-4 pl-1">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-accent/40" />
            <ul className="space-y-2.5">
              {OUTCOMES.map((outcome) => (
                <li
                  key={outcome.label}
                  className="relative flex items-center gap-3"
                >
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent-light">
                    <outcome.icon
                      className="h-3.5 w-3.5 text-accent-dark"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium text-ink">
                    {outcome.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-ink px-4 py-3">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-accent-light"
              strokeWidth={2}
            />
            <span className="text-sm font-semibold leading-snug text-white">
              One system, nothing missed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
