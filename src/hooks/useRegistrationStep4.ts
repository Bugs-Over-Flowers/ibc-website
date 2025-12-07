import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  StandardRegistrationSchema,
  StandardRegistrationStep4Schema,
} from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";
import { useSendRegistrationEmail } from "./useSendRegistrationEmail";
import { useSubmitRegistration } from "./useSubmitRegistration";

const defaultValues: StandardRegistrationStep4Schema = {
  termsAndConditions: false,
};
export const useRegistrationStep4 = () => {
  const router = useRouter();

  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  const { execute: submitRegistration } = useSubmitRegistration();
  const { execute: sendEmail } = useSendRegistrationEmail();
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

      // registration
      const res = await submitRegistration();
      const [submitRegistrationError, _1] = res;
      if (submitRegistrationError) return;

      // email sending
      const [sendEmailError, _2] = await sendEmail();
      if (sendEmailError) return;

      // redirect
      if (!eventDetails?.eventId) {
        router.push("/registration");
        return;
      }
      router.push(`/registration/success`);
    },
  });

  return form;
};
