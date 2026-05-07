import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PaymentProofGrid from "../PaymentProofGrid";
import { RegistrationPaymentSummary } from "../RegistrationPayment";

interface Step4PaymentReviewSectionProps {
  baseFee: number;
  participantCount: number;
  paymentMethod: string;
  proofPreviews: string[];
  sponsorDiscountPerParticipant?: number;
  sponsoredBy?: string | null;
}

export default function Step4PaymentReviewSection({
  baseFee,
  participantCount,
  paymentMethod,
  proofPreviews,
  sponsorDiscountPerParticipant,
  sponsoredBy,
}: Step4PaymentReviewSectionProps) {
  const showPaymentProof =
    paymentMethod === "online" && proofPreviews.length > 0;

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
              Payment Proofs ({proofPreviews.length})
            </p>
            <PaymentProofGrid previews={proofPreviews} readOnly />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
