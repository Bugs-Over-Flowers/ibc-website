import { useStore } from "@tanstack/react-form";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  UserRoundPen,
  UserRoundPlus,
} from "lucide-react";
import { useEffect } from "react";
import type { useMembershipStep1 } from "@/app/membership/application/_hooks/useMembershipStep1";
import { useMemberValidationTimer } from "@/app/membership/application/_hooks/useMemberValidationTimer";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MembershipApplicationStep1Schema } from "@/lib/validation/membership/application";

interface StepProps {
  form: ReturnType<typeof useMembershipStep1>["form"];
  memberValidation: ReturnType<typeof useMembershipStep1>["memberValidation"];
  resetMemberValidation: ReturnType<
    typeof useMembershipStep1
  >["resetMemberValidation"];
}

export function Step1Status({
  form,
  memberValidation,
  resetMemberValidation,
}: StepProps) {
  const applicationType = useStore(
    form.store,
    (state) => state.values.applicationType,
  );
  const businessMemberId = useStore(
    form.store,
    (state) => state.values.businessMemberId,
  );

  const { remainingTime, isInCooldown: hookIsInCooldown } =
    useMemberValidationTimer();

  const showMemberIdInput =
    applicationType === "renewal" || applicationType === "updating";

  useEffect(() => {
    const currentMemberId = businessMemberId?.trim() || null;
    const lastValidatedId = memberValidation.lastValidatedMemberId;

    if (
      lastValidatedId &&
      currentMemberId !== lastValidatedId &&
      memberValidation.validationStatus !== "idle"
    ) {
      resetMemberValidation();
    }
  }, [
    businessMemberId,
    resetMemberValidation,
    memberValidation.lastValidatedMemberId,
    memberValidation.validationStatus,
  ]);

  useEffect(() => {
    if (applicationType === "newMember") {
      resetMemberValidation();
      form.setFieldValue("businessMemberId", "");
      form.resetField("businessMemberId");
    }
  }, [applicationType, resetMemberValidation, form]);

  useEffect(() => {
    if (
      (applicationType === "renewal" || applicationType === "updating") &&
      memberValidation.lastValidatedApplicationType &&
      memberValidation.lastValidatedApplicationType !== applicationType &&
      memberValidation.validationStatus !== "idle"
    ) {
      resetMemberValidation();
    }
  }, [
    applicationType,
    memberValidation.lastValidatedApplicationType,
    memberValidation.validationStatus,
    resetMemberValidation,
  ]);

  const isInCooldown = hookIsInCooldown;

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl border-0 p-0">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Info className="h-5 w-5" />
          <span className="font-medium text-lg">Membership Guidelines</span>
        </div>

        <ul className="list-disc space-y-2 pl-5 text-muted-foreground text-sm">
          <li>Memberships are dated on the first day of the payment month.</li>
          <li>
            Corporate members may request representative updates if reassigned.
          </li>
          <li>
            Memberships remain subject to Membership Committee endorsement and
            Board approval.
          </li>
          <li>
            By continuing, you consent to processing under the Data Privacy Act
            of 2012.
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <Label className="font-bold text-base">Select Membership Status</Label>
        <form.AppField name="applicationType">
          {(field) => {
            const options: {
              value: MembershipApplicationStep1Schema["applicationType"];
              label: string;
              description: string;
              icon: LucideIcon;
            }[] = [
              {
                value: "newMember",
                label: "New Member",
                description: "First time joining",
                icon: UserRoundPlus,
              },
              {
                value: "renewal",
                label: "Renewal",
                description: "Renewing membership",
                icon: RefreshCw,
              },
              {
                value: "updating",
                label: "Update Info",
                description: "Changing details",
                icon: UserRoundPen,
              },
            ];

            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {options.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      className={cn(
                        "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent p-4 text-center transition-all",
                        field.state.value === option.value &&
                          "border-primary bg-primary/5",
                      )}
                      key={option.value}
                      onClick={() => field.handleChange(option.value)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                          field.state.value === option.value &&
                            "border-primary/30 bg-primary/10 text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-semibold text-foreground text-lg">
                        {option.label}
                      </span>
                      <span className="mt-1 text-muted-foreground text-sm">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          }}
        </form.AppField>
      </div>

      {showMemberIdInput && (
        <div className="fade-in slide-in-from-top-2 animate-in space-y-4 pt-2 duration-300">
          <form.AppField name="businessMemberId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;

              return (
                <Field className="grid gap-2" data-invalid={isInvalid}>
                  <Label
                    className="font-bold text-base"
                    htmlFor="businessMemberId"
                  >
                    Business Member ID
                  </Label>
                  <div className="relative">
                    <Input
                      aria-invalid={isInvalid}
                      className={cn(
                        "h-12 rounded-lg pr-11",
                        memberValidation.validationStatus === "valid" &&
                          "border-emerald-400 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-500/15",
                        memberValidation.validationStatus === "invalid" &&
                          "border-destructive/60 bg-destructive/5",
                        isInvalid && "border-destructive",
                      )}
                      data-invalid={isInvalid}
                      id="businessMemberId"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="ibc-mem-xxxxxxxx"
                      type="text"
                      value={field.state.value ?? ""}
                    />
                    {isInCooldown && (
                      <Loader2 className="absolute top-3.5 right-3 h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>

                  {memberValidation.validationStatus === "valid" &&
                    memberValidation.memberInfo.companyName && (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 font-medium text-emerald-700 text-sm dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Verified: {memberValidation.memberInfo.companyName}
                          {memberValidation.memberInfo.membershipStatus &&
                            ` (${memberValidation.memberInfo.membershipStatus})`}
                        </span>
                      </div>
                    )}

                  {memberValidation.validationStatus === "invalid" && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/10 bg-destructive/5 p-3 font-medium text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {memberValidation.memberInfo.companyName &&
                        memberValidation.memberInfo.membershipStatus
                          ? applicationType === "renewal"
                            ? `${memberValidation.memberInfo.companyName} is currently "${memberValidation.memberInfo.membershipStatus}" and does not need renewal.`
                            : `${memberValidation.memberInfo.companyName} membership is cancelled. Please renew first.`
                          : "Member ID not found or invalid for this application type."}
                      </span>
                    </div>
                  )}

                  {isInCooldown && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 text-sm dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        Too many failed attempts. Try again in {remainingTime}{" "}
                        seconds.
                      </span>
                      {memberValidation.attemptCount < 3 &&
                        ` (${memberValidation.attemptCount}/3 attempts used)`}
                    </div>
                  )}

                  {memberValidation.attemptCount > 0 &&
                    !isInCooldown &&
                    memberValidation.attemptCount < 3 && (
                      <div className="flex items-center gap-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-amber-700 text-xs">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {memberValidation.attemptCount}/3 verification attempts
                        used
                      </div>
                    )}

                  <p className="text-muted-foreground text-xs">
                    Enter your existing IBC Member ID. Verification will happen
                    when you click Next.
                  </p>
                  <FieldError errors={field.state.meta.errors} reserveSpace />
                </Field>
              );
            }}
          </form.AppField>
        </div>
      )}
    </div>
  );
}
