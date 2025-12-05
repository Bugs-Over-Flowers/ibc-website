import { Button } from "@/components/ui/button";
import useRegistrationStore, { MAX_STEPS } from "@/hooks/registration.store";

interface FormButtonsProps {
  onBack: () => void;
  onNext: () => void;
}

export default function FormButtons({ onBack, onNext }: FormButtonsProps) {
  const step = useRegistrationStore((s) => s.step);
  return (
    <div className="flex justify-between">
      {step > 1 && <Button onClick={onBack}> Back</Button>}
      {step < MAX_STEPS && (
        <Button onClick={onNext}>
          {step === MAX_STEPS ? "Submit" : "Next"}
        </Button>
      )}
    </div>
  );
}
