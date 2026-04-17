"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useCreateManualMemberStore from "@/hooks/createManualMember.store";
import tryCatch from "@/lib/server/tryCatch";
import { uploadCompanyLogo } from "@/lib/storage/uploadCompanyLogo";
import { titleCase } from "@/lib/utils";
import type { ManualMemberInput } from "@/lib/validation/membership/manualMember";
import { createManualMember } from "@/server/members/mutations/createManualMember";

export const useCreateManualMemberStep3 = () => {
  const router = useRouter();
  const memberData = useCreateManualMemberStore((state) => state.memberData);
  const resetStore = useCreateManualMemberStore((state) => state.resetStore);
  const setIsSubmitted = useCreateManualMemberStore(
    (state) => state.setIsSubmitted,
  );

  const form = useAppForm({
    defaultValues: {},
    onSubmit: async () => {
      if (!memberData.step1 || !memberData.step2) {
        toast.error("Missing required information");
        return;
      }

      // Upload company logo if provided
      let logoImageURL: string | File | null = memberData.step1.logoImageURL;
      if (logoImageURL instanceof File && logoImageURL.size > 0) {
        const { error: uploadError, data: uploadedPath } = await tryCatch(
          uploadCompanyLogo(logoImageURL),
        );

        if (uploadError) {
          toast.error(uploadError);
          return;
        }

        if (!uploadedPath) {
          toast.error("Failed to upload company logo");
          return;
        }

        logoImageURL = uploadedPath;
      }

      // Combine step1 and step2 data and transform
      const transformedRepresentatives = memberData.step2.representatives.map(
        (representative) => ({
          ...representative,
          firstName: titleCase(representative.firstName).trim(),
          lastName: titleCase(representative.lastName).trim(),
          nationality: titleCase(representative.nationality).trim(),
          companyDesignation:
            representative.companyDesignation ===
            representative.companyDesignation.toLowerCase()
              ? titleCase(representative.companyDesignation).trim()
              : representative.companyDesignation.trim(),
        }),
      );

      const combinedData: ManualMemberInput = {
        ...memberData.step1,
        representatives: transformedRepresentatives,
        logoImageURL: typeof logoImageURL === "string" ? logoImageURL : "",
        companyName: titleCase(memberData.step1.companyName).trim(),
      };

      const { error, data } = await tryCatch(createManualMember(combinedData));

      if (error) {
        const errorMessage =
          typeof error === "string" ? error : (error as Error).message;
        toast.error(errorMessage);
        return;
      }

      if (!data) {
        toast.error("Failed to create member");
        return;
      }

      toast.success(data.message);
      setIsSubmitted(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      resetStore();
      router.push(`/admin/members/${data.businessMemberId}` as Route);
    },
  });

  return { form, memberData };
};
