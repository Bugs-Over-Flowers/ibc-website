import { formatDate } from "date-fns";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  const [proofPreview, setProofPreview] = useState<string | null>(null);

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
  const selectedPaymentProof =
    step3Data.paymentMethod === "online" ? step3Data.paymentProof : undefined;

  useEffect(() => {
    if (!selectedPaymentProof) {
      setProofPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedPaymentProof);
    setProofPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedPaymentProof]);

  const onSubmit = (e?: React.SubmitEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card className="w-full overflow-hidden rounded-2xl border-none bg-transparent pb-0 shadow-none ring-0">
        <CardHeader className="border-border/30 border-b bg-card/5">
          <CardTitle className="flex items-center gap-2 font-semibold text-2xl">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Review & Confirm
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Please review your details before submitting your final
            registration.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          <Card className="rounded-2xl border border-border/50 bg-background">
            <CardContent className="space-y-6 px-7 py-0">
              <div className="flex items-center gap-2 font-bold text-primary">
                <CalendarDays className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">Event</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Event Name
                  </span>
                  <span className="font-semibold text-base leading-tight">
                    {eventDetails?.eventTitle}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Event Date
                  </span>
                  <span className="font-semibold text-base leading-tight">
                    {eventDetails?.eventStartDate
                      ? formatDate(eventDetails.eventStartDate, "MMMM d, yyyy")
                      : "Date TBA"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/50 bg-background">
            <CardContent className="space-y-6 px-7 py-0">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Building2 className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">
                  Registration Type
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Type
                  </span>
                  <span className="font-semibold text-base capitalize leading-tight">
                    {step1Data.member === "member"
                      ? "Corporate Member"
                      : "Non-member"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Organization
                  </span>
                  <span className="font-semibold text-base leading-tight">
                    {memberName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/50 bg-background">
            <CardContent className="space-y-6 px-7 py-0">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Users className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">
                  Participants ({participantCount})
                </span>
              </div>
              <ul className="space-y-3">
                <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-primary/60 bg-primary/5 p-4 shadow-primary/10 shadow-sm transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
                    {step2Data.registrant.firstName?.[0] || ""}
                    {step2Data.registrant.lastName?.[0] || ""}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight">
                      {step2Data.registrant.firstName}{" "}
                      {step2Data.registrant.lastName}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-primary/50 bg-primary/10 px-2.5 py-1 font-semibold text-primary text-xs">
                    Primary
                  </span>
                </li>
                {step2Data.otherParticipants?.map((participant) => (
                  <li
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm transition-colors"
                    key={participant.id}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
                      {participant.firstName?.[0] || ""}
                      {participant.lastName?.[0] || ""}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight">
                        {participant.firstName} {participant.lastName}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-border px-2.5 py-1 font-medium text-muted-foreground text-xs">
                      Additional
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/50 bg-background">
            <CardContent className="space-y-6 px-7 py-0">
              <div className="flex items-center gap-2 font-bold text-primary">
                <CreditCard className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">
                  Payment Summary
                </span>
              </div>

              <div className="space-y-2 text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base Fee x {participantCount}
                  </span>
                  <span className="font-semibold text-base leading-tight">
                    Php {subtotal.toLocaleString()}
                  </span>
                </div>

                {totalSponsorDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Sponsor Discount ({sponsoredBy})</span>
                    <span className="font-semibold text-base leading-tight">
                      -Php {totalSponsorDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-border/50 border-t pt-3 font-bold text-foreground text-lg">
                  <span>Total Amount</span>
                  <span>Php {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-border/50 border-t pt-4">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Payment Method
                </span>
                <Badge
                  className="font-medium text-sm capitalize"
                  variant="outline"
                >
                  {step3Data.paymentMethod}
                </Badge>
              </div>

              {step3Data.paymentMethod === "online" && selectedPaymentProof ? (
                <div className="mt-4 rounded-xl border border-border/50 bg-background p-4">
                  <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Payment Proof
                  </p>
                  <div className="flex flex-col items-start gap-2">
                    {proofPreview ? (
                      <Image
                        alt="Payment proof preview"
                        className="h-12 w-12 rounded-md border border-border/60 bg-muted/20 object-contain p-0.5"
                        height={48}
                        src={proofPreview}
                        unoptimized
                        width={48}
                      />
                    ) : null}
                    <span className="font-medium text-green-600">
                      Proof Uploaded Successfully
                    </span>
                    <Badge className="mt-1 max-w-full" variant="outline">
                      {selectedPaymentProof.name}
                    </Badge>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

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
