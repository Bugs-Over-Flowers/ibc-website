import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { zodValidator } from "@/lib/utils";
import {
  type MembershipApplicationInput,
  MembershipApplicationSchema,
} from "@/lib/validation/membership/application";
import { submitApplication } from "@/server/membership/mutations/submitApplication";
import { useAppForm } from "../../../../../hooks/_formHooks";

interface UseSubmitApplicationProps {
  onSuccess?: () => void;
}

export const useSubmitApplication = ({
  onSuccess,
}: UseSubmitApplicationProps = {}) => {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      applicationType: "newMember",
      companyDetails: {
        name: "",
        address: "",
        sectorId: "",
        landline: "",
        fax: "",
        mobile: "",
        email: "",
        website: "",
        logoUrl: "",
      },
      representatives: [
        {
          memberType: "principal",
          firstName: "",
          lastName: "",
          mailingAddress: "",
          sex: "male",
          nationality: "",
          birthdate: undefined as unknown as Date,
          position: "",
          landline: "",
          fax: "",
          mobileNumber: "",
          email: "",
        },
      ],
      paymentMethod: "onsite",
      paymentProofUrl: "",
      paymentProof: undefined,
    } as MembershipApplicationInput,
    validators: {
      onSubmit: zodValidator(MembershipApplicationSchema),
    },
    onSubmit: async ({ value }) => {
      let paymentProofUrl = value.paymentProofUrl;

      if (
        value.paymentMethod === "online" &&
        value.paymentProof instanceof File
      ) {
        try {
          const supabase = await createClient();
          const file = value.paymentProof;
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `payment-proofs/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("membership-applications")
            .upload(filePath, file);

          if (uploadError) {
            toast.error(`Upload failed: ${uploadError.message}`);
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("membership-applications")
            .getPublicUrl(filePath);

          paymentProofUrl = publicUrl;
        } catch (_error) {
          toast.error("Failed to initialize upload client");
          return;
        }
      }

      // Ensure memberType is correct based on index
      const representatives = value.representatives.map((rep, index) => ({
        ...rep,
        memberType: (index === 0 ? "principal" : "alternative") as
          | "principal"
          | "alternative",
      }));

      const res = await submitApplication({
        ...value,
        representatives,
        paymentProofUrl,
      });

      if (!res.success) {
        toast.error(
          res.error instanceof Error
            ? res.error.message
            : (res.error as string),
        );
        return;
      }

      toast.success("Application submitted successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/membership/application/success");
      }
    },
  });

  return form;
};
