import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import type { WorkItem } from "@/lib/work";

interface WorkCardProps {
  item: WorkItem;
  className?: string;
}

export default function WorkCard({ item, className = "" }: WorkCardProps) {
  return (
    <li
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div
        className="flex h-36 flex-col items-center justify-center gap-1.5 border-b border-dashed border-slate-300 bg-slate-50 text-slate-400"
        aria-hidden="true"
      >
        <ImageOff className="h-6 w-6" />
        <p className="text-xs">Product visual to be added</p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark">
            {item.type}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {item.statusLabel}
          </span>
        </div>

        <h3 className="mt-4 text-xl font-bold text-navy">
          <Link href={`/work/${item.slug}`} className="hover:text-accent">
            {item.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
          {item.summary}
        </p>

        <Link
          href={`/work/${item.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-accent"
        >
          See the full story
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}
