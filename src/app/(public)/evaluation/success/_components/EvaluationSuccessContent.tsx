import { CheckCircle2, Download, ImagePlus, ScrollText } from "lucide-react";
import { EvaluationSuccessActions } from "./EvaluationSuccessActions";

interface EvaluationSuccessContentProps {
  eventTitle: string | null;
}

export function EvaluationSuccessContent({
  eventTitle,
}: EvaluationSuccessContentProps) {
  return (
    <main className="mt-15 min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl space-y-5 rounded-3xl border border-emerald-500/15 bg-card p-6 shadow-emerald-500/5 shadow-xl sm:p-10">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative mt-0.5 shrink-0">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md" />
            <div className="relative rounded-full bg-linear-to-br from-emerald-400/20 to-emerald-600/20 p-2.5 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
              Evaluation Submitted Successfully
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Thank you for completing your event evaluation.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />

        {/* Event Title Block */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500/10 via-emerald-500/[0.07] to-transparent p-5 ring-1 ring-emerald-500/25 sm:p-6">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative space-y-1.5">
            <p className="font-semibold text-emerald-600 text-xs uppercase tracking-widest dark:text-emerald-400">
              Successfully Evaluated Event
            </p>
            {eventTitle ? (
              <p className="font-bold text-foreground text-xl leading-snug sm:text-2xl">
                {eventTitle}
              </p>
            ) : (
              <p className="font-semibold text-base text-foreground sm:text-lg">
                Event details are currently unavailable.
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-base text-foreground sm:text-lg">
            Certificate Claim Instructions
          </h2>
          <ul className="space-y-4">
            {[
              {
                icon: ImagePlus,
                text: "Take a screenshot of this confirmation page as your evaluation proof.",
              },
              {
                icon: Download,
                text: "Save the screenshot on your phone or device so it is ready to present.",
              },
              {
                icon: ScrollText,
                text: "Show your evaluation proof to the secretariat to receive your certificate.",
              },
            ].map(({ icon: Icon, text }) => (
              <li className="flex items-start gap-4" key={text}>
                <div className="flex shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed sm:text-base">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <EvaluationSuccessActions />
      </section>
    </main>
  );
}
