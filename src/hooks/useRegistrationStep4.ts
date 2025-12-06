import { toast } from "sonner";
import tryCatch from "@/lib/server/tryCatch";
import {
  StandardRegistrationSchema,
  StandardRegistrationStep4Schema,
} from "@/lib/validation/registration/standard";
import { submitRegistration } from "@/server/registration/mutations";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";
import { useAction } from "./useAction";

const defaultValues: StandardRegistrationStep4Schema = {
  termsAndConditions: false,
};
export const useRegistrationStep4 = () => {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const { execute } = useAction(tryCatch(submitRegistration), {
    onError: (error) => {
      toast.error(`Failed to submit registration: ${error}`);
    },
    onSuccess: () => {
      toast.success("Registration submitted successfully!");
    },
  });

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

      execute(refinedRegistrationData.data);
    },
  });

  return f;
};
