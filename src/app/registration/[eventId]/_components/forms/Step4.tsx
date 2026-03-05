import { formatDate } from "date-fns";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import { useRegistrationStep4 } from "../../_hooks/useRegistrationStep4";

interface Step4Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function Step4({ members }: Step4Props) {
  const form = useRegistrationStep4();
  const setStep = useRegistrationStore((state) => state.setStep);
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const sponsorFeeDeduction = useRegistrationStore(
    (state) => state.sponsorFeeDeduction,
  );
  const sponsoredBy = useRegistrationStore((state) => state.sponsoredBy);
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
    return step1Data.nonMemberName;
  }, [members, step1Data]);

  const participantCount = 1 + (step2Data.otherParticipants?.length ?? 0);
  const baseFee = eventDetails?.registrationFee ?? 0;
  const subtotal = baseFee * participantCount;
  const totalSponsorDiscount = sponsorFeeDeduction
    ? sponsorFeeDeduction * participantCount
    : 0;
  const finalTotal = subtotal - totalSponsorDiscount;

  const onSubmit = (e?: React.SubmitEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card className="w-full overflow-hidden rounded-2xl border-border bg-card/10 shadow-md ring-0">
        <CardHeader className="border-border/50 border-b bg-card/10 pb-6">
          <CardTitle className="flex items-center gap-2 font-semibold text-2xl">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Review & Confirm
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Please review your details before submitting your final
            registration.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          <div className="rounded-xl border border-border/50 bg-background p-5">
            <h3 className="mb-3 font-bold text-muted-foreground text-sm uppercase tracking-wider">
              Event
            </h3>
            <p className="font-semibold text-foreground text-lg">
              {eventDetails?.eventTitle}
            </p>
            <p className="text-muted-foreground">
              {eventDetails?.eventStartDate
                ? formatDate(eventDetails.eventStartDate, "MMMM d, yyyy")
                : "Date TBA"}
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-background p-5">
            <h3 className="mb-3 font-bold text-muted-foreground text-sm uppercase tracking-wider">
              Registration Type
            </h3>
            <p className="font-medium text-foreground text-lg capitalize">
              {step1Data.member === "member"
                ? "Corporate Member"
                : "Non-member"}
            </p>
            <p className="mt-1 text-muted-foreground">{memberName}</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-background p-5">
            <h3 className="mb-3 font-bold text-muted-foreground text-sm uppercase tracking-wider">
              Participants ({participantCount})
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between border-border/50 border-b pb-2">
                <span className="font-medium text-foreground">
                  {step2Data.registrant.firstName}{" "}
                  {step2Data.registrant.lastName}
                </span>
                <Badge
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                  variant="secondary"
                >
                  Primary
                </Badge>
              </li>
              {step2Data.otherParticipants?.map((participant) => (
                <li
                  className="flex items-center justify-between border-border/50 border-b pb-2 last:border-0 last:pb-0"
                  key={participant.id}
                >
                  <span className="text-foreground">
                    {participant.firstName} {participant.lastName}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Additional
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-4 font-bold text-primary text-sm uppercase tracking-wider">
              Payment Summary
            </h3>

            <div className="space-y-2 text-base">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Base Fee x {participantCount}
                </span>
                <span className="font-medium">
                  Php {subtotal.toLocaleString()}
                </span>
              </div>

              {totalSponsorDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Sponsor Discount ({sponsoredBy})</span>
                  <span className="font-medium">
                    -Php {totalSponsorDiscount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-primary/20 border-t pt-3 font-bold text-foreground text-lg">
                <span>Total Amount</span>
                <span>Php {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-primary/20 border-t pt-4">
              <span className="text-muted-foreground text-sm">
                Payment Method:
              </span>
              <Badge
                className="font-medium text-sm capitalize"
                variant="outline"
              >
                {step3Data.paymentMethod}
              </Badge>
            </div>
          </div>

          <TermsAndConditionsField form={form} />
        </CardContent>

        <CardFooter className="flex items-center justify-between border-border/50 border-t px-6 pt-6 pb-6">
          <Button
            className="rounded-xl"
            onClick={() => setStep(3)}
            size="lg"
            type="button"
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                className="rounded-xl px-8 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                disabled={isSubmitting}
                size="lg"
                type="submit"
              >
                {isSubmitting ? "Processing..." : "Complete Registration"}
                {!isSubmitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
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
          <div className="rounded-xl border border-border/50 bg-background p-4">
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">I have read and agree to the</span>
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
                        className={cn(
                          "text-sm",
                          "font-medium text-primary hover:underline",
                        )}
                        type="button"
                      >
                        Terms and Conditions.
                      </button>
                    }
                  />
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            </Field>
          </div>
        );
      }}
    </form.AppField>
  );
}
