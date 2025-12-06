import { StandardRegistrationStep4Schema } from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";

const defaultValues: StandardRegistrationStep4Schema = {
  termsAndConditions: false,
};
export const useRegistrationStep4 = () => {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const f = useAppForm({
    defaultValues,
    validators: {
      onSubmit: StandardRegistrationStep4Schema,
    },
    onSubmit: ({ value }) => {},
  });

  return f;
};
