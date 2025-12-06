import { Banknote, CreditCard, Users } from "lucide-react";
import Image from "next/image";
import { Activity, type FormEvent } from "react";
import IBCBPIQRCode from "@/../public/info/sampleqr.jpeg";
import FormButtons from "@/components/FormButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Item, ItemContent, ItemHeader, ItemTitle } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep3 } from "@/hooks/useRegistrationStep3";
import { StandardRegistrationStep3Schema } from "@/lib/validation/registration/standard";

const BANK_DETAILS = {
  bankName: "BPI",
  accountName: "Iloilo Business Club",
  accountNumber: "00023291387",
} as const;

export default function Step3() {
  const f = useRegistrationStep3();

  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const setStep = useRegistrationStore((s) => s.setStep);
  const onBack = async () => {
    setStep(2);
    setRegistrationData({
      step3: f.state.values,
    });
  };

  const onNext = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    f.handleSubmit({ nextStep: true });
  };
  return (
    <form onSubmit={onNext} className="space-y-4">
      <Item>
        <ItemHeader>
          <ItemTitle>
            <Banknote /> Payment Information
          </ItemTitle>
        </ItemHeader>
        <ItemContent className="flex flex-col items-end w-full">
          <PaymentDetails />
        </ItemContent>
      </Item>
      <Card>
        <CardHeader>
          <CardTitle>
            <h4>Select a Payment Method</h4>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <f.AppField
            name="paymentMethod"
            listeners={{
              onChange: () => {
                if (!f.getFieldValue("paymentProof")) {
                  f.resetField("paymentProof");
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
                      const result =
                        StandardRegistrationStep3Schema.shape.paymentMethod.safeParse(
                          value,
                        );
                      if (!result.success) {
                        return;
                      }
                      field.handleChange(result.data);
                    }}
                  >
                    <FieldLabel htmlFor="online">
                      <Field orientation={"horizontal"}>
                        <FieldContent>
                          <FieldTitle className="font-semibold">
                            <CreditCard /> Pay Online (BPI only)
                          </FieldTitle>
                          <FieldDescription>
                            Pay online through BPI, and submit proof of
                            payment/s
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
                            <Users /> Pay Onsite (on event)
                          </FieldTitle>
                          <FieldDescription>
                            Pay in person at the event venue
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
          </f.AppField>
        </CardContent>
      </Card>
      <f.Subscribe selector={(s) => s.values.paymentMethod}>
        {(paymentMethod) => (
          <Activity mode={paymentMethod === "online" ? "visible" : "hidden"}>
            <f.AppField name="paymentProof">
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
            </f.AppField>
          </Activity>
        )}
      </f.Subscribe>
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
    <>
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
    </>
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
