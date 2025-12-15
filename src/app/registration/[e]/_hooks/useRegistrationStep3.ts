import { useAppForm } from "@/hooks/_formHooks";
import useRegistrationStore from "@/hooks/registration.store";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { StandardRegistrationStep3Schema } from "@/lib/validation/registration/standard";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useRegistrationStep3 = () => {
  const setStep = useRegistrationStore((state) => state.setStep);
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const defaultRegistrationDataStep3 = useRegistrationStore(
    (state) => state.registrationData?.step3,
  );

  const form = useAppForm({
    defaultValues: defaultRegistrationDataStep3,
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

      // handle save data to store
      setRegistrationData({
        step3: refinedValue,
      });
    },
  });

  return form;
};
