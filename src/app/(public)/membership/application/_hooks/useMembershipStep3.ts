import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodErrorToFieldErrors } from "@/lib/utils";
import { MembershipApplicationStep3Schema } from "@/lib/validation/membership/application";

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

  // Ensure we always have 2 representatives (Principal and Alternate)
  const representatives = defaultApplicationDataStep3?.representatives || [];
  const paddedRepresentatives = [
    representatives[0] || {
      companyMemberType: "principal",
      firstName: "",
      lastName: "",
      mailingAddress: "",
      sex: "male",
      nationality: "",
      birthdate: undefined as unknown as Date,
      companyDesignation: "",
      landline: "",
      faxNumber: "",
      mobileNumber: "",
      emailAddress: "",
    },
    representatives[1] || {
      companyMemberType: "alternate",
      firstName: "",
      lastName: "",
      mailingAddress: "",
      sex: "male",
      nationality: "",
      birthdate: undefined as unknown as Date,
      companyDesignation: "",
      landline: "",
      faxNumber: "",
      mobileNumber: "",
      emailAddress: "",
    },
  ];

  const form = useAppForm({
    defaultValues: {
      ...defaultApplicationDataStep3,
      representatives: paddedRepresentatives,
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

      // Ensure companyMemberType is correct based on index
      const representatives = refinedValue.representatives.map(
        (rep, index) => ({
          ...rep,
          companyMemberType: (index === 0 ? "principal" : "alternate") as
            | "principal"
            | "alternate",
        }),
      );

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
