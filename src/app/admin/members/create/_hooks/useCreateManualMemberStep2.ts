"use client";

import { toast } from "sonner";
import {
  enforceRepresentativeOrder,
  getNormalizedRepresentatives,
} from "@/app/membership/application/_hooks/representativesForm.utils";
import { useAppForm } from "@/hooks/_formHooks";
import useCreateManualMemberStore from "@/hooks/createManualMember.store";
import { zodErrorToFieldErrors } from "@/lib/utils";
import { CreateManualMemberStep2Schema } from "@/lib/validation/membership/createManualMember";

export const useCreateManualMemberStep2 = () => {
  const setStep = useCreateManualMemberStore((state) => state.setStep);
  const setStepData = useCreateManualMemberStore((state) => state.setStepData);
  const memberData = useCreateManualMemberStore((state) => state.memberData);

  const defaultValues = {
    representatives: getNormalizedRepresentatives(
      memberData.step2?.representatives,
    ),
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const { error } = CreateManualMemberStep2Schema.safeParse(value);

        if (error) {
          const fields = zodErrorToFieldErrors(error);

          Object.keys(fields).forEach((key) => {
            const representativeFields = [
              "firstName",
              "lastName",
              "emailAddress",
              "companyDesignation",
              "birthdate",
            ];

            const isRepresentativeField = representativeFields.some((field) =>
              key.endsWith(field),
            );

            if (!isRepresentativeField) {
              toast.error(fields[key].message);
            }
          });

          return { fields };
        }
      },
    },
    onSubmit: async ({ value }) => {
      const refinedValue = CreateManualMemberStep2Schema.parse(value);
      const representatives = enforceRepresentativeOrder(
        refinedValue.representatives,
      );

      setStepData(2, { representatives });
      setStep(3);
    },
  });

  return { form };
};
