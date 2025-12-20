import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { MembershipApplicationStep1Schema } from "@/lib/validation/membership/application";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useMembershipStep1 = () => {
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const setApplicationData = useMembershipApplicationStore(
    (state) => state.setApplicationData,
  );

  const defaultApplicationDataStep1 = useMembershipApplicationStore(
    (state) => state.applicationData?.step1,
  );

  const form = useAppForm({
    defaultValues: defaultApplicationDataStep1,
    validators: {
      onSubmit: zodValidator(MembershipApplicationStep1Schema),
    },
    onSubmitMeta: defaultMeta,
    onSubmit: ({ value, meta }) => {
      const refinedValue = MembershipApplicationStep1Schema.parse(value);

      if (meta.nextStep) {
        setStep(2);
      }

      setApplicationData({
        step1: refinedValue,
      });
    },
  });

  return form;
};
