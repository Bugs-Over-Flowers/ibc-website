import { Banknote } from "lucide-react";
import Image from "next/image";
import { Activity, type FormEvent, useRef } from "react";
import IBCBPIQRCode from "@/../public/info/sampleqr.jpeg";
import FormButtons from "@/components/FormButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemHeader, ItemTitle } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep3 } from "@/hooks/useRegistrationStep3";
import { StandardRegistrationStep3Schema } from "@/lib/validation/registration/standard";

export default function Step3() {
  const f = useRegistrationStep3();
  // const registrationData = useRegistrationStore((s) => s.registrationData);
  // const eventDetails = useRegistrationStore((s) => s.eventDetails);

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

  const paymentProofRef = useRef<HTMLInputElement | null>(null);

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
          <f.AppField name="paymentMethod">
            {(field) => {
              return (
                <FieldSet>
                  <RadioGroup
                    defaultValue="online"
                    value={field.state.value}
                    onValueChange={(value) => {
                      const result =
                        StandardRegistrationStep3Schema.shape.paymentMethod.safeParse(
                          value,
                        );

                      console.log(result.error);

                      if (!result.success) {
                        return;
                      }

                      field.handleChange(result.data);
                    }}
                  >
                    <FieldLabel htmlFor="online">
                      <Field orientation={"horizontal"}>
                        <FieldContent>
                          <FieldTitle>
                            <h4>Pay Online (BPI only)</h4>
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
                          <FieldTitle>
                            <h4>Pay Onsite (on event)</h4>
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
            <Card>
              <CardContent>
                <f.AppField name="paymentProof">
                  {(field) => {
                    console.log(field.state.value);
                    return (
                      <>
                        <BankTransferDetails />
                        <Field>
                          <FieldLabel htmlFor="upload proof">
                            Upload Proof of Payment
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              name="upload proof"
                              ref={paymentProofRef}
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const proofURL = URL.createObjectURL(file);
                                  field.handleChange(proofURL);
                                }
                              }}
                            />
                            {field.state.value && (
                              <Button
                                onClick={() => {
                                  if (paymentProofRef.current) {
                                    paymentProofRef.current.value = "";
                                  }
                                  field.handleChange("");
                                }}
                                type="button"
                              >
                                Remove File
                              </Button>
                            )}
                          </FieldContent>
                        </Field>
                        {field.state.value && field.state.value !== "" && (
                          <Image
                            src={field.state.value}
                            alt="Payment Proof"
                            width={100}
                            height={100}
                          />
                        )}
                      </>
                    );
                  }}
                </f.AppField>
              </CardContent>
            </Card>
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
    return total;
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
      <Image src={IBCBPIQRCode} width={100} height={100} alt="qr code" />
    </>
  );
}
