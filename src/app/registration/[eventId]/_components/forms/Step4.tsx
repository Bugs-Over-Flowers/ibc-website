import { formatDate } from "date-fns";
import { CircleAlert, User } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useMemo } from "react";
import FormButtons from "@/components/FormButtons";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useRegistrationStore from "@/hooks/registration.store";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import { useRegistrationStep4 } from "../../_hooks/useRegistrationStep4";
import RegistrationStepHeader from "./RegistrationStepHeader";

interface Step4Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function Step4({ members }: Step4Props) {
  const form = useRegistrationStep4();
  const setStep = useRegistrationStore((state) => state.setStep);
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );

  const step1Data = registrationData.step1;
  const step2Data = registrationData.step2;
  const step3Data = registrationData.step3;

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
      <RegistrationStepHeader
        description="Please review your registration details below."
        Icon={User}
        title="Confirm Registration"
      />

      <EventDetailsSection />

      <ParticipantInformationSection
        memberName={memberName}
        otherParticipants={step2Data.otherParticipants}
        registrant={step2Data.registrant}
        step1Data={step1Data}
      />

      <PaymentSummarySection
        otherParticipants={step2Data.otherParticipants}
        step3Data={step3Data}
      />

      <PaymentNoteAlert paymentMethod={step3Data.paymentMethod} />

      <TermsAndConditionsField form={form} />

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <div className="flex justify-end">
            <FormButtons
              onBack={() => setStep(3)}
              onNext={onNext}
              submitting={isSubmitting}
            />
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}

function EventDetailsSection() {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  return (
    <Card className="border-dashed bg-muted/30">
      <CardHeader>
        <CardTitle>
          <h4>Event Details</h4>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">
            Review the implementation details.
          </p>
        </div>
        <div className="grid gap-1">
          <p className="font-medium text-primary">{eventDetails?.eventTitle}</p>

          <div className="flex items-center text-muted-foreground text-sm">
            {eventDetails?.eventStartDate &&
              formatDate(eventDetails?.eventStartDate, "MMMM d, yyyy")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ParticipantInformationSectionProps {
  step1Data: {
    member: string;
    businessMemberId?: string;
    nonMemberName?: string;
  };
  memberName: string | undefined;
  registrant: { firstName: string; lastName: string; email: string };
  otherParticipants: Array<{ firstName: string; lastName: string }>;
}

function ParticipantInformationSection({
  step1Data,
  memberName,
  registrant,
  otherParticipants,
}: ParticipantInformationSectionProps) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardHeader>
        <CardTitle>
          <h4>Participant Information</h4>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">
            Verify your personal and group information.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Affiliation</span>
            <span className="text-muted-foreground text-sm">
              {step1Data.member === "member"
                ? memberName
                : step1Data.nonMemberName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Total Participants</span>
            <Badge variant="outline">
              {1 + (otherParticipants?.length ?? 0)} Participants
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Primary Registrant */}
            <div className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-muted-foreground text-xs uppercase">
                  Primary Registrant
                </span>
                <div className="font-medium">
                  {registrant?.firstName} {registrant?.lastName}
                </div>
                <div className="text-muted-foreground text-sm">
                  {registrant?.email}
                </div>
              </div>
            </div>

            {/* Other Participants */}
            {otherParticipants && otherParticipants.length > 0 && (
              <div className="space-y-2">
                <div className="pt-2 font-semibold text-muted-foreground text-xs uppercase">
                  Additional Participants
                </div>
                <div className="grid gap-2">
                  {otherParticipants?.map((person, i) => (
                    <div
                      className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm"
                      key={`${person.firstName}-${i}`}
                    >
                      <span className="font-medium">
                        {person.firstName} {person.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentSummarySectionProps {
  step3Data: { paymentMethod: string; paymentProof?: File };
  otherParticipants: Array<unknown>;
}

function PaymentSummarySection({
  step3Data,
  otherParticipants,
}: PaymentSummarySectionProps) {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  const paymentProofUrl =
    step3Data.paymentMethod === "online" && step3Data.paymentProof
      ? URL.createObjectURL(step3Data.paymentProof)
      : null;

  return (
    <Card className="border-dashed bg-muted/30">
      <CardHeader>
        <CardTitle>
          <h4>Payment Summary</h4>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">
            Confirm your payment method and total.
          </p>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <Badge
              variant={
                step3Data.paymentMethod === "online" ? "default" : "secondary"
              }
            >
              {step3Data.paymentMethod === "online"
                ? "Online Payment"
                : "Onsite Payment"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Registration Fee</span>
            <span>
              {Intl.NumberFormat("en-US", {
                currency: "PHP",
                style: "currency",
              }).format(eventDetails?.registrationFee ?? 0)}
              <span className="ml-1 text-muted-foreground text-xs">/ head</span>
            </span>
          </div>

          <Separator className="my-2 bg-border/50" />

          <div className="flex items-center justify-between font-semibold text-base">
            <span>Total Amount</span>
            <span className="text-lg text-primary">
              {Intl.NumberFormat("en-US", {
                currency: "PHP",
                style: "currency",
              }).format(
                (eventDetails?.registrationFee ?? 0) *
                  (otherParticipants.length + 1),
              )}
            </span>
          </div>
        </div>

        {paymentProofUrl && (
          <div className="flex flex-col gap-2 pt-2">
            <span className="font-semibold text-muted-foreground text-xs uppercase">
              Payment Proof
            </span>
            <div className="relative aspect-video w-full max-w-[200px] self-start overflow-hidden rounded-md border bg-muted">
              <Image
                alt="Payment Proof"
                className="object-cover"
                fill
                src={paymentProofUrl}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PaymentNoteAlertProps {
  paymentMethod: string;
}

function PaymentNoteAlert({ paymentMethod }: PaymentNoteAlertProps) {
  return (
    <Alert>
      <CircleAlert />
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>
        {paymentMethod === "online" ? (
          <>
            Your payment is pending for approval. Once you confirm your
            registration, the admin will review your payment and approve it. You
            may receive an email notification once your payment is declined.
          </>
        ) : (
          <>
            Please ensure to be able to settle the full payment before the
            event. You may opt to pay on the event proper or on the IBC Office.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface TermsAndConditionsFieldProps {
  form: ReturnType<typeof useRegistrationStep4>;
}

function TermsAndConditionsField({ form }: TermsAndConditionsFieldProps) {
  return (
    <form.AppField name="termsAndConditions">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <div className="py-3">
            <Field orientation="horizontal">
              <Checkbox
                aria-invalid={isInvalid}
                checked={field.state.value}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
              />
              <Label htmlFor={field.name}>
                I have read the Terms and Conditions.{" "}
              </Label>
              <FieldError errors={field.state.meta.errors} />
            </Field>
            <div className="pt-2">
              <TermsAndConditions
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
                triggerOverride={
                  <button
                    className="text-medium text-sm hover:underline"
                    type="button"
                  >
                    Read Terms and Conditions here
                  </button>
                }
              />
            </div>
          </div>
        );
      }}
    </form.AppField>
  );
}
