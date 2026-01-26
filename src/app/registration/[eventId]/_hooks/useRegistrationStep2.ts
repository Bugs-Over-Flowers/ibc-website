import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useRegistrationStore from "@/hooks/registration.store";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodErrorToFieldErrors } from "@/lib/utils";
import { StandardRegistrationStep2Schema } from "@/lib/validation/registration/standard";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useRegistrationStep2 = () => {
  const setStep = useRegistrationStore((state) => state.setStep);
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const defaultRegistrationDataStep2 = useRegistrationStore(
    (state) => state.registrationData?.step2,
  );
  const form = useAppForm({
    defaultValues: defaultRegistrationDataStep2,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ({ value }) => {
        // Handle Zod validation errors manually to show toast for duplicate participants
        const { error } = StandardRegistrationStep2Schema.safeParse(value);

        if (error) {
          const fields = zodErrorToFieldErrors(error);
          Object.keys(fields).forEach((key) => {
            const registrantFields = [
              "email",
              "contactNumber",
              "firstName",
              "lastName",
            ] as const;

            const isRegistrantField = registrantFields.some((field) =>
              key.endsWith(field),
            );
            if (!isRegistrantField) {
              toast.error(fields[key].message);
            }
          });
          return { fields };
        }

        return undefined;
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

      // handle save data to store
      setRegistrationData({
        step2: refinedValue,
      });
    },
  });
  return form;
};
