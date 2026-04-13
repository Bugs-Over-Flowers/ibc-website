import { useEffect } from "react";
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

  useEffect(() => {
    if (!defaultApplicationDataStep3?.representatives) {
      return;
    }

    const normalized = getNormalizedRepresentatives(
      defaultApplicationDataStep3.representatives,
    );

    normalized.forEach((rep, index) => {
      const current = form.store.state.values.representatives[index];
      if (!current) {
        return;
      }

      if (rep.firstName !== current.firstName) {
        form.setFieldValue(
          `representatives[${index}].firstName`,
          rep.firstName,
        );
      }
      if (rep.lastName !== current.lastName) {
        form.setFieldValue(`representatives[${index}].lastName`, rep.lastName);
      }
      if (rep.mailingAddress !== current.mailingAddress) {
        form.setFieldValue(
          `representatives[${index}].mailingAddress`,
          rep.mailingAddress,
        );
      }
      if (rep.sex !== current.sex) {
        form.setFieldValue(`representatives[${index}].sex`, rep.sex);
      }
      if (rep.nationality !== current.nationality) {
        form.setFieldValue(
          `representatives[${index}].nationality`,
          rep.nationality,
        );
      }
      if (rep.companyDesignation !== current.companyDesignation) {
        form.setFieldValue(
          `representatives[${index}].companyDesignation`,
          rep.companyDesignation,
        );
      }
      if (rep.landline !== current.landline) {
        form.setFieldValue(`representatives[${index}].landline`, rep.landline);
      }
      if (rep.mobileNumber !== current.mobileNumber) {
        form.setFieldValue(
          `representatives[${index}].mobileNumber`,
          rep.mobileNumber,
        );
      }
      if (rep.emailAddress !== current.emailAddress) {
        form.setFieldValue(
          `representatives[${index}].emailAddress`,
          rep.emailAddress,
        );
      }
      const repBirthdate = rep.birthdate?.getTime?.() ?? null;
      const currentBirthdate = current.birthdate?.getTime?.() ?? null;
      if (repBirthdate !== currentBirthdate) {
        form.setFieldValue(
          `representatives[${index}].birthdate`,
          rep.birthdate,
        );
      }
    });
  }, [defaultApplicationDataStep3, form]);

  return form;
};
