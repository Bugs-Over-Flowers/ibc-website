"use client";

import { useAppForm } from "@/hooks/_formHooks";
import useCreateManualMemberStore from "@/hooks/createManualMember.store";
import { zodValidator } from "@/lib/utils";
import { CreateManualMemberStep2Schema } from "@/lib/validation/membership/createManualMember";

export const useCreateManualMemberStep2 = () => {
  const setStep = useCreateManualMemberStore((state) => state.setStep);
  const setStepData = useCreateManualMemberStore((state) => state.setStepData);
  const memberData = useCreateManualMemberStore((state) => state.memberData);

  const defaultValues = memberData.step2 || {
    firstName: "",
    lastName: "",
    representativeEmailAddress: "",
    companyDesignation: "",
    birthdate: new Date(),
    sex: "male" as const,
    nationality: "",
    mailingAddress: "",
    representativeMobileNumber: "",
    representativeLandline: "",
    representativeFaxNumber: "",
    companyMemberType: "principal" as const,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: zodValidator(CreateManualMemberStep2Schema),
    },
    onSubmit: async ({ value }) => {
      setStepData(2, value);
      setStep(3);
    },
  });

  return { form };
};
