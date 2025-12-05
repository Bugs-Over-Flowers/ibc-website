"use client";
import FormButtons from "@/components/FormButtons";
import useRegistrationStore from "@/hooks/registration.store";

export default function Step2() {
  const setStep = useRegistrationStore((s) => s.setStep);
  const onNext = () => {
    setStep(3);
  };

  const onBack = () => {
    setStep(1);
  };

  return (
    <div>
      <FormButtons onNext={onNext} onBack={onBack} />
    </div>
  );
}
