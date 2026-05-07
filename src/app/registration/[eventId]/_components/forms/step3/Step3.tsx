"use client";

import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import IBCPaymentInfo from "@/components/IBCPaymentInfo";
import { Button } from "@/components/ui/button";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep3 } from "../../../_hooks/useRegistrationStep3";
import RegistrationStepCard from "../_utils/RegistrationStepCard";
import { RegistrationPaymentSummary } from "../RegistrationPayment";
import Step3PaymentMethodSection from "./Step3PaymentMethodSection";
import Step3PaymentProofSection from "./Step3PaymentProofSection";

export default function Step3() {
  const form = useRegistrationStep3();
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );
  const setStep = useRegistrationStore((state) => state.setStep);
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const sponsorFeeDeduction = useRegistrationStore(
    (state) => state.sponsorFeeDeduction,
  );
  const sponsoredBy = useRegistrationStore((state) => state.sponsoredBy);

  const onBack = async () => {
    setStep(2);
    setRegistrationData({
      step3: form.state.values,
    });
  };

  function onNext(e?: React.SubmitEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  }

  const participantCount =
    (registrationData?.step2?.otherParticipants?.length ?? 0) + 1;

  return (
    <form onSubmit={onNext}>
      <RegistrationStepCard
        className="w-full overflow-hidden rounded-2xl border-none bg-transparent shadow-none ring-0"
        contentClassName="space-y-6 px-0 sm:px-6"
        description="Select your preferred payment method and upload proof if paying online."
        footer={
          <div className="flex w-full flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
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
            <Button
              className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
              size="lg"
              type="submit"
            >
              Review Registration
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        }
        headerClassName="bg-card/5"
        Icon={CreditCard}
        title="Payment Information"
      >
        <RegistrationPaymentSummary
          baseFee={eventDetails?.registrationFee || 0}
          participantCount={participantCount}
          sponsorDiscountPerParticipant={sponsorFeeDeduction}
          sponsoredBy={sponsoredBy}
        />

        <Step3PaymentMethodSection form={form} />

        <form.Subscribe selector={(state) => state.values.paymentMethod}>
          {(paymentMethod) =>
            paymentMethod === "online" ? (
              <div className="space-y-6">
                <Step3PaymentProofSection form={form} />
                <IBCPaymentInfo showHeader={false} />
              </div>
            ) : null
          }
        </form.Subscribe>
      </RegistrationStepCard>
    </form>
  );
}
