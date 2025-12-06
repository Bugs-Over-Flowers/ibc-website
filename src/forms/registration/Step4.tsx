import { formatDate } from "date-fns";
import { CircleAlert } from "lucide-react";
import Image from "next/image";
import type { FormEvent } from "react";
import FormButtons from "@/components/FormButtons";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep4 } from "@/hooks/useRegistrationStep4";
import type { getAllMembers } from "@/server/members/queries";

interface Step4Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function Step4({ members }: Step4Props) {
  const f = useRegistrationStep4();
  const setStep = useRegistrationStore((s) => s.setStep);
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);

  const { businessMemberId, nonMemberName, member } =
    registrationData?.step1 || {};
  const { principalRegistrant, otherRegistrants } =
    registrationData?.step2 || {};

  const { paymentMethod, paymentProof } = registrationData?.step3 || {};

  const paymentProofUrl = paymentProof
    ? URL.createObjectURL(paymentProof)
    : null;
  const memberName = members.find(
    (m) => m.businessMemberId === businessMemberId,
  )?.businessName;

  const onNext = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    f.handleSubmit({ nextStep: true });
  };

  return (
    <form className="space-y-3" onSubmit={onNext}>
      <div>
        <h2>Confirm Registration</h2>
        <p>Please review your registration details below:</p>
      </div>
      <ItemGroup className="space-y-3">
        <Item variant={"outline"}>
          <ItemContent className="flex flex-col gap-3">
            <ItemTitle>Event</ItemTitle>
            <div>
              <ItemDescription>{eventDetails?.eventTitle}</ItemDescription>
              {eventDetails?.eventStartDate && (
                <p>
                  {formatDate(eventDetails?.eventStartDate, "MMMM d, yyyy")}
                </p>
              )}
            </div>
            <ItemSeparator />
            <div>
              <ItemTitle>Participant Information</ItemTitle>
              <h4>{member === "member" ? memberName : nonMemberName}</h4>
              <ItemSeparator />
              <div className="py-3">
                <span className="font-semibold">
                  {1 + (otherRegistrants?.length ?? 0)} Participants{" "}
                </span>
                to Register
              </div>
              <div className="py-2">
                <div className="font-semibold">Participant 1</div>
                <div>
                  {principalRegistrant?.firstName}{" "}
                  {principalRegistrant?.lastName}
                </div>
                <div>{principalRegistrant?.email}</div>
              </div>
              {otherRegistrants && otherRegistrants.length > 0 && (
                <>
                  <div>Other People:</div>
                  {otherRegistrants?.map((person, idx) => (
                    <div key={person.firstName} className="py-2">
                      <div className="font-semibold">Participant {idx + 2}</div>
                      <div>
                        {person.firstName} {person.lastName}
                      </div>
                      <div>{person.email}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <ItemSeparator />
            <div>
              <ItemTitle>Payment</ItemTitle>
              <div className="flex justify-between">
                <div>Payment Method</div>
                <div>
                  <Badge variant={"secondary"}>{paymentMethod}</Badge>
                </div>
              </div>
              {paymentProofUrl && (
                <div className="pt-5 flex flex-col w-full gap-3">
                  <div> Proof of Payment</div>
                  <ImageZoom>
                    <Image
                      src={paymentProofUrl}
                      alt="Payment Proof"
                      width={200}
                      height={150}
                      className="rounded-md self-center justify-self-center"
                    />
                  </ImageZoom>
                </div>
              )}
            </div>
          </ItemContent>
        </Item>
        <Item variant={"outline"} className="h-max">
          <ItemMedia>
            <CircleAlert />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Note</ItemTitle>
            <ItemDescription>
              {paymentMethod === "online" ? (
                <>
                  Your payment is pending for approval. Once you confirm your
                  registration, the admin will review your payment and approve
                  it. You may receive an email notification once your payment is
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
      </ItemGroup>
      <f.AppField name="termsAndConditions">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div>
              <Field orientation="horizontal">
                <Checkbox
                  name={field.name}
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                  aria-invalid={isInvalid}
                />
                <div className="flex gap-1">
                  <Label htmlFor={field.name}>I have read the </Label>
                  <TermsAndConditions
                    triggerOverride={
                      <button
                        className="text-medium text-sm hover:underline"
                        type="button"
                      >
                        Terms and Conditions
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
                <FieldError errors={field.state.meta.errors} />
              </Field>
            </div>
          );
        }}
      </f.AppField>
      <FormButtons onNext={onNext} onBack={() => setStep(3)} />
    </form>
  );
}
