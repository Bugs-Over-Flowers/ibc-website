import { CheckCircle2 } from "lucide-react";

export function SuccessHeader() {
  return (
    <section className="relative flex items-center overflow-hidden bg-primary px-4 py-12 text-primary-foreground sm:px-6 sm:py-16 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
              <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
              Application Submitted!
            </h1>
            <p className="mt-2 font-medium text-primary-foreground/90">
              Your membership application has been received and is under review
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
