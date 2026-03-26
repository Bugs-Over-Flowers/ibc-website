"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function EvaluationSuccessActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden",
          "rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-sm text-white shadow-emerald-500/20 shadow-md",
          "transition-all duration-200 hover:-translate-y-px hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:shadow-lg",
          "active:translate-y-0 active:shadow-sm",
          "sm:flex-1",
        )}
        href="/events"
      >
        {/* shine sweep on hover */}
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Go Back to Events
      </Link>
    </div>
  );
}
