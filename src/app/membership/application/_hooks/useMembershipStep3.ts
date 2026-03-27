import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodErrorToFieldErrors } from "@/lib/utils";
import { MembershipApplicationStep3Schema } from "@/lib/validation/membership/application";
import {
  enforceRepresentativeOrder,
  getNormalizedRepresentatives,
} from "./representativesForm.utils";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useMembershipStep3 = () => {
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const setApplicationData = useMembershipApplicationStore(
    (state) => state.setApplicationData,
  );

  const defaultApplicationDataStep3 = useMembershipApplicationStore(
    (state) => state.applicationData?.step3,
  );

  const normalizedRepresentatives = getNormalizedRepresentatives(
    defaultApplicationDataStep3?.representatives,
  );

  const form = useAppForm({
    defaultValues: {
      ...defaultApplicationDataStep3,
      representatives: normalizedRepresentatives,
    },
    validators: {
      onSubmit: ({ value }) => {
        const { error } = MembershipApplicationStep3Schema.safeParse(value);

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
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      const refinedValue = MembershipApplicationStep3Schema.parse(value);

      const representatives = enforceRepresentativeOrder(
        refinedValue.representatives,
      );

      // Update form with transformed values
      representatives.forEach((rep, index) => {
        const original = value.representatives[index];
        if (rep.firstName !== original.firstName) {
          form.setFieldValue(
            `representatives[${index}].firstName`,
            rep.firstName,
          );
        }
        if (rep.lastName !== original.lastName) {
          form.setFieldValue(
            `representatives[${index}].lastName`,
            rep.lastName,
          );
        }
        if (rep.companyDesignation !== original.companyDesignation) {
          form.setFieldValue(
            `representatives[${index}].companyDesignation`,
            rep.companyDesignation,
          );
        }
        if (rep.nationality !== original.nationality) {
          form.setFieldValue(
            `representatives[${index}].nationality`,
            rep.nationality,
          );
        }
      });

      if (meta.nextStep) {
        setStep(4);
      }

      setApplicationData({
        step3: { representatives },
      });
    },
  });

  return form;
};
