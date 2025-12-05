import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodErrorToFieldErrors } from "@/lib/utils";
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
    defaultValues: defaultRegistrationDataStep3,
    validators: {
      onSubmit: ({ value }) => {
        const { error } = StandardRegistrationStep3Schema.safeParse(value);

        if (error) {
          const fields = zodErrorToFieldErrors(error);

          return { fields };
        }
      },
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      const refinedValue = StandardRegistrationStep3Schema.parse(value);

      if (meta.nextStep) {
        setStep(3);
      } else {
        setStep(1);
      }

      setRegistrationData({
        step3: refinedValue,
      });
    },
  });
  return f;
};
