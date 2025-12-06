import tryCatch from "@/lib/server/tryCatch";
import { StandardRegistrationSchema } from "@/lib/validation/registration/standard";
import { submitRegistration } from "@/server/registration/mutations";
import useRegistrationStore from "./registration.store";
import { useAction } from "./useAction";

export const useSubmitRegistration = () => {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  return useAction(
    tryCatch(async () => {
      // handle uploading the proof of payment

      // handle the mutation logic
      const parsedRegistrationData =
        StandardRegistrationSchema.parse(registrationData);
      submitRegistration(parsedRegistrationData);
    }),
  );
};
