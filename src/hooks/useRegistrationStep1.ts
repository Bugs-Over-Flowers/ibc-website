import { flattenError } from "zod";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { StandardRegistrationStep1Schema } from "@/lib/validation/registration/standard";
import { useAppForm } from "./_formHooks";
import useRegistrationStore from "./registration.store";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useRegistrationStep1 = () => {
  const setStep = useRegistrationStore((s) => s.setStep);
  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const defaultRegistrationDataStep1 = useRegistrationStore(
    (s) => s.registrationData?.step1,
  );

  const f = useAppForm({
    defaultValues: {
      member: "member" as const,
      businessMemberId: "",
      nonMemberName: "",
      ...defaultRegistrationDataStep1,
    },

    validators: {
      onSubmit: ({ value }) => {
        const result = StandardRegistrationStep1Schema.safeParse(value);
        if (!result.success) {
          const flattened = flattenError(result.error).fieldErrors;

          const fields: Record<
            string,
            {
              message: string;
            }
          > = {};
          for (const [key, messages] of Object.entries(flattened)) {
            if (messages && messages.length > 0) {
              fields[key] = { message: messages[0] };
            }
          }
          console.error(fields);
          return { fields };
        }
        return undefined;
      },
    },
    onSubmitMeta: defaultMeta,
    onSubmit: ({ value, meta }) => {
      const refinedValue = StandardRegistrationStep1Schema.parse(value);

      console.log(refinedValue);
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

  return f;
};
