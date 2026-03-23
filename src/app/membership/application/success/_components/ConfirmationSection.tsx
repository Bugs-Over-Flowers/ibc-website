import { Mail } from "lucide-react";

export function ConfirmationSection() {
  return (
    <div className="rounded-2xl bg-card/50 bg-linear-to-br p-6 ring-1 ring-border/25 sm:p-8">
      <div className="flex gap-4">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 font-bold text-foreground text-lg">
            Confirmation Email Sent
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent your application summary and tracking details to your email.
          </p>
        </div>
      </div>
    </div>
  );
}
