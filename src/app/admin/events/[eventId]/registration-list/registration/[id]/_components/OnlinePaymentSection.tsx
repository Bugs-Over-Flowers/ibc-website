import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { verifyPayment } from "@/server/registration/actions/verifyPayment";

type OnlinePaymentSectionProps = {
  paymentStatus: Enums<"PaymentStatus">;
  getStatusColor: (status: string) => string;
  proofImageURL?: string | null;
  registrationId: string;
};

export default function OnlinePaymentSection({
  paymentStatus,
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
    optimistic: optimisticPaymentStatus,
    isPending: isVerifyPending,
  } = useOptimisticAction(tryCatch(verifyPayment), paymentStatus, {
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
          className={cn("capitalize", getStatusColor(paymentStatus))}
          variant="outline"
        >
          {isVerifyPending ? "Verifying..." : optimisticPaymentStatus}
        </Badge>
      </div>
      <Button
        disabled={isVerifyPending || optimisticPaymentStatus === "verified"}
        onClick={() => verify(registrationId)}
      >
        {isVerifyPending
          ? "Verifying..."
          : optimisticPaymentStatus === "verified"
            ? "Verified"
            : "Verify Payment"}
      </Button>
    </>
  );
}
