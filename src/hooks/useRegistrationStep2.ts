import { toast } from "sonner";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodErrorToFieldErrors } from "@/lib/utils";
import { StandardRegistrationStep2Schema } from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useRegistrationStep2 = () => {
  const setStep = useRegistrationStore((s) => s.setStep);
  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const defaultRegistrationDataStep2 = useRegistrationStore(
    (s) => s.registrationData?.step2,
  );
  const f = useAppForm({
    defaultValues: defaultRegistrationDataStep2,
    validators: {
      onSubmit: ({ value }) => {
        const { error } = StandardRegistrationStep2Schema.safeParse(value);

        if (error) {
          const fields = zodErrorToFieldErrors(error);
          Object.keys(fields).forEach((key) => {
            const principalRegistrantFields = [
              "email",
              "contactNumber",
              "firstName",
              "lastName",
            ];
            const isPrincipalRegistrantField = principalRegistrantFields.some(
              (field) => key.endsWith(field),
            );
            if (!isPrincipalRegistrantField) {
              toast.error(fields[key].message);
            }
          });
          return { fields };
        }
      },
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      const refinedValue = StandardRegistrationStep2Schema.parse(value);

      if (meta.nextStep) {
        setStep(3);
      } else {
        setStep(1);
      }

      setRegistrationData({
        step2: refinedValue,
      });
    },
  });
  return f;
};
