"use client";

import { z } from "zod";
import { useAppForm } from "@/hooks/_formHooks";
import useCreateManualMemberStore, {
  type CreateManualMemberData,
} from "@/hooks/createManualMember.store";
import { zodValidator } from "@/lib/utils";
import { CreateManualMemberStep1Schema } from "@/lib/validation/membership/createManualMember";

// Custom schema for form validation that handles both File and string inputs
const FormStep1Schema = CreateManualMemberStep1Schema.extend({
  logoImageURL: z.union([
    z
      .instanceof(File, { message: "Company logo is required" })
      .refine((file) => file.size > 0, "Company logo is required"),
    z.string(),
  ]),
});

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
    faxNumber: "",
    logoImageURL: null as unknown as File,
    applicationMemberType: "corporate" as const,
    membershipStatus: "paid" as const,
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: zodValidator(FormStep1Schema),
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
