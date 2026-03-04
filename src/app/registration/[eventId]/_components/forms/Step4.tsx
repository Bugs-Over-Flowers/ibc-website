import { formatDate } from "date-fns";
import { CircleAlert, User } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
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
import { cn } from "@/lib/utils";
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

  const onNext = (e?: React.SubmitEvent) => {
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
  const sponsorFeeDeduction = useRegistrationStore(
    (state) => state.sponsorFeeDeduction,
  );
  const sponsorUuid = useRegistrationStore((state) => state.sponsorUuid);

  const paymentProofUrl =
    step3Data.paymentMethod === "online" && step3Data.paymentProof
      ? URL.createObjectURL(step3Data.paymentProof)
      : null;

  const participantCount = otherParticipants.length + 1;
  const baseFee = eventDetails?.registrationFee ?? 0;
  const subtotal = baseFee * participantCount;
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <h4>Payment Summary</h4>
          {isSponsored && (
            <span className="ml-auto rounded-full bg-green-600 px-2.5 py-0.5 font-semibold text-white text-xs dark:bg-green-700">
              Sponsored
            </span>
          )}
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
              }).format(baseFee)}
              <span className="ml-1 text-muted-foreground text-xs">/ head</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Participants</span>
            <span>{participantCount}</span>
          </div>

          <Separator className="my-2 bg-border/50" />

          <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between rounded-lg bg-green-600/10 px-3 py-2.5 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <div className="flex flex-col">
                  <span className="font-medium">Sponsor Discount</span>
                  <span className="text-green-700/70 text-xs dark:text-green-300/80">
                    ₱{sponsorFeeDeduction?.toLocaleString()} ×{" "}
                    {participantCount} heads
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
              <Separator className="my-2 bg-border/50" />
            </>
          )}

          <div
            className={cn(
              "flex items-center justify-between font-semibold text-base",
              isSponsored && "text-green-700 dark:text-green-300",
            )}
          >
            <span>Total Amount</span>
            <span
              className={cn(
                "text-lg text-primary",
                isSponsored && "text-green-700 dark:text-green-300",
              )}
            >
              {Intl.NumberFormat("en-US", {
                currency: "PHP",
                style: "currency",
              }).format(total)}
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
