import { Banknote, CreditCard, Users } from "lucide-react";
import Image from "next/image";
import { Activity, type FormEvent } from "react";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep3 } from "@/hooks/useRegistrationStep3";
import type { StandardRegistrationStep3Schema } from "@/lib/validation/registration/standard";
import { PaymentMethodEnum } from "@/lib/validation/utils";

const BANK_DETAILS = {
  bankName: "BPI",
  accountName: "Iloilo Business Club",
  accountNumber: "00023291387",
} as const;

export default function Step3() {
  const form = useRegistrationStep3();

  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const setStep = useRegistrationStore((state) => state.setStep);
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
  return (
    <form onSubmit={onNext} className="space-y-4">
      <Item>
        <ItemContent className="space-y-5">
          <div className="flex items-center gap-2">
            <Banknote size={20} />
            <ItemTitle>Payment Information</ItemTitle>
          </div>
          <PaymentDetails />
        </ItemContent>
      </Item>
      <Card>
        <CardHeader>
          <CardTitle>
            <h4>Select a Payment Method</h4>
          </CardTitle>
          <CardDescription>
            Choose a payment method that you prefer. Currently, we only support
            BPI payments and onsite payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppField
            name="paymentMethod"
            listeners={{
              onChange: () => {
                if (!form.getFieldValue("paymentProof")) {
                  form.resetField("paymentProof");
                }
              },
            }}
          >
            {(field) => {
              return (
                <FieldSet>
                  <FieldLabel>Payment Method</FieldLabel>
                  <RadioGroup
                    defaultValue="online"
                    value={field.state.value}
                    onValueChange={(value) => {
                      const parsedPaymentMethodValue =
                        PaymentMethodEnum.safeParse(value);
                      if (!parsedPaymentMethodValue.success) {
                        return;
                      }
                      field.handleChange(parsedPaymentMethodValue.data);
                    }}
                  >
                    <FieldLabel htmlFor="online">
                      <Field orientation={"horizontal"}>
                        <FieldContent>
                          <FieldTitle className="font-semibold">
                            <CreditCard /> Pay Online (BPI only)
                          </FieldTitle>
                          <FieldDescription>
                            Pay online through BPI and submit a proof of payment
                          </FieldDescription>
                          <RadioGroupItem
                            value={
                              "online" as StandardRegistrationStep3Schema["paymentMethod"]
                            }
                            variant={"noIcon"}
                            id="online"
                          />
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="onsite">
                      <Field orientation={"horizontal"}>
                        <FieldContent>
                          <FieldTitle className="font-semibold">
                            <Users /> Pay Onsite (On Event)
                          </FieldTitle>
                          <FieldDescription>
                            Pay in person at the event
                          </FieldDescription>
                          <RadioGroupItem
                            value={
                              "onsite" as StandardRegistrationStep3Schema["paymentMethod"]
                            }
                            variant={"noIcon"}
                            id="onsite"
                          />
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              );
            }}
          </form.AppField>
        </CardContent>
      </Card>
      <form.Subscribe selector={(state) => state.values.paymentMethod}>
        {(paymentMethod) => (
          <Activity mode={paymentMethod === "online" ? "visible" : "hidden"}>
            <form.AppField name="paymentProof">
              {(field) => {
                const localImageUrl =
                  field.state.value && URL.createObjectURL(field.state.value);

                return (
                  <Card>
                    <CardContent className="flex flex-col items-center space-y-3">
                      <BankTransferDetails />
                      <Field data-invalid={!field.state.meta.isValid}>
                        <FieldLabel htmlFor="upload proof">
                          Upload Proof of Payment
                        </FieldLabel>
                        <FieldContent className="space-y-3">
                          <Dropzone
                            maxSize={1024 * 1024 * 10}
                            accept={{
                              "image/*": [],
                            }}
                            onDrop={(files) => {
                              if (files[0]) {
                                field.handleChange(files[0]);
                              }
                            }}
                            maxFiles={1}
                            onError={console.error}
                            src={
                              field.state.value
                                ? [field.state.value]
                                : undefined
                            }
                          >
                            <DropzoneEmptyState />

                            <DropzoneContent />
                          </Dropzone>

                          {field.state.value && (
                            <Button
                              onClick={() => {
                                field.handleChange(undefined);
                              }}
                              type="button"
                            >
                              Remove File
                            </Button>
                          )}
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>

                      {localImageUrl && (
                        <ImageZoom>
                          <Image
                            src={localImageUrl}
                            alt="Image Preview"
                            width={400}
                            height={200}
                            className="object-contain"
                          />
                          <div className="text-neutral-400 text-sm text-center">
                            click image to zoom
                          </div>
                        </ImageZoom>
                      )}
                    </CardContent>
                  </Card>
                );
              }}
            </form.AppField>
          </Activity>
        )}
      </form.Subscribe>
      <FormButtons onNext={onNext} onBack={onBack} />
    </form>
  );
}

function PaymentDetails() {
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);

  const totalPayment = () => {
    const baseFee = eventDetails?.registrationFee || 0;
    const otherRegistrants = registrationData?.step2?.otherRegistrants || [];
    const total = baseFee + otherRegistrants.length * baseFee;
    return total.toFixed(2);
  };

  return (
    <div>
      <div className="flex justify-between w-full">
        <div>Registration Fee per head</div>
        <div>₱ {eventDetails?.registrationFee}</div>
      </div>
      <div className="flex justify-between w-full">
        <div>Total Number of Participants</div>
        <div>
          {registrationData?.step2?.otherRegistrants?.length
            ? registrationData.step2.otherRegistrants.length + 1
            : 1}
        </div>
      </div>
      <div className="flex justify-between w-full text-xl font-semibold">
        <div>Total Amount</div>
        <div>₱ {totalPayment()}</div>
      </div>
    </div>
  );
}

function BankTransferDetails() {
  return (
    <>
      <h4>Bank Transfer Details</h4>
      <div className="relative  h-40 w-40">
        <Image src={IBCBPIQRCode} alt="qr code" fill className="object-fill" />
      </div>
      <div>
        {BANK_DETAILS.bankName} - {BANK_DETAILS.accountNumber}
      </div>
    </>
  );
}
