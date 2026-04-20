import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/client";
import { zodValidator } from "@/lib/utils";
import { validateFileType } from "@/lib/validation/fileTypes";
import { MembershipApplicationStep4Schema } from "@/lib/validation/membership/application";
import { submitMembershipApplication } from "@/server/membership/mutations/submitApplication";

interface UseMembershipStep4Props {
  sectors?: Array<{
    sectorId: number;
    sectorName: string;
  }>;
  onSuccess?: () => void;
}

export const useMembershipStep4 = ({
  sectors = [],
  onSuccess,
}: UseMembershipStep4Props = {}) => {
  const router = useRouter();
  const applicationData = useMembershipApplicationStore(
    (state) => state.applicationData,
  );
  const setApplicationData = useMembershipApplicationStore(
    (state) => state.setApplicationData,
  );
  const setIsSubmitted = useMembershipApplicationStore(
    (state) => state.setIsSubmitted,
  );
  const resetMemberValidationRateLimit = useMembershipApplicationStore(
    (state) => state.resetMemberValidationRateLimit,
  );
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const resetStore = useMembershipApplicationStore((state) => state.resetStore);

  // Get the verified businessMemberId (UUID) returned from identifier validation
  const verifiedBusinessMemberId = useMembershipApplicationStore(
    (state) => state.memberValidation.memberInfo.businessMemberId,
  );

  const storedBusinessMemberId = useMembershipApplicationStore(
    (state) => state.applicationData?.step1?.businessMemberId,
  );

  const defaultApplicationDataStep4 = useMembershipApplicationStore(
    (state) => state.applicationData?.step4,
  );

  const form = useAppForm({
    defaultValues: defaultApplicationDataStep4,
    validators: {
      onSubmit: zodValidator(MembershipApplicationStep4Schema),
    },
    onSubmit: async ({ value }) => {
      const { error, data } = await tryCatch(
        (async () => {
          const parsed = MembershipApplicationStep4Schema.safeParse(value);

          if (!parsed.success) {
            console.error(parsed.error);
            throw new Error("Invalid application data");
          }

          const refinedValue = parsed.data;

          setApplicationData({
            step4: refinedValue,
          });

          let paymentProofUrl = refinedValue.paymentProofUrl;
          let logoImageURL = applicationData.step2.logoImageURL;

          const supabase = await createClient();

          if (applicationData.step2.logoImage instanceof File) {
            // Validate file type
            const isValidLogoType = await validateFileType(
              applicationData.step2.logoImage,
            );
            if (!isValidLogoType) {
              throw new Error(
                "Invalid logo file type. Only JPEG, PNG, and PDF files are allowed.",
              );
            }

            const createUUID = uuidv4();
            const file = applicationData.step2.logoImage;
            const fileExt = file.name.split(".").pop();
            const fileName = `logo-${createUUID}.${fileExt}`;

            const { data, error: uploadError } = await supabase.storage
              .from("logoimage")
              .upload(fileName, file);

            if (uploadError) {
              throw new Error(`Logo upload failed: ${uploadError.message}`);
            }

            logoImageURL = data.path;
            console.log("Logo uploaded to:", logoImageURL);
          }

          if (
            refinedValue.paymentMethod === "BPI" &&
            refinedValue.paymentProof instanceof File
          ) {
            // Validate file type
            const isValidProofType = await validateFileType(
              refinedValue.paymentProof,
            );
            if (!isValidProofType) {
              throw new Error(
                "Invalid payment proof file type. Only JPEG, PNG, and PDF files are allowed.",
              );
            }

            const createUUID = uuidv4();
            const file = refinedValue.paymentProof;

            const { data, error: uploadError } = await supabase.storage
              .from("paymentproofs")
              .upload(`app-${createUUID}`, file);

            if (uploadError) {
              throw new Error(
                `Payment proof upload failed: ${uploadError.message}`,
              );
            }

            const { data: publicUrlData } = supabase.storage
              .from("paymentproofs")
              .getPublicUrl(data.path);

            paymentProofUrl = publicUrlData.publicUrl;
          }

          if (!logoImageURL) {
            throw new Error("Company logo is required");
          }

          // Use the verified businessMemberId (UUID) for renewal/updating applications.
          // This is a returned FK value, while checks are based on Business Member Identifier.
          const businessMemberId =
            applicationData.step1.applicationType === "newMember"
              ? undefined
              : storedBusinessMemberId || verifiedBusinessMemberId;

          const selectedSectorName =
            sectors.find(
              (sector) =>
                String(sector.sectorId) ===
                String(applicationData.step2.sectorId),
            )?.sectorName ?? "";

          if (!selectedSectorName) {
            throw new Error("Industry/Sector is required");
          }

          const res = await submitMembershipApplication({
            applicationType: applicationData.step1.applicationType,
            applicationMemberType: refinedValue.applicationMemberType,
            businessMemberId,
            companyName: applicationData.step2.companyName,
            companyAddress: applicationData.step2.companyAddress,
            sectorName: selectedSectorName,
            websiteURL: applicationData.step2.websiteURL,
            emailAddress: applicationData.step2.emailAddress,
            landline: applicationData.step2.landline,
            mobileNumber: applicationData.step2.mobileNumber,
            logoImageURL,
            representatives: applicationData.step3.representatives,
            paymentMethod: refinedValue.paymentMethod,
            paymentProofUrl,
          });

          if (!res.success) {
            throw new Error(
              res.error instanceof Error
                ? res.error.message
                : (res.error as string),
            );
          }

          return res.data;
        })(),
      );

      if (error) {
        toast.error(error);
        return;
      }

      // Get the identifier from the successful response
      const identifier = (data as { identifier?: string })?.identifier ?? "";

      toast.success("Application submitted successfully!");

      resetMemberValidationRateLimit();

      // Reset the form data but preserve rate limiting data
      resetStore();

      // Reset the form state
      form.reset();

      // Set submitted flag to keep showing loading state during navigation
      setIsSubmitted(true);

      if (onSuccess) {
        onSuccess();
      } else {
        // Pass the identifier to the success page via URL params
        router.push(
          `/membership/application/success?id=${encodeURIComponent(identifier)}`,
        );
      }
    },
  });

  const goBack = () => {
    setStep(3);
  };

  return { form, goBack, applicationData };
};
