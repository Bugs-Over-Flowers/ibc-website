import { CreditCard } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { RegistrationPaymentSummary } from "../RegistrationPayment";

interface Step4PaymentReviewSectionProps {
  baseFee: number;
  participantCount: number;
  paymentMethod: string;
  paymentProofName?: string;
  proofPreview: string | null;
  sponsorDiscountPerParticipant?: number;
  sponsoredBy?: string | null;
}

export default function Step4PaymentReviewSection({
  baseFee,
  participantCount,
  paymentMethod,
  paymentProofName,
  proofPreview,
  sponsorDiscountPerParticipant,
  sponsoredBy,
}: Step4PaymentReviewSectionProps) {
  const showPaymentProof = paymentMethod === "online" && paymentProofName;

  return (
    <Card className="rounded-2xl border border-border/50 bg-background">
      <CardContent className="space-y-6 px-7 py-0">
        <div className="flex items-center gap-2 font-bold text-primary">
          <CreditCard className="h-5 w-5" />
          <span className="text-base uppercase tracking-wide">
            Payment Summary
          </span>
        </div>

        <RegistrationPaymentSummary
          baseFee={baseFee}
          className="border-border/50 bg-background"
          participantCount={participantCount}
          sponsorDiscountPerParticipant={sponsorDiscountPerParticipant}
          sponsoredBy={sponsoredBy}
          title={null}
        />

        <div className="mt-4 flex flex-col items-start gap-2 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Payment Method
          </span>
          <Badge className="font-medium text-sm capitalize" variant="outline">
            {paymentMethod}
          </Badge>
        </div>

        {paymentMethod === "onsite" ? (
          <p className="text-muted-foreground text-sm">
            Onsite payments do not require a proof of payment upload.
          </p>
        ) : null}

        {showPaymentProof ? (
          <div className="mt-4 rounded-xl border border-border/50 bg-background p-4">
            <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Payment Proof
            </p>
            <div className="flex flex-col items-start gap-2">
              {proofPreview ? (
                <ImageZoom className="block">
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border/60 bg-muted/20">
                    <Image
                      alt="Payment proof preview"
                      className="object-contain p-0.5"
                      fill
                      src={proofPreview}
                      unoptimized
                    />
                  </div>
                </ImageZoom>
              ) : null}
              <span className="font-medium text-green-600">
                Proof Uploaded Successfully
              </span>
              <Badge className="mt-1 max-w-full" variant="outline">
                {paymentProofName}
              </Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
