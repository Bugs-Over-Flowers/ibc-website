import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  UploadCloud,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import type { DragEvent, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
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
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";
import { PaymentMethodEnum } from "@/lib/validation/utils";
import { useRegistrationStep3 } from "../../_hooks/useRegistrationStep3";

const BANK_DETAILS = {
  bankName: "BPI",
  accountName: "Iloilo Business Club, Inc.",
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
      <Card className="w-full overflow-hidden rounded-2xl border-none bg-transparent shadow-none ring-0">
        <CardHeader className="border-border/30 border-b bg-card/5 pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 font-semibold text-xl sm:text-2xl">
            <CreditCard className="h-6 w-6 text-primary" />
            Payment Information
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Select your preferred payment method and upload proof if paying
            online.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-0 sm:px-6">
          <PaymentSummary />
          <PaymentMethodSelection form={form} />
          <PaymentProofUpload
            dragActive={dragActive}
            form={form}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
          />

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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">Number of Participants</span>
          <span className="font-medium">{participantCount}</span>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">Fee per Participant</span>
          <span className="font-medium">PHP {baseFee.toLocaleString()}</span>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            Subtotal ({participantCount} × PHP {baseFee.toLocaleString()})
          </span>
          <span className="font-medium">PHP {subtotal.toLocaleString()}</span>
        </div>

        {sponsorDiscount > 0 && (
          <div className="flex flex-col gap-1 text-green-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Sponsor Discount ({sponsoredBy})</span>
            <span className="font-medium">
              -PHP {sponsorDiscount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1 border-primary/20 border-t pt-3 font-bold text-foreground text-lg sm:flex-row sm:items-center sm:justify-between">
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
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const isValidPaymentProof = (file: File): boolean => {
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxFileSize = 5 * 1024 * 1024;
    return allowedMimeTypes.includes(file.type) && file.size <= maxFileSize;
  };

  useEffect(() => {
    const paymentMethod = form.state.values.paymentMethod;
    const selectedFile =
      paymentMethod === PaymentMethodEnum.enum.online
        ? form.state.values.paymentProof
        : undefined;

    if (!selectedFile) {
      setProofPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setProofPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [form.state.values.paymentMethod, form.state.values]);

  return (
    <form.Subscribe selector={(state) => state.values.paymentMethod}>
      {(paymentMethod) =>
        paymentMethod === PaymentMethodEnum.enum.online ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-linear-to-br from-primary/5 to-primary/2 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    Bank Transfer Details
                  </h4>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Use your registration ID as payment reference
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium text-foreground">
                    (BPI) Bank of the Philippine Islands
                  </span>
                </div>
                <div className="border-border/20 border-t" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium font-mono text-foreground">
                    {BANK_DETAILS.accountNumber}
                  </span>
                </div>
                <div className="border-border/20 border-t" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Name</span>
                  <span className="font-medium text-foreground">
                    {BANK_DETAILS.accountName}
                  </span>
                </div>
              </div>

              <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-border">
                <Image
                  alt="BPI QR code"
                  className="object-cover"
                  fill
                  src={IBCBPIQRCode}
                />
              </div>
            </div>

            <form.AppField name="paymentProof">
              {(field) => {
                const selectedFile = field.state.value as File | undefined;

                return (
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground text-sm">
                      Upload Proof of Payment *
                    </Label>
                    <div className="space-y-2 rounded-xl bg-background p-0">
                      <button
                        className={cn(
                          "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                          selectedFile &&
                            "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15",
                          !selectedFile &&
                            "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                          dragActive &&
                            !selectedFile &&
                            "border-primary bg-primary/5",
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => {
                          handleDrop(e);
                          if (e.dataTransfer.files?.[0]) {
                            const droppedFile = e.dataTransfer.files[0];
                            if (!isValidPaymentProof(droppedFile)) {
                              return;
                            }

                            field.handleChange(droppedFile);
                          }
                        }}
                        type="button"
                      >
                        <input
                          accept="image/png,image/jpeg,image/jpg"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file || !isValidPaymentProof(file)) {
                              return;
                            }

                            field.handleChange(file);
                          }}
                          tabIndex={-1}
                          type="file"
                        />

                        {selectedFile ? (
                          <>
                            {proofPreview ? (
                              <Image
                                alt="Payment proof preview"
                                className="mt-3 h-12 w-12 rounded-md object-contain"
                                height={48}
                                src={proofPreview}
                                unoptimized
                                width={48}
                              />
                            ) : null}
                            <span className="font-medium text-emerald-700 dark:text-emerald-300">
                              Proof Uploaded Successfully
                            </span>
                            <Badge className="mt-2" variant="outline">
                              {selectedFile.name}
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

                      {selectedFile ? (
                        <div className="mt-3 flex justify-center">
                          <Button
                            className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => field.handleChange(undefined)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Remove payment proof
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <FieldError errors={field.state.meta.errors} />
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
