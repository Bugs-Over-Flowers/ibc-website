import { formatDate } from "date-fns";
import { CircleAlert, User } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useMemo } from "react";
import FormButtons from "@/components/FormButtons";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep4 } from "@/hooks/useRegistrationStep4";
import type { getAllMembers } from "@/server/members/queries";

interface Step4Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function Step4({ members }: Step4Props) {
  const form = useRegistrationStep4();
  const setStep = useRegistrationStore((state) => state.setStep);
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  const step1Data = useRegistrationStore(
    (state) => state.registrationData.step1,
  );

  const {
    step3,
    step2: { principalRegistrant, otherRegistrants },
  } = registrationData;

  const paymentProofUrl =
    step3.paymentMethod === "online" && step3.paymentProof
      ? URL.createObjectURL(step3.paymentProof)
      : null;

  const memberName = useMemo(() => {
    if (step1Data.member === "member") {
      return members.find(
        (m) => m.businessMemberId === step1Data.businessMemberId,
      )?.businessName;
    }
    return "";
  }, [members, step1Data]);

  const onNext = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form className="space-y-3" onSubmit={onNext}>
      <Item>
        <ItemContent>
          <div className="flex items-center gap-2">
            <User size={18} />
            <ItemTitle>Confirm Registration</ItemTitle>
          </div>
          <ItemDescription>
            Please review your registration details below.
          </ItemDescription>
        </ItemContent>
      </Item>

      <Card>
        <CardContent>
          <h4>Event Details</h4>
          <p>{eventDetails?.eventTitle}</p>

          <p className="text-sm">
            {eventDetails?.eventStartDate &&
              formatDate(eventDetails?.eventStartDate, "MMMM d, yyyy")}
          </p>
        </CardContent>
        <Separator />
        <CardContent className="flex flex-col gap-3">
          <h4>Participant Information</h4>
          <div className="flex flex-col md:flex-row md:items-center md:gap-5">
            <div>
              {step1Data.member === "member"
                ? memberName
                : step1Data.nonMemberName}
            </div>
            <Badge className="my-3">
              <span className="font-semibold">
                {1 + (otherRegistrants?.length ?? 0)} Participants
              </span>
            </Badge>
          </div>
          <div>
            {/* You */}
            <div>
              <Item variant={"muted"}>
                <ItemContent>
                  <div>
                    {principalRegistrant?.firstName}{" "}
                    {principalRegistrant?.lastName}
                  </div>
                  <div>{principalRegistrant?.email}</div>
                </ItemContent>
              </Item>
            </div>

            {/* Other Participants */}
            {otherRegistrants && otherRegistrants.length > 0 && (
              <>
                <div className="pt-3">Other People:</div>
                <div className="space-y-3">
                  {otherRegistrants?.map((person) => (
                    <Item key={person.firstName} variant={"outline"}>
                      <ItemContent>
                        {person.firstName} {person.lastName}
                      </ItemContent>
                    </Item>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>

        <Separator />
        <CardContent className="space-y-4">
          <h4>Payment</h4>
          <div className="flex justify-between">
            <div>Payment Method</div>
            <div>
              <Badge variant={"secondary"}>{step3.paymentMethod}</Badge>
            </div>
          </div>
          {paymentProofUrl && (
            <div className="pt-5 flex flex-col w-full gap-3">
              <div> Proof of Payment</div>
              <Image
                src={paymentProofUrl}
                alt="Payment Proof"
                width={200}
                height={150}
                className="rounded-md self-center justify-self-center"
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="text-sm">Registration Fee</div>
              <div>{eventDetails?.registrationFee ?? 0}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm">Total People</div>
              <div>{otherRegistrants.length + 1}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm">Total Amount</div>
              <div>
                {(eventDetails?.registrationFee ?? 0) *
                  (otherRegistrants.length + 1)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Item variant={"outline"}>
        <ItemMedia>
          <CircleAlert />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Note</ItemTitle>
          <ItemDescription>
            {step3.paymentMethod === "online" ? (
              <>
                Your payment is pending for approval. Once you confirm your
                registration, the admin will review your payment and approve it.
                You may receive an email notification once your payment is
                declined.
              </>
            ) : (
              <>
                Please ensure to be able to settle the full payment before the
                event. You may opt to pay on the event proper or on the IBC
                Office.
              </>
            )}
          </ItemDescription>
        </ItemContent>
      </Item>
      <form.AppField name="termsAndConditions">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="py-3">
              <Field orientation="horizontal">
                <Checkbox
                  name={field.name}
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                />
                <Label htmlFor={field.name}>
                  I have read the Terms and Conditions.{" "}
                </Label>
                <FieldError errors={field.state.meta.errors} />
              </Field>
              <div className="pt-2">
                <TermsAndConditions
                  triggerOverride={
                    <button
                      className="text-medium text-sm hover:underline"
                      type="button"
                    >
                      Read Terms and Conditions here
                    </button>
                  }
                  customAcceptButton={(closeTermsAndConditions) => (
                    <Button
                      onClick={() => {
                        field.handleChange(true);
                        closeTermsAndConditions();
                      }}
                    >
                      Accept
                    </Button>
                  )}
                />
              </div>
            </div>
          );
        }}
      </form.AppField>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <div className="flex justify-end">
            <FormButtons
              onNext={onNext}
              onBack={() => setStep(3)}
              submitting={isSubmitting}
            />
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
