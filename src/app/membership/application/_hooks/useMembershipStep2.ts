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

  return form;
};
