import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";

type OnlinePaymentSectionProps = {
  paymentProofStatus: Enums<"PaymentProofStatus">;
  getStatusColor: (status: string) => string;
  proofImageURL?: string | null;
  registrationId: string;
};

export default function OnlinePaymentSection({
  paymentProofStatus,
  getStatusColor,
  proofImageURL,
  registrationId,
}: OnlinePaymentSectionProps) {
  // Early validation - ensure URL is valid before any rendering
  const validProofImageURL =
    proofImageURL && typeof proofImageURL === "string"
      ? proofImageURL.trim()
      : null;

  const {
    execute: verify,
    optimistic: optimisticPaymentProofStatus,
    isPending: isVerifyPending,
  } = useOptimisticAction(tryCatch(verifyPayment), paymentProofStatus, {
    optimisticUpdate: (prev) => prev,
    onSuccess: (msg) => {
      toast.success(msg);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const hasProofImage = Boolean(
    validProofImageURL && validProofImageURL.length > 0,
  );

  return (
    <>
      {hasProofImage && (
        <>
          <ImageZoom className="relative h-96 w-full touch-none select-none">
            <Image
              alt="Proof of Payment Image"
              className="object-contain"
              fill
              src={validProofImageURL as string}
            />
          </ImageZoom>
          <div className="text-neutral-600">click on the image to zoom in</div>
        </>
      )}
      <div>
        <Badge
          className={cn("capitalize", getStatusColor(paymentProofStatus))}
          variant="outline"
        >
          {isVerifyPending ? "Verifying..." : optimisticPaymentProofStatus}
        </Badge>
      </div>
      <Button
        disabled={
          isVerifyPending || optimisticPaymentProofStatus === "accepted"
        }
        onClick={() => verify(registrationId)}
      >
        {isVerifyPending
          ? "Verifying..."
          : optimisticPaymentProofStatus === "accepted"
            ? "Verified"
            : "Verify Payment"}
      </Button>
    </>
  );
}
