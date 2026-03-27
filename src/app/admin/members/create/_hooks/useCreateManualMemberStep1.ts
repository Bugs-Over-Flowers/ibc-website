"use client";

import { useAppForm } from "@/hooks/_formHooks";
import useCreateManualMemberStore, {
  type CreateManualMemberData,
} from "@/hooks/createManualMember.store";
import { zodValidator } from "@/lib/utils";
import { CreateManualMemberStep1Schema } from "@/lib/validation/membership/createManualMember";

export const useCreateManualMemberStep1 = () => {
  const setStep = useCreateManualMemberStore((state) => state.setStep);
  const setStepData = useCreateManualMemberStore((state) => state.setStepData);
  const memberData = useCreateManualMemberStore((state) => state.memberData);

  const defaultValues = memberData.step1 || {
    companyName: "",
    sectorId: "",
    companyAddress: "",
    websiteURL: "",
    emailAddress: "",
    landline: "",
    mobileNumber: "",
    logoImageURL: "",
    applicationMemberType: "corporate" as const,
    membershipStatus: "paid" as const,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: zodValidator(CreateManualMemberStep1Schema),
    },
    onSubmit: async ({ value }) => {
      // Store the form values including the File object
      // It will be processed in step3
      setStepData(1, value as unknown as CreateManualMemberData["step1"]);
      setStep(2);
    },
  });

  return { form };
};
