import FormButtons from "@/components/FormButtons";
import useRegistrationStore from "@/hooks/registration.store";

export default function Step4() {
  const setStep = useRegistrationStore((s) => s.setStep);
  return (
    <div>
      <FormButtons onNext={() => setStep(5)} onBack={() => setStep(3)} />
    </div>
  );
}
