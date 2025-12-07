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
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const { execute: submitRegistration } = useSubmitRegistration();
  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: StandardRegistrationStep4Schema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      const refinedValue = StandardRegistrationStep4Schema.parse(value);

      // handle save data to store
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

      await submitRegistration();
    },
  });

  return form;
};
