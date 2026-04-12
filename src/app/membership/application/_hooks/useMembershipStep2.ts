import { useEffect } from "react";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { MembershipApplicationStep2Schema } from "@/lib/validation/membership/application";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useMembershipStep2 = () => {
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const setApplicationData = useMembershipApplicationStore(
    (state) => state.setApplicationData,
  );

  const defaultApplicationDataStep2 = useMembershipApplicationStore(
    (state) => state.applicationData?.step2,
  );

  const form = useAppForm({
    defaultValues: defaultApplicationDataStep2,
    validators: {
      onSubmit: zodValidator(MembershipApplicationStep2Schema),
    },
    onSubmitMeta: defaultMeta,
    onSubmit: ({ value, meta }) => {
      const refinedValue = MembershipApplicationStep2Schema.parse(value);

      // Update form with transformed values
      if (refinedValue.companyName !== value.companyName) {
        form.setFieldValue("companyName", refinedValue.companyName);
      }

      if (meta.nextStep) {
        setStep(3);
      }

      setApplicationData({
        step2: refinedValue,
      });
    },
  });

  useEffect(() => {
    if (!defaultApplicationDataStep2) {
      return;
    }

    const currentValues = form.store.state.values;

    if (defaultApplicationDataStep2.companyName !== currentValues.companyName) {
      form.setFieldValue(
        "companyName",
        defaultApplicationDataStep2.companyName,
      );
    }
    if (
      defaultApplicationDataStep2.companyAddress !==
      currentValues.companyAddress
    ) {
      form.setFieldValue(
        "companyAddress",
        defaultApplicationDataStep2.companyAddress,
      );
    }
    if (defaultApplicationDataStep2.sectorId !== currentValues.sectorId) {
      form.setFieldValue("sectorId", defaultApplicationDataStep2.sectorId);
    }
    if (defaultApplicationDataStep2.landline !== currentValues.landline) {
      form.setFieldValue("landline", defaultApplicationDataStep2.landline);
    }
    if (
      defaultApplicationDataStep2.mobileNumber !== currentValues.mobileNumber
    ) {
      form.setFieldValue(
        "mobileNumber",
        defaultApplicationDataStep2.mobileNumber,
      );
    }
    if (
      defaultApplicationDataStep2.emailAddress !== currentValues.emailAddress
    ) {
      form.setFieldValue(
        "emailAddress",
        defaultApplicationDataStep2.emailAddress,
      );
    }
    if (defaultApplicationDataStep2.websiteURL !== currentValues.websiteURL) {
      form.setFieldValue("websiteURL", defaultApplicationDataStep2.websiteURL);
    }
    if (
      defaultApplicationDataStep2.logoImageURL !== currentValues.logoImageURL
    ) {
      form.setFieldValue(
        "logoImageURL",
        defaultApplicationDataStep2.logoImageURL,
      );
    }
  }, [defaultApplicationDataStep2, form]);

  return form;
};
