import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { StandardRegistrationStep1Schema } from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useRegistrationStep1 = () => {
  const setStep = useRegistrationStore((state) => state.setStep);
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const defaultRegistrationDataStep1 = useRegistrationStore(
    (state) => state.registrationData?.step1,
  );

  const form = useAppForm({
    defaultValues: defaultRegistrationDataStep1,
    validators: {
      onSubmit: zodValidator(StandardRegistrationStep1Schema),
    },
    onSubmitMeta: defaultMeta,
    onSubmit: ({ value, meta }) => {
      const refinedValue = StandardRegistrationStep1Schema.parse(value);

      if (meta.nextStep) {
        setStep(2);
      } else {
        setStep(1);
      }

      // handle save data to store
      setRegistrationData({
        step1: refinedValue,
      });
    },
  });

  return form;
};
