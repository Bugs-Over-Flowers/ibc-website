import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { StandardRegistrationStep3Schema } from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useRegistrationStep3 = () => {
  const setStep = useRegistrationStore((s) => s.setStep);
  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const defaultRegistrationDataStep3 = useRegistrationStore(
    (s) => s.registrationData?.step3,
  );

  const f = useAppForm({
    defaultValues: {
      paymentMethod: "online" as const,
      paymentProof: undefined,
      ...defaultRegistrationDataStep3,
    },
    validators: {
      onSubmit: zodValidator(StandardRegistrationStep3Schema),
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      const refinedValue = StandardRegistrationStep3Schema.parse(value);

      if (meta.nextStep) {
        setStep(4);
      } else {
        setStep(2);
      }

      setRegistrationData({
        step3: refinedValue,
      });
    },
  });

  return f;
};
