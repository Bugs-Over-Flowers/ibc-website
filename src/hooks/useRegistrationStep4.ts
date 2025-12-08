import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodValidator } from "@/lib/utils";
import {
  StandardRegistrationSchema,
  StandardRegistrationStep4Schema,
} from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";
import { useSendRegistrationEmail } from "./useSendRegistrationEmail";
import { useSubmitRegistration } from "./useSubmitRegistration";

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
    defaultValues: registrationData.step4,
    validators: {
      onSubmit: zodValidator(StandardRegistrationStep4Schema),
    },
    onSubmit: async ({ value }) => {
      const refinedValue = StandardRegistrationStep4Schema.parse(value);

      // handle save data to store
      setRegistrationData({
        step4: refinedValue,
      });

      const refinedRegistrationData = StandardRegistrationSchema.safeParse({
        ...registrationData,
        step4: refinedValue,
      });

      if (!refinedRegistrationData.success) {
        console.error(refinedRegistrationData.error);
        toast.error(
          `Invalid registration data. Please check your previous inputs.`,
        );
        return;
      }

      // registration
      const res = await submitRegistration();
      const [submitRegistrationError, registrationId] = res;
      if (submitRegistrationError || !registrationId) return;

      // email sending
      const [sendEmailError, _2] = await sendEmail(registrationId);
      if (sendEmailError) return;

      // redirect
      if (!eventDetails?.eventId) {
        router.push("/events");
        return;
      }
      router.push(`/registration/success`);
    },
  });

  return form;
};
