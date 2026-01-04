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
    <div className="flex w-full flex-row-reverse justify-between">
      <Button disabled={submitting} onClick={onNext}>
        {submitting ? "Submitting..." : step === MAX_STEPS ? "Submit" : "Next"}
      </Button>
      {step > 1 && (
        <Button onClick={onBack} type="button">
          Back
        </Button>
      )}
    </div>
  );
}
