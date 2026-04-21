"use client";

import { ArrowLeft, ArrowRight, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";
import { PaymentMethodEnum } from "@/lib/validation/utils";
import { useRegistrationStep3 } from "../../../_hooks/useRegistrationStep3";
import {
  PaymentProofDropzone,
  RegistrationPaymentSummary,
} from "../RegistrationPayment";
import RegistrationStepHeader from "../RegistrationStepHeader";

const PAYMENT_OPTIONS = [
  {
    id: "onsite",
    value: PaymentMethodEnum.enum.onsite,
    icon: Wallet,
    title: "Pay Onsite",
    description: "Pay via cash or card at the event",
  },
  {
    id: "online",
    value: PaymentMethodEnum.enum.online,
    icon: CreditCard,
    title: "Bank Transfer / Online",
    description: "Pay now and upload receipt",
  },
] as const;

type SubmitEventLike = {
  preventDefault: () => void;
  stopPropagation: () => void;
};

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

  function onNext(e?: SubmitEventLike) {
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
      <Card className="w-full overflow-hidden rounded-2xl border-none bg-transparent shadow-none ring-0">
        <RegistrationStepHeader
          className="bg-card/5"
          description="Select your preferred payment method and upload proof if paying online."
          Icon={CreditCard}
          title="Payment Information"
        />

        <CardContent className="space-y-6 px-0 sm:px-6">
          <RegistrationPaymentSummary
            baseFee={eventDetails?.registrationFee || 0}
            participantCount={participantCount}
            sponsorDiscountPerParticipant={sponsorFeeDeduction}
            sponsoredBy={sponsoredBy}
          />

          <PaymentMethodSelection form={form} />

          <form.Subscribe selector={(state) => state.values.paymentMethod}>
            {(paymentMethod) =>
              paymentMethod === PaymentMethodEnum.enum.online && (
                <PaymentProofUpload form={form} />
              )
            }
          </form.Subscribe>

          <div className="flex flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
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
        </CardContent>
      </Card>
    </form>
  );
}

interface PaymentMethodSelectionProps {
  form: ReturnType<typeof useRegistrationStep3>;
}

function PaymentMethodSelection({ form }: PaymentMethodSelectionProps) {
  return (
    <form.AppField
      listeners={{
        onChange: () => {
          if (form.getFieldValue("paymentProof")) {
            form.resetField("paymentProof");
          }
        },
      }}
      name="paymentMethod"
    >
      {(field) => (
        <div className="space-y-4">
          <Label className="text-base">Payment Method</Label>
          <RadioGroup
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onValueChange={(value) => {
              const parsedPaymentMethodValue =
                PaymentMethodEnum.safeParse(value);
              if (!parsedPaymentMethodValue.success) {
                return;
              }

              field.handleChange(parsedPaymentMethodValue.data);
            }}
            value={field.state.value}
          >
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <div className="flex-1" key={option.id}>
                  <Label
                    className={cn(
                      "flex min-h-30 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent p-4 text-center transition-all",
                      field.state.value === option.value &&
                        "border-primary bg-primary/5",
                    )}
                    htmlFor={option.id}
                  >
                    <RadioGroupItem
                      className="peer sr-only"
                      id={option.id}
                      value={option.value}
                    />
                    <span
                      className={cn(
                        "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                        field.state.value === option.value &&
                          "border-primary/30 bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-semibold text-lg">
                      {option.title}
                    </span>
                    <span className="mt-1 text-muted-foreground text-sm">
                      {option.description}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}
    </form.AppField>
  );
}

interface PaymentProofUploadProps {
  form: ReturnType<typeof useRegistrationStep3>;
}

function PaymentProofUpload({ form }: PaymentProofUploadProps) {
  return (
    <form.AppField name="paymentProof">
      {(field) => {
        const selectedFile = field.state.value as File | undefined;

        return (
          <PaymentProofDropzone
            errorMessages={field.state.meta.errors}
            onChange={(file) => field.handleChange(file)}
            value={selectedFile}
          />
        );
      }}
    </form.AppField>
  );
}
