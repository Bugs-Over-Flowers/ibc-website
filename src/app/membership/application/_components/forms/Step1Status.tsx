import { useStore } from "@tanstack/react-form";
import { CheckCircle2, X } from "lucide-react";
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

  // Use persistent timer hook that survives navigation
  const { remainingTime, isInCooldown: hookIsInCooldown } =
    useMemberValidationTimer();

  const showMemberIdInput =
    applicationType === "renewal" || applicationType === "updating";

  // Reset validation when member ID changes to a different value
  useEffect(() => {
    const currentMemberId = businessMemberId?.trim() || null;
    const lastValidatedId = memberValidation.lastValidatedMemberId;

    // Only reset if we have a different member ID than what was last validated
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

  // Reset when application type changes to new member - clear member ID and validation
  useEffect(() => {
    if (applicationType === "newMember") {
      resetMemberValidation();
      // Clear the businessMemberId field value and reset its validation state
      form.setFieldValue("businessMemberId", "");
      form.resetField("businessMemberId");
    }
  }, [applicationType, resetMemberValidation, form]);

  // Reset validation when switching between renewal and update info
  // This prevents the loophole of validating on one type and using on another
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

  // Use the isInCooldown value from the persistent timer hook
  const isInCooldown = hookIsInCooldown;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-blue-50 p-4 text-blue-900">
        <h3 className="mb-2 flex items-center gap-2 font-semibold">
          ℹ️ Membership Guidelines
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            All new or renewed memberships shall be dated on the first day of
            the month during which the membership fee was paid.
          </li>
          <li>
            Memberships are by invitation, but may be proposed by any member,
            subject to endorsement by the Membership Committee and Board
            approval.
          </li>
          <li>
            Corporate members may request representation changes in case of
            re-assignment or death of the primary member.
          </li>
          <li>
            No refund will be given if membership is terminated before the next
            anniversary date.
          </li>
        </ul>
        <p className="mt-4 text-blue-700 text-xs">
          By proceeding, you consent to the collection and processing of your
          personal information in accordance with Republic Act No. 10173 (Data
          Privacy Act of 2012).
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Select Membership Status *</Label>
        <form.AppField name="applicationType">
          {(field) => {
            const options: {
              value: MembershipApplicationStep1Schema["applicationType"];
              label: string;
              description: string;
            }[] = [
              {
                value: "newMember",
                label: "New Member",
                description: "First time joining",
              },
              {
                value: "renewal",
                label: "Renewal",
                description: "Renewing membership",
              },
              {
                value: "updating",
                label: "Update Info",
                description: "Updating details",
              },
            ];

            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {options.map((option) => (
                  <button
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-between rounded-md border-2 bg-popover p-4 transition-colors hover:bg-accent hover:text-accent-foreground",
                      field.state.value === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted",
                    )}
                    key={option.value}
                    onClick={() => field.handleChange(option.value)}
                    type="button"
                  >
                    <span className="font-semibold text-lg">
                      {option.label}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            );
          }}
        </form.AppField>
      </div>

      {/* Member ID Input for Renewal and Update Info */}
      {showMemberIdInput && (
        <div className="space-y-4">
          <form.AppField name="businessMemberId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;

              return (
                <Field className="space-y-2">
                  <Label htmlFor="businessMemberId">Member ID *</Label>
                  <Input
                    aria-invalid={isInvalid}
                    className={cn(
                      memberValidation.validationStatus === "valid" &&
                        "border-green-500 bg-green-50",
                      memberValidation.validationStatus === "invalid" &&
                        "border-red-500 bg-red-50",
                    )}
                    data-invalid={isInvalid}
                    id="businessMemberId"
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="ibc-mem-xxxxxxxx"
                    type="text"
                    value={field.state.value ?? ""}
                  />

                  {/* Validation Status Display */}
                  {memberValidation.validationStatus === "valid" &&
                    memberValidation.memberInfo.companyName && (
                      <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-green-800 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Verified: {memberValidation.memberInfo.companyName}
                          {memberValidation.memberInfo.membershipStatus &&
                            ` (${memberValidation.memberInfo.membershipStatus})`}
                        </span>
                      </div>
                    )}

                  {memberValidation.validationStatus === "invalid" && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-red-800 text-sm">
                      <X className="h-4 w-4" />
                      <span>
                        {memberValidation.memberInfo.companyName &&
                        memberValidation.memberInfo.membershipStatus
                          ? applicationType === "renewal"
                            ? `${memberValidation.memberInfo.companyName} is currently "${memberValidation.memberInfo.membershipStatus}" and does not need renewal.`
                            : `${memberValidation.memberInfo.companyName} membership is cancelled. Please renew first.`
                          : "Member ID not found"}
                      </span>
                    </div>
                  )}

                  {/* Rate Limiting Display */}
                  {isInCooldown && (
                    <div className="rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
                      Too many failed attempts. Try again in {remainingTime}{" "}
                      seconds.
                      {memberValidation.attemptCount < 3 &&
                        ` (${memberValidation.attemptCount}/3 attempts used)`}
                    </div>
                  )}

                  {memberValidation.attemptCount > 0 &&
                    !isInCooldown &&
                    memberValidation.attemptCount < 3 && (
                      <div className="text-amber-600 text-xs">
                        {memberValidation.attemptCount}/3 verification attempts
                        used
                      </div>
                    )}

                  <p className="text-muted-foreground text-xs">
                    Enter your existing IBC Member ID (e.g., ibc-mem-xxxxxxxx).
                    <strong>
                      {" "}
                      Verification will happen when you click Next.
                    </strong>
                  </p>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.AppField>
        </div>
      )}
    </div>
  );
}
