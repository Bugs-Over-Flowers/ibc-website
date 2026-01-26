import { Banknote, Building, CreditCard, Upload, Users, X } from "lucide-react";
import Image from "next/image";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import IBCBPIQRCode from "@/../public/info/sampleqr.jpeg";
import FormButtons from "@/components/FormButtons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import useRegistrationStore from "@/hooks/registration.store";
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

  const onNext = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
        form.getFieldValue("paymentProof");
        // Access field through form context to update
        const field = form.state.fieldMeta.paymentProof;
        if (field) {
          e.dataTransfer.files[0];
        }
      }
    },
    [form],
  );

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

  const baseFee = eventDetails?.registrationFee || 0;
  const otherParticipantsCount =
    registrationData?.step2?.otherParticipants?.length || 0;
  const participantCount = otherParticipantsCount + 1;

  const total = baseFee * participantCount;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Registration Fee</span>
        <span>
          {Intl.NumberFormat("en-US", {
            currency: "PHP",
            style: "currency",
          }).format(baseFee)}{" "}
          × {participantCount}
        </span>
      </div>
      <Separator className="bg-border/50" />
      <div className="flex items-center justify-between">
        <span className="font-medium">Total Amount</span>
        <span className="font-semibold text-lg text-primary">
          {Intl.NumberFormat("en-US", {
            currency: "PHP",
            style: "currency",
          }).format(total)}
        </span>
      </div>
    </div>
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
            if (!form.getFieldValue("paymentProof")) {
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
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
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
