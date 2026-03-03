import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

type OnlinePaymentSectionProps = {
  paymentProofStatus: Enums<"PaymentProofStatus">;
  getStatusColor: (status: string) => string;
  proofImageURL?: string | null;
};

export default function OnlinePaymentSection({
  paymentProofStatus,
  getStatusColor,
  proofImageURL,
}: OnlinePaymentSectionProps) {
  // Early validation - ensure URL is valid before any rendering
  const validProofImageURL =
    proofImageURL && typeof proofImageURL === "string"
      ? proofImageURL.trim()
      : null;

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
          {paymentProofStatus}
        </Badge>
      </div>
    </>
  );
}
