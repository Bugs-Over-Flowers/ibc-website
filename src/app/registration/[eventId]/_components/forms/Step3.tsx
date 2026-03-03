import { Banknote, Building, CreditCard, Upload, Users, X } from "lucide-react";
import Image from "next/image";
import type { DragEvent, FormEvent } from "react";
import { useCallback, useState } from "react";
import IBCBPIQRCode from "@/../public/info/sampleqr.jpeg";
import FormButtons from "@/components/FormButtons";
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
import { Separator } from "@/components/ui/separator";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";
import { PaymentMethodEnum } from "@/lib/validation/utils";
import { useRegistrationStep3 } from "../../_hooks/useRegistrationStep3";
import RegistrationStepHeader from "./RegistrationStepHeader";

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
    <form className="space-y-6" onSubmit={onNext}>
      <RegistrationStepHeader
        description="Select your preferred payment method and complete payment details."
        Icon={Banknote}
        title="Payment Method"
      />

      <PaymentDetails />

      <PaymentMethodSelection form={form} />

      <PaymentProofUpload
        dragActive={dragActive}
        form={form}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
      />

      <FormButtons onBack={onBack} onNext={onNext} />
    </form>
  );
}

function PaymentDetails() {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);
  const sponsorFeeDeduction = useRegistrationStore(
    (s) => s.sponsorFeeDeduction,
  );
  const sponsorUuid = useRegistrationStore((s) => s.sponsorUuid);
  const sponsoredBy = useRegistrationStore((s) => s.sponsoredBy);

  const baseFee = eventDetails?.registrationFee || 0;
  const otherParticipantsCount =
    registrationData?.step2?.otherParticipants?.length || 0;
  const participantCount = otherParticipantsCount + 1;

  const subtotal = baseFee * participantCount;

  // Apply sponsor deduction to each participant
  const totalSponsorDiscount = sponsorFeeDeduction
    ? sponsorFeeDeduction * participantCount
    : 0;
  const total = subtotal - totalSponsorDiscount;
  const isSponsored = !!(sponsorUuid && sponsorFeeDeduction);

  return (
    <Card
      className={cn(
        "border-dashed bg-muted/30",
        isSponsored &&
          "border-green-600/40 bg-green-50/60 dark:border-green-500/30 dark:bg-green-950/20",
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-medium text-base">
          <Banknote className="size-4 text-muted-foreground" />
          Payment Summary
          {isSponsored && (
            <span className="ml-auto rounded-full bg-green-600 px-2.5 py-0.5 font-semibold text-white text-xs dark:bg-green-700">
              Sponsored
            </span>
          )}
        </CardTitle>
        {isSponsored && sponsoredBy ? (
          <CardDescription>Sponsored by {sponsoredBy}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2">
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground">Registration Fee</span>
            <span>
              {Intl.NumberFormat("en-US", {
                currency: "PHP",
                style: "currency",
              }).format(baseFee)}
              <span className="ml-1 text-muted-foreground text-xs">/ head</span>
            </span>
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground">Total Participants</span>
            <span>{participantCount}</span>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="flex w-full items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {Intl.NumberFormat("en-US", {
              currency: "PHP",
              style: "currency",
            }).format(subtotal)}
          </span>
        </div>

        {totalSponsorDiscount > 0 && (
          <>
            <div className="flex w-full items-center justify-between rounded-lg bg-green-600/10 px-3 py-2.5 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <div className="flex flex-col">
                <span className="font-medium">Sponsor Discount</span>
                <span className="text-green-700/70 text-xs dark:text-green-300/80">
                  ₱{sponsorFeeDeduction?.toLocaleString()} × {participantCount}{" "}
                  heads
                </span>
              </div>
              <span className="font-semibold">
                -
                {Intl.NumberFormat("en-US", {
                  currency: "PHP",
                  style: "currency",
                }).format(totalSponsorDiscount)}
              </span>
            </div>
            <Separator className="bg-border/50" />
          </>
        )}

        <div
          className={cn(
            "flex w-full items-center justify-between font-semibold",
            isSponsored
              ? "text-green-700 text-lg dark:text-green-300"
              : "text-lg",
          )}
        >
          <span>Total Amount</span>
          <span
            className={cn(
              "text-primary",
              isSponsored && "text-green-700 dark:text-green-300",
            )}
          >
            {Intl.NumberFormat("en-US", {
              currency: "PHP",
              style: "currency",
            }).format(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentMethodSelectionProps {
  form: ReturnType<typeof useRegistrationStep3>;
}

function PaymentMethodSelection({ form }: PaymentMethodSelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Payment Method</Label>
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
          return (
            <RadioGroup
              className="space-y-3"
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
              <Label
                className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                htmlFor="online"
              >
                <RadioGroupItem className="mt-0.5" id="online" value="online" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      Bank Transfer
                    </span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground text-sm">
                    Pay online through bank transfer and upload proof of payment
                  </p>
                </div>
              </Label>

              <Label
                className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                htmlFor="onsite"
              >
                <RadioGroupItem className="mt-0.5" id="onsite" value="onsite" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      Pay Onsite
                    </span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground text-sm">
                    Pay in person at the event venue
                  </p>
                </div>
              </Label>
            </RadioGroup>
          );
        }}
      </form.AppField>
    </div>
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
          <div className="space-y-4 border-primary/30 border-l-2 pl-4">
            {/* Bank Info */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium text-sm">
                <Building className="h-4 w-4" />
                Bank Details
              </Label>
              <div className="space-y-2 rounded-lg bg-muted/30 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{BANK_DETAILS.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name</span>
                  <span className="font-medium">
                    {BANK_DETAILS.accountName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium font-mono">
                    {BANK_DETAILS.accountNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-border">
              <Image
                alt="qr code"
                className="object-cover"
                fill
                src={IBCBPIQRCode}
              />
            </div>

            {/* Upload Area */}
            <form.AppField name="paymentProof">
              {(field) => {
                const hasFile = field.state.value;

                return (
                  <div className="space-y-2">
                    <Label className="font-medium text-sm">
                      Proof of Payment
                    </Label>
                    {hasFile ? (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {hasFile?.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {hasFile &&
                                (hasFile.size / 1024 / 1024).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <Button
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => field.handleChange(undefined)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className={`relative w-full cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                          dragActive
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
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
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground text-sm">
                          Drag & drop or{" "}
                          <span className="font-medium text-primary">
                            browse
                          </span>
                        </p>
                        <p className="mt-1 text-muted-foreground text-xs">
                          PNG, JPG up to 10MB
                        </p>
                      </button>
                    )}
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
