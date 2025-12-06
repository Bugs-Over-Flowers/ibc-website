import { toast } from "sonner";
import {
  StandardRegistrationSchema,
  StandardRegistrationStep4Schema,
} from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";
import { useSubmitRegistration } from "./useSubmitRegistration";

const defaultValues: StandardRegistrationStep4Schema = {
  termsAndConditions: false,
};
export const useRegistrationStep4 = () => {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const { execute: submitRegistration } = useSubmitRegistration();
  const f = useAppForm({
    defaultValues,
    validators: {
      onSubmit: StandardRegistrationStep4Schema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const refinedValue = StandardRegistrationStep4Schema.parse(value);

      setRegistrationData({
        step4: refinedValue,
      });

      const refinedRegistrationData =
        StandardRegistrationSchema.safeParse(registrationData);

      if (!refinedRegistrationData.success) {
        toast.error(
          `Invalid registration data. Please check your previous inputs.`,
        );
        return;
      }

      submitRegistration();
    },
  });

  return f;
};
