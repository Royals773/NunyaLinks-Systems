import { ChevronRight, ChevronDown } from "lucide-react";
import type { WorkStep } from "@/lib/work";

interface WorkflowStripProps {
  steps: WorkStep[];
}

/**
 * A single horizontal node chain (as opposed to HowItWorks' vertical
 * numbered list, or BeforeAfterFlow's two parallel chains) — this project
 * only has one real process to show, read left-to-right on wider screens
 * and top-to-bottom on mobile.
 */
export default function WorkflowStrip({ steps }: WorkflowStripProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-2">
      {steps.map((step, i) => (
        <div key={step.title} className="flex flex-1 sm:flex-col">
          <div className="flex flex-col items-start gap-4 sm:flex-1 sm:items-center sm:text-center">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-navy bg-white text-base font-bold text-navy"
              aria-hidden="true"
            >
              {i + 1}
            </div>
            <div className="sm:px-2">
              <h3 className="text-base font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </div>
          </div>

          {i < steps.length - 1 && (
            <div
              className="flex items-center justify-center py-2 sm:py-0 sm:pt-5"
              aria-hidden="true"
            >
              <ChevronDown className="h-5 w-5 text-slate-300 sm:hidden" />
              <ChevronRight className="hidden h-5 w-5 text-slate-300 sm:block" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
