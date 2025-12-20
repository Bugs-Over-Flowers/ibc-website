import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import tryCatch from "@/lib/server/tryCatch";
import { createClient } from "@/lib/supabase/client";
import { zodValidator } from "@/lib/utils";
import { MembershipApplicationStep4Schema } from "@/lib/validation/membership/application";
import { submitMembershipApplication } from "@/server/membership/mutations/submitApplication";

interface UseMembershipStep4Props {
  onSuccess?: () => void;
}

export const useMembershipStep4 = ({
  onSuccess,
}: UseMembershipStep4Props = {}) => {
  const router = useRouter();
  const applicationData = useMembershipApplicationStore(
    (state) => state.applicationData,
  );
  const setApplicationData = useMembershipApplicationStore(
    (state) => state.setApplicationData,
  );
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const resetStore = useMembershipApplicationStore((state) => state.resetStore);

  const defaultApplicationDataStep4 = useMembershipApplicationStore(
    (state) => state.applicationData?.step4,
  );

  const form = useAppForm({
    defaultValues: defaultApplicationDataStep4,
    validators: {
      onSubmit: zodValidator(MembershipApplicationStep4Schema),
    },
    onSubmit: async ({ value }) => {
      const { error } = await tryCatch(
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
            const createUUID = uuidv4();
            const file = applicationData.step2.logoImage;
            const fileExt = file.name.split(".").pop();
            const fileName = `logo-${createUUID}.${fileExt}`;

            const { data, error: uploadError } = await supabase.storage
              .from("logoImage")
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
            const createUUID = uuidv4();
            const file = refinedValue.paymentProof;

            const { data, error: uploadError } = await supabase.storage
              .from("paymentProofs")
              .upload(`app-${createUUID}`, file);

            if (uploadError) {
              throw new Error(
                `Payment proof upload failed: ${uploadError.message}`,
              );
            }

            const { data: publicUrlData } = supabase.storage
              .from("paymentProofs")
              .getPublicUrl(data.path);

            paymentProofUrl = publicUrlData.publicUrl;
          }

          if (!logoImageURL) {
            throw new Error("Company logo is required");
          }

          const res = await submitMembershipApplication({
            applicationType: applicationData.step1.applicationType,
            applicationMemberType: refinedValue.applicationMemberType,
            companyName: applicationData.step2.companyName,
            companyAddress: applicationData.step2.companyAddress,
            sectorId: Number(applicationData.step2.sectorId),
            websiteURL: applicationData.step2.websiteURL,
            emailAddress: applicationData.step2.emailAddress,
            landline: applicationData.step2.landline,
            mobileNumber: applicationData.step2.mobileNumber,
            faxNumber: applicationData.step2.faxNumber,
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

      toast.success("Application submitted successfully!");
      resetStore();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/membership/application/success");
      }
    },
  });

  const goBack = () => {
    setStep(3);
  };

  return { form, goBack, applicationData };
};
