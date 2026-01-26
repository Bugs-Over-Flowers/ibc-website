import { formatDate } from "date-fns";
import { Check, Info, User } from "lucide-react";
import { type FormEvent, useMemo } from "react";
import FormButtons from "@/components/FormButtons";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field";
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
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

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

  const totalParticipants = 1 + (step2Data.otherParticipants?.length ?? 0);
  const totalAmount = (eventDetails?.registrationFee ?? 0) * totalParticipants;

  const onNext = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form className="space-y-6" onSubmit={onNext}>
      <RegistrationStepHeader
        description="Please review your registration details before submitting."
        Icon={User}
        title="Review & Confirm"
      />

      {/* Event Info */}
      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="font-semibold text-foreground">
          {eventDetails?.eventTitle}
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          {eventDetails?.eventStartDate &&
            formatDate(eventDetails.eventStartDate, "MMMM d, yyyy")}
        </p>
      </div>

      {/* Summary Sections */}
      <div className="space-y-4">
        {/* Affiliation */}
        <div className="space-y-2">
          <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Organization
          </h4>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-foreground text-sm">
              {step1Data.member === "member"
                ? memberName
                : step1Data.nonMemberName}
            </span>
            <Badge className="text-xs" variant="outline">
              {step1Data.member === "member" ? "Member" : "Non-member"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Participants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Participants
            </h4>
            <Badge className="text-xs" variant="secondary">
              {totalParticipants} total
            </Badge>
          </div>

          {/* Primary */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">
                {step2Data.registrant?.firstName}{" "}
                {step2Data.registrant?.lastName}
              </p>
              <p className="text-muted-foreground text-xs">
                {step2Data.registrant?.email}
              </p>
            </div>
            <Badge className="text-xs">Primary</Badge>
          </div>

          {/* Others */}
          {step2Data.otherParticipants &&
            step2Data.otherParticipants.length > 0 &&
            step2Data.otherParticipants.map((participant, index) => (
              <div
                className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                key={`${participant.firstName}-${index}`}
              >
                <p className="font-medium text-sm">
                  {participant.firstName} {participant.lastName}
                </p>
                <Check className="h-4 w-4 text-green-600" />
              </div>
            ))}
        </div>

        <Separator />

        {/* Payment */}
        <div className="space-y-3">
          <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Payment
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method</span>
              <Badge
                variant={
                  step3Data.paymentMethod === "online" ? "default" : "secondary"
                }
              >
                {step3Data.paymentMethod === "online"
                  ? "Bank Transfer"
                  : "Onsite"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span>
                {formatCurrency(eventDetails?.registrationFee ?? 0)} ×{" "}
                {totalParticipants}
              </span>
            </div>
            {step3Data.paymentMethod === "online" && step3Data.paymentProof && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Proof</span>
                <span className="flex items-center gap-1 text-green-600 text-xs">
                  <Check className="h-3 w-3" />
                  Attached
                </span>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between pt-1">
            <span className="font-medium">Total</span>
            <span className="font-semibold text-lg text-primary">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">
          {step3Data.paymentMethod === "online"
            ? "Your registration will be confirmed once payment is verified."
            : "Please settle payment at the venue before the event."}
        </p>
      </div>

      {/* Terms */}
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
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
