import FormButtons from "@/components/FormButtons";
import useRegistrationStore from "@/hooks/registration.store";

export default function Step3() {
  const setStep = useRegistrationStore((s) => s.setStep);
  const onNext = () => {
    setStep(4);
  };

  const onBack = () => {
    setStep(2);
  };

  return (
    <div>
      <FormButtons onNext={onNext} onBack={onBack} />
    </div>
  );
}
