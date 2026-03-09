import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  UploadCloud,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import type { DragEvent, FormEvent } from "react";
import { useCallback, useState } from "react";
import IBCBPIQRCode from "@/../public/info/sampleqr.jpeg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";
import { PaymentMethodEnum } from "@/lib/validation/utils";
import { useRegistrationStep3 } from "../../_hooks/useRegistrationStep3";

const BANK_DETAILS = {
  bankName: "BPI",
  accountName: "Iloilo Business Club",
  accountNumber: "000XXXXXXXX",
} as const;

export default function Step3() {
  const form = useRegistrationStep3();
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );
  const setStep = useRegistrationStore((state) => state.setStep);
  const [dragActive, setDragActive] = useState(false);

  const onBack = async () => {
    setStep(2);
    setRegistrationData({
      step3: form.state.values,
    });
  };

  const onNext = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  const handleDrag = useCallback((e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  return (
    <form onSubmit={onNext}>
      <Card className="w-full overflow-hidden rounded-2xl border border-border/30">
        <CardHeader className="border-border/30 border-b bg-card/5 pb-6">
          <CardTitle className="flex items-center gap-2 font-semibold text-2xl">
            <CreditCard className="h-6 w-6 text-primary" />
            Payment Information
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Select your preferred payment method and upload proof if paying
            online.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          <PaymentSummary />
          <PaymentMethodSelection form={form} />
          <PaymentProofUpload
            dragActive={dragActive}
            form={form}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
          />

          <div className="flex items-center justify-between border-border/50 border-t pt-4">
            <Button
              className="rounded-xl"
              onClick={onBack}
              size="lg"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              className="rounded-xl px-8 shadow-md"
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

function PaymentSummary() {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);
  const sponsorFeeDeduction = useRegistrationStore(
    (s) => s.sponsorFeeDeduction,
  );
  const sponsoredBy = useRegistrationStore((s) => s.sponsoredBy);

  const baseFee = eventDetails?.registrationFee || 0;
  const otherParticipantsCount =
    registrationData?.step2?.otherParticipants?.length || 0;
  const participantCount = otherParticipantsCount + 1;
  const subtotal = baseFee * participantCount;
  const sponsorDiscount = sponsorFeeDeduction
    ? sponsorFeeDeduction * participantCount
    : 0;
  const total = subtotal - sponsorDiscount;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="mb-4 font-bold text-primary text-sm uppercase tracking-wider">
        Payment Summary
      </h3>

      <div className="space-y-3 text-base">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Number of Participants</span>
          <span className="font-medium">{participantCount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Fee per Participant</span>
          <span className="font-medium">PHP {baseFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({participantCount} × PHP {baseFee.toLocaleString()})
          </span>
          <span className="font-medium">PHP {subtotal.toLocaleString()}</span>
        </div>

        {sponsorDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Sponsor Discount ({sponsoredBy})</span>
            <span className="font-medium">
              -PHP {sponsorDiscount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between border-primary/20 border-t pt-3 font-bold text-foreground text-lg">
          <span>Total Amount to Pay</span>
          <span>PHP {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
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
      {(field) => {
        const paymentOptions = [
          {
            id: "online",
            value: "online",
            icon: CreditCard,
            title: "Bank Transfer / Online",
            description: "Pay now and upload receipt",
          },
          {
            id: "onsite",
            value: "onsite",
            icon: Wallet,
            title: "Pay Onsite",
            description: "Pay via cash or card at the event",
          },
        ];

        return (
          <div className="space-y-4">
            <Label className="text-base">Payment Method</Label>
            <RadioGroup
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
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
              {paymentOptions.map((option) => {
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
        );
      }}
    </form.AppField>
  );
}

interface PaymentProofUploadProps {
  form: ReturnType<typeof useRegistrationStep3>;
  dragActive: boolean;
  handleDrag: (e: DragEvent<HTMLButtonElement>) => void;
  handleDrop: (e: DragEvent<HTMLButtonElement>) => void;
}

function PaymentProofUpload({
  form,
  dragActive,
  handleDrag,
  handleDrop,
}: PaymentProofUploadProps) {
  return (
    <form.Subscribe selector={(state) => state.values.paymentMethod}>
      {(paymentMethod) =>
        paymentMethod === "online" ? (
          <div className="slide-in-from-top-4 fade-in animate-in space-y-4 duration-300">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <h4 className="mb-1 font-bold text-primary">
                Bank Transfer Details:
              </h4>
              <p className="text-foreground">Bank: {BANK_DETAILS.bankName}</p>
              <p className="text-foreground">
                Account: {BANK_DETAILS.accountNumber}
              </p>
              <p className="text-foreground">
                Name: {BANK_DETAILS.accountName}
              </p>
            </div>

            <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-border">
              <Image
                alt="qr code"
                className="object-cover"
                fill
                src={IBCBPIQRCode}
              />
            </div>

            <form.AppField name="paymentProof">
              {(field) => {
                const hasFile = field.state.value;

                return (
                  <div className="space-y-2">
                    <Label>Upload Payment Receipt</Label>
                    <button
                      className={cn(
                        "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                        hasFile && "border-green-500 bg-green-50/50",
                        !hasFile &&
                          "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                        dragActive && !hasFile && "border-primary bg-primary/5",
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => {
                        handleDrop(e);
                        if (e.dataTransfer.files?.[0]) {
                          field.handleChange(e.dataTransfer.files[0]);
                        }
                      }}
                      type="button"
                    >
                      <input
                        accept="image/png,image/jpeg,image/jpg"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            field.handleChange(e.target.files[0]);
                          }
                        }}
                        tabIndex={-1}
                        type="file"
                      />

                      {hasFile ? (
                        <>
                          <CheckCircle2 className="mb-2 h-8 w-8 text-green-600" />
                          <span className="font-medium text-green-600">
                            Receipt Uploaded Successfully
                          </span>
                          <Badge className="mt-2" variant="outline">
                            {hasFile.name}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 text-muted-foreground text-xs">
                            PNG, JPG up to 5MB
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              }}
            </form.AppField>
          </div>
        ) : null
      }
    </form.Subscribe>
  );
}
