import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useRegistrationStore, { MAX_STEPS } from "@/hooks/registration.store";

interface FormButtonsProps {
  onBack: () => void;
  onNext: () => void;
  submitting?: boolean;
}

export default function FormButtons({
  onBack,
  onNext,
  submitting,
}: FormButtonsProps) {
  const step = useRegistrationStore((s) => s.step);

  return (
    <div className="flex items-center justify-between gap-3 border-border border-t pt-4">
      <Button
        className={step === 1 ? "invisible" : ""}
        disabled={step === 1 || submitting}
        onClick={onBack}
        type="button"
        variant="outline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <Button
        className="min-w-[140px]"
        disabled={submitting}
        onClick={onNext}
        type="submit"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {step === MAX_STEPS ? "Submitting..." : "Processing..."}
          </>
        ) : (
          <>
            {step === MAX_STEPS ? "Submit Registration" : "Next Step"}
            {step !== MAX_STEPS && <ArrowRight className="ml-2 h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  );
}
