import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Button } from "@/components/ui/button";

type RegistrationInfoCtaProps = {
  eventId: string;
};

export function RegistrationInfoCta({ eventId }: RegistrationInfoCtaProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-border bg-card p-7 shadow-sm sm:flex-row sm:items-center md:p-9">
      <div>
        <h3 className="mb-1 font-semibold text-foreground text-lg">
          Ready to register?
        </h3>
        <p className="text-muted-foreground text-sm">
          By proceeding, you agree to our{" "}
          <TermsAndConditions
            triggerOverride={
              <button
                className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
                type="button"
              >
                Terms and Conditions
              </button>
            }
          />
          .
        </p>
      </div>

      <Link href={`/registration/${eventId}`}>
        <Button className="shrink-0 gap-2" size="lg">
          Begin Registration
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
