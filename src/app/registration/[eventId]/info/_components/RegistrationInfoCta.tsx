import { ArrowRight } from "lucide-react";
import Link from "next/link";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Button } from "@/components/ui/button";

type RegistrationInfoCtaProps = {
  eventId: string;
};

export function RegistrationInfoCta({ eventId }: RegistrationInfoCtaProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 rounded-xl border-primary/10 bg-primary/5 p-8 shadow-none sm:flex-row sm:items-center md:p-10">
      <div>
        <h3 className="mb-1 font-bold text-foreground text-xl">
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
        <Button
          className="shrink-0 gap-2 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          size="lg"
        >
          Begin Registration
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
