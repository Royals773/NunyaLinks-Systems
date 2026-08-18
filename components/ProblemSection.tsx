import {
  MessageSquareWarning,
  FileStack,
  BellRing,
  UserPlus,
  Repeat,
  ClipboardX,
} from "lucide-react";
import Reveal from "./Reveal";

const PAIN_POINTS = [
  {
    icon: MessageSquareWarning,
    text: "Chasing enquiries and following up leads by hand",
  },
  {
    icon: FileStack,
    text: "Re-typing the same information across apps and spreadsheets",
  },
  {
    icon: BellRing,
    text: "Manually reminding people about payments, documents or deadlines",
  },
  {
    icon: UserPlus,
    text: "Onboarding staff or customers through slow, inconsistent steps",
  },
  {
    icon: Repeat,
    text: "Copying data between messaging apps, email and records",
  },
  {
    icon: ClipboardX,
    text: "Reporting that only happens when someone finds the time",
  },
];

export default function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="bg-slate-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2
            id="problem-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            Your team is spending hours on work a system could do for free.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            The signs are familiar in almost every growing business:
          </p>
        </Reveal>

        <ul className="mx-auto mt-12 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
          {PAIN_POINTS.map((point, i) => (
            <Reveal key={point.text} delay={i * 50}>
              <li className="flex items-center gap-4 py-4">
                <point.icon
                  className="h-5 w-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span className="text-sm leading-relaxed text-slate-700 sm:text-base">
                  {point.text}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-lg font-medium leading-relaxed text-navy">
            Every hour spent here is an hour not spent serving customers or
            growing. NunyaLink builds automations that do this work for you —
            reliably, every time, without being asked.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
