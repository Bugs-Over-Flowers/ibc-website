"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useRegistrationStore from "@/hooks/registration.store";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import { useRegistrationStep4 } from "../../../_hooks/useRegistrationStep4";
import RegistrationStepHeader from "../RegistrationStepHeader";
import Step4EventReviewSection from "./Step4EventReviewSection";
import Step4NoteSection from "./Step4NoteSection";
import Step4PaymentReviewSection from "./Step4PaymentReviewSection";
import Step4RegistrantReviewSection from "./Step4RegistrantReviewSection";
import Step4TermsSection from "./Step4TermsSection";

interface Step4Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function Step4({ members }: Step4Props) {
  const setStep = useRegistrationStore((state) => state.setStep);
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const sponsorFeeDeduction = useRegistrationStore(
    (state) => state.sponsorFeeDeduction,
  );
  const sponsoredBy = useRegistrationStore((state) => state.sponsoredBy);
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const [proofPreviews, setProofPreviews] = useState<string[]>([]);

  const step1Data = registrationData.step1;
  const step2Data = registrationData.step2;
  const step3Data = registrationData.step3;

  const affiliation = useMemo(() => {
    if (step1Data.member === "member") {
      return (
        members.find((m) => m.businessMemberId === step1Data.businessMemberId)
          ?.businessName ?? ""
      );
    }
    return step1Data.nonMemberName;
  }, [members, step1Data]);

  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const form = useRegistrationStep4(affiliation);

  const participantCount = 1 + (step2Data.otherParticipants?.length ?? 0);
  const baseFee = eventDetails?.registrationFee ?? 0;
  const selectedPaymentProofs =
    step3Data.paymentMethod === "online" ? step3Data.paymentProofs : [];
  const registrationTypeLabel =
    step1Data.member === "member" ? "Corporate Member" : "Non-member";

  useEffect(() => {
    const urls = (selectedPaymentProofs ?? []).map((f) =>
      f?.type?.startsWith("image/") ? URL.createObjectURL(f) : "",
    );
    setProofPreviews(urls);
    return () => {
      for (const u of urls) {
        if (u) URL.revokeObjectURL(u);
      }
    };
  }, [selectedPaymentProofs]);

  const onBack = async () => {
    setStep(3);
    setRegistrationData({
      step4: {
        note: form.state.values.note,
        termsAndConditions: false,
      },
    });
  };

  const onSubmit = (e?: React.SubmitEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card className="w-full overflow-hidden rounded-2xl border-none bg-transparent pb-0 shadow-none ring-0">
        <RegistrationStepHeader
          className="bg-card/5"
          description="Please review your details before submitting your final registration."
          Icon={CheckCircle2}
          title="Review & Confirm"
        />

        <CardContent className="space-y-6 px-0 sm:px-6">
          <Step4EventReviewSection
            eventStartDate={eventDetails?.eventStartDate}
            eventTitle={eventDetails?.eventTitle}
          />

          <Step4RegistrantReviewSection
            memberLabel={registrationTypeLabel}
            memberName={affiliation}
            otherParticipants={step2Data.otherParticipants}
            registrant={step2Data.registrant}
          />

          <Step4PaymentReviewSection
            baseFee={baseFee}
            participantCount={participantCount}
            paymentMethod={step3Data.paymentMethod}
            proofPreviews={proofPreviews}
            sponsorDiscountPerParticipant={sponsorFeeDeduction}
            sponsoredBy={sponsoredBy}
          />

          <Step4NoteSection form={form} />
          <Step4TermsSection form={form} />
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-3 border-border/50 border-t px-0 pt-6 pb-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button
            className="w-full rounded-xl sm:w-auto"
            onClick={onBack}
            size="lg"
            type="button"
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                className="w-full rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:px-8"
                disabled={isSubmitting}
                size="lg"
                type="submit"
              >
                {isSubmitting ? "Processing..." : "Complete Registration"}
                {!isSubmitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  );
}
