import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationStatusForm } from "./_components/ApplicationStatusForm";
import { BackButton } from "./_components/BackButton";

export const metadata: Metadata = {
  title: "Check Application Status",
  description:
    "Track your membership application progress and interview schedule.",
};

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-md">
      <div className="animate-pulse space-y-8 rounded-xl border border-white/10 bg-slate-800/50 p-8 shadow-xl">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-6 w-48 rounded bg-slate-700" />
          <div className="mx-auto h-4 w-64 rounded bg-slate-700" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-700" />
            <div className="h-12 w-full rounded bg-slate-700" />
          </div>
          <div className="h-12 w-full rounded bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function CheckApplicationStatusPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0B1120] text-slate-100 lg:h-screen lg:overflow-hidden">
      {/* Back Button */}
      <BackButton />

      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="container relative flex w-full flex-1 flex-col items-center justify-center px-4 py-12 lg:h-full">
        <div className="mb-8 flex w-full max-w-4xl flex-col items-center justify-center text-center lg:mb-12">
          {/* Title */}
          <h1 className="w-full items-center justify-center text-center font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl">
            <span className="block text-white">Check Application</span>
            <span className="block text-cyan-400">Status</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 w-full max-w-2xl text-center font-light text-base text-slate-400 leading-relaxed sm:text-lg">
            Track your membership application progress and view your interview
            schedule in real-time.
          </p>
        </div>

        {/* Form Section */}
        <div className="relative z-10 w-full">
          <Suspense fallback={<FormSkeleton />}>
            <ApplicationStatusForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
