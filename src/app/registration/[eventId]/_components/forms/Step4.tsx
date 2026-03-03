import { formatDate } from "date-fns";
import { Check, CircleAlert, User } from "lucide-react";
import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import FormButtons from "@/components/FormButtons";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field";
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

type Step1Data = {
  member: string;
  businessMemberId?: string;
  nonMemberName?: string;
};

type RegistrantData = {
  firstName: string;
  lastName: string;
  email: string;
};

type ParticipantData = {
  firstName: string;
  lastName: string;
};

type Step3Data = {
  paymentMethod: "online" | "onsite";
  paymentProof?: File;
};

const formatCurrency = (amount: number) =>
  Intl.NumberFormat("en-US", {
    currency: "PHP",
    style: "currency",
  }).format(amount);

export default function Step4({ members }: Step4Props) {
  const form = useRegistrationStep4();
  const setStep = useRegistrationStore((state) => state.setStep);
  const registrationData = useRegistrationStore(
    (state) => state.registrationData,
  );

  const step1Data = registrationData.step1 as Step1Data;
  const step2Data = registrationData.step2;
  const step3Data = registrationData.step3 as Step3Data;

  const memberName = useMemo(() => {
    if (step1Data.member === "member") {
      return members.find(
        (member) => member.businessMemberId === step1Data.businessMemberId,
      )?.businessName;
    }

    return "";
  }, [members, step1Data]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit({ nextStep: true });
  };

  const onNext = () => {
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <RegistrationStepHeader
        description="Please review your registration details before submitting."
        Icon={User}
        title="Review & Confirm"
      />

      <EventDetailsSection />

      <ParticipantInformationSection
        memberName={memberName}
        otherParticipants={step2Data.otherParticipants ?? []}
        registrant={step2Data.registrant as RegistrantData}
        step1Data={step1Data}
      />

      <PaymentSummarySection
        otherParticipants={step2Data.otherParticipants ?? []}
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
        <CardTitle className="text-base">Event Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-muted-foreground text-sm">
          Review the event you are registering for.
        </p>

        <div className="grid gap-1">
          <p className="font-medium text-primary">{eventDetails?.eventTitle}</p>
          <div className="flex items-center text-muted-foreground text-sm">
            {eventDetails?.eventStartDate &&
              formatDate(eventDetails.eventStartDate, "MMMM d, yyyy")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ParticipantInformationSectionProps {
  step1Data: Step1Data;
  memberName: string | undefined;
  registrant: RegistrantData;
  otherParticipants: ParticipantData[];
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
        <CardTitle className="text-base">Participant Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Verify your affiliation and participant list before submission.
        </p>

        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border bg-card p-3">
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

            {otherParticipants && otherParticipants.length > 0 ? (
              <div className="space-y-2">
                <div className="pt-2 font-semibold text-muted-foreground text-xs uppercase">
                  Additional Participants
                </div>
                <div className="grid gap-2">
                  {otherParticipants.map((person, index) => (
                    <div
                      className="flex items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm"
                      key={`${person.firstName}-${index}`}
                    >
                      <span className="font-medium">
                        {person.firstName} {person.lastName}
                      </span>
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentSummarySectionProps {
  step3Data: Step3Data;
  otherParticipants: ParticipantData[];
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
  const sponsoredBy = useRegistrationStore((state) => state.sponsoredBy);

  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (step3Data.paymentMethod !== "online" || !step3Data.paymentProof) {
      setPaymentProofUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(step3Data.paymentProof);
    setPaymentProofUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [step3Data.paymentMethod, step3Data.paymentProof]);

  const participantCount = otherParticipants.length + 1;
  const baseFee = eventDetails?.registrationFee ?? 0;
  const subtotal = baseFee * participantCount;
  const totalSponsorDiscount = sponsorFeeDeduction
    ? sponsorFeeDeduction * participantCount
    : 0;
  const total = Math.max(subtotal - totalSponsorDiscount, 0);
  const isSponsored = Boolean(sponsorUuid && sponsorFeeDeduction);

  return (
    <Card
      className={cn(
        "border-dashed bg-muted/30",
        isSponsored &&
          "border-green-600/40 bg-green-50/60 dark:border-green-500/30 dark:bg-green-950/20",
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Payment Summary
          {isSponsored ? (
            <span className="ml-auto rounded-full bg-green-600 px-2.5 py-0.5 font-semibold text-white text-xs dark:bg-green-700">
              Sponsored
            </span>
          ) : null}
        </CardTitle>
        {isSponsored && sponsoredBy ? (
          <CardDescription>Sponsored by {sponsoredBy}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <Badge
              variant={
                step3Data.paymentMethod === "online" ? "default" : "secondary"
              }
            >
              {step3Data.paymentMethod === "online"
                ? "Bank Transfer"
                : "Onsite Payment"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Registration Fee</span>
            <span>
              {formatCurrency(baseFee)}
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
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {totalSponsorDiscount > 0 ? (
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
                  -{formatCurrency(totalSponsorDiscount)}
                </span>
              </div>
              <Separator className="my-2 bg-border/50" />
            </>
          ) : null}

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
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {paymentProofUrl ? (
          <div className="flex flex-col gap-2 pt-2">
            <span className="font-semibold text-muted-foreground text-xs uppercase">
              Payment Proof
            </span>
            <div className="relative aspect-video w-full max-w-[220px] overflow-hidden rounded-md border bg-muted">
              <Image
                alt="Payment Proof"
                className="object-cover"
                fill
                src={paymentProofUrl}
              />
            </div>
          </div>
        ) : null}
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
            Please ensure to settle the full payment before the event. You may
            opt to pay on the event proper or at the IBC Office.
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
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Checkbox
                aria-invalid={isInvalid}
                checked={field.state.value}
                className="mt-0.5"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
              />
              <div>
                <Label
                  className="cursor-pointer font-medium text-sm"
                  htmlFor={field.name}
                >
                  I agree to the Terms and Conditions
                </Label>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  By checking this box, you agree to our terms of service and
                  privacy policy.
                </p>
              </div>
            </div>

            <TermsAndConditions
              customAcceptButton={(closeTermsAndConditions) => (
                <button
                  className="font-medium text-primary text-sm hover:underline"
                  onClick={() => {
                    field.handleChange(true);
                    closeTermsAndConditions();
                  }}
                  type="button"
                >
                  Read Terms and Conditions here
                </button>
              )}
              triggerOverride={
                <button
                  className="font-medium text-primary text-sm hover:underline"
                  type="button"
                >
                  Read Terms and Conditions here
                </button>
              }
            />

            <FieldError errors={field.state.meta.errors} />
          </div>
        );
      }}
    </form.AppField>
  );
}
