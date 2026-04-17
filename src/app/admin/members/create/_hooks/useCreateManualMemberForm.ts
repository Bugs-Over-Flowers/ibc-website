"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import {
  type ManualMemberInput,
  ManualMemberSchema,
} from "@/lib/validation/membership/manualMember";
import { createManualMember } from "@/server/members/mutations/createManualMember";

export function useCreateManualMemberForm() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      companyName: "",
      sectorId: "",
      companyAddress: "",
      websiteURL: "",
      emailAddress: "",
      landline: "",
      mobileNumber: "",
      logoImageURL: "",
      applicationMemberType: "corporate" as "corporate" | "personal",
      membershipStatus: "paid" as "paid" | "unpaid" | "cancelled",
      representatives: [
        {
          firstName: "",
          lastName: "",
          emailAddress: "",
          companyDesignation: "",
          birthdate: new Date(),
          sex: "male" as "male" | "female",
          nationality: "",
          mailingAddress: "",
          mobileNumber: "",
          landline: "",
          companyMemberType: "principal" as "principal" | "alternate",
        },
        {
          firstName: "",
          lastName: "",
          emailAddress: "",
          companyDesignation: "",
          birthdate: new Date(),
          sex: "male" as "male" | "female",
          nationality: "",
          mailingAddress: "",
          mobileNumber: "",
          landline: "",
          companyMemberType: "alternate" as "principal" | "alternate",
        },
      ],
    } satisfies ManualMemberInput,
    validators: {
      onSubmit: zodValidator(ManualMemberSchema),
    },
    onSubmit: async ({ value }) => {
      const { error, data } = await tryCatch(createManualMember(value));

      if (error) {
        toast.error(error);
        return;
      }

      if (!data) {
        toast.error("Failed to create member");
        return;
      }

      toast.success(data.message);
      router.push(`/admin/members/${data.businessMemberId}` as Route);
    },
  });

  return { form, router };
}
