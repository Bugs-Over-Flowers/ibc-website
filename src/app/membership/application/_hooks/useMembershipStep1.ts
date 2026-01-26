import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import tryCatch from "@/lib/server/tryCatch";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { MembershipApplicationStep1Schema } from "@/lib/validation/membership/application";
import { checkMemberExists } from "@/server/membership/queries/checkMemberExists";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

export const useMembershipStep1 = () => {
  const setStep = useMembershipApplicationStore((state) => state.setStep);
  const setApplicationData = useMembershipApplicationStore(
    (state) => state.setApplicationData,
  );

  // Member validation store state and actions
  const memberValidation = useMembershipApplicationStore(
    (state) => state.memberValidation,
  );
  const setMemberValidationAttempt = useMembershipApplicationStore(
    (state) => state.setMemberValidationAttempt,
  );
  const setMemberValidationCooldown = useMembershipApplicationStore(
    (state) => state.setMemberValidationCooldown,
  );
  const setMemberValidationStatus = useMembershipApplicationStore(
    (state) => state.setMemberValidationStatus,
  );
  const resetMemberValidation = useMembershipApplicationStore(
    (state) => state.resetMemberValidation,
  );

  const defaultApplicationDataStep1 = useMembershipApplicationStore(
    (state) => state.applicationData?.step1,
  );

  const form = useAppForm({
    defaultValues: defaultApplicationDataStep1,
    validators: {
      onSubmit: zodValidator(MembershipApplicationStep1Schema),
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      const refinedValue = MembershipApplicationStep1Schema.parse(value);

      // If proceeding to next step and member ID is required, validate it first
      if (
        meta.nextStep &&
        (refinedValue.applicationType === "renewal" ||
          refinedValue.applicationType === "updating")
      ) {
        // Check cooldown first - this applies regardless of member ID input
        const now = Date.now();
        if (
          memberValidation.cooldownEndTime &&
          now < memberValidation.cooldownEndTime
        ) {
          const remainingSeconds = Math.ceil(
            (memberValidation.cooldownEndTime - now) / 1000,
          );
          toast.error(
            `Too many failed attempts. Please wait ${remainingSeconds} seconds before trying again.`,
          );
          return;
        }

        // Member ID is required for renewal/updating
        if (!refinedValue.businessMemberId?.trim()) {
          toast.error(
            "Member ID is required for renewal and update applications",
          );
          return;
        }

        // Check if already validated with the current member ID AND same application type
        const currentMemberId = refinedValue.businessMemberId.trim();
        const currentAppType = refinedValue.applicationType as
          | "renewal"
          | "updating";
        const alreadyValidated =
          memberValidation.validationStatus === "valid" &&
          memberValidation.lastValidatedMemberId === currentMemberId &&
          memberValidation.lastValidatedApplicationType === currentAppType;

        if (!alreadyValidated) {
          try {
            const result = await tryCatch(
              checkMemberExists({
                identifier: currentMemberId,
                applicationType: currentAppType,
              }),
            );

            if (!result.success || result.error) {
              setMemberValidationStatus(
                "invalid",
                {},
                currentMemberId,
                currentAppType,
              );
              toast.error(result.error || "Unable to verify member ID");

              const newAttemptCount = memberValidation.attemptCount + 1;
              setMemberValidationAttempt(newAttemptCount);

              if (newAttemptCount >= 3) {
                const cooldownEnd = now + 900000; // 30 seconds
                setMemberValidationCooldown(cooldownEnd);
                toast.error(
                  "Too many failed attempts. Please wait 30 seconds before trying again.",
                );
              }
              return;
            }

            const data = result.data;
            if (!data?.exists) {
              setMemberValidationStatus(
                "invalid",
                {},
                currentMemberId,
                currentAppType,
              );
              toast.error(data?.message || "Member ID not found");

              const newAttemptCount = memberValidation.attemptCount + 1;
              setMemberValidationAttempt(newAttemptCount);

              if (newAttemptCount >= 3) {
                const cooldownEnd = now + 30000;
                setMemberValidationCooldown(cooldownEnd);
                toast.error(
                  "Too many failed attempts. Please wait 30 seconds before trying again.",
                );
              }
              return;
            }

            // For renewal: check if member actually needs renewal (must be cancelled)
            if (
              refinedValue.applicationType === "renewal" &&
              data.membershipStatus !== "cancelled"
            ) {
              setMemberValidationStatus(
                "invalid",
                {
                  companyName: data.companyName,
                  membershipStatus: data.membershipStatus,
                  businessMemberId: data.businessMemberId,
                },
                currentMemberId,
                currentAppType,
              );
              toast.error(
                `This member is currently "${data.membershipStatus}" and does not need renewal. Use "Update Info" instead if you need to update your information.`,
              );
              return;
            }

            // Member validated successfully - store the actual UUID businessMemberId
            setMemberValidationStatus(
              "valid",
              {
                companyName: data.companyName,
                membershipStatus: data.membershipStatus,
                businessMemberId: data.businessMemberId,
              },
              currentMemberId,
              currentAppType,
            );
            toast.success(`Member verified: ${data.companyName}`);
          } catch {
            setMemberValidationStatus(
              "invalid",
              {},
              currentMemberId,
              currentAppType,
            );
            toast.error("Unable to validate member ID at this time");

            const newAttemptCount = memberValidation.attemptCount + 1;
            setMemberValidationAttempt(newAttemptCount);

            if (newAttemptCount >= 3) {
              const cooldownEnd = now + 30000;
              setMemberValidationCooldown(cooldownEnd);
              toast.error(
                "Too many failed attempts. Please wait 30 seconds before trying again.",
              );
            }
            return;
          }
        }
      }

      // Reset validation when application type changes
      if (refinedValue.applicationType === "newMember") {
        resetMemberValidation();
      }

      if (meta.nextStep) {
        setStep(2);
      }

      setApplicationData({
        step1: refinedValue,
      });
    },
  });

  return {
    form,
    memberValidation,
    setMemberValidationStatus,
    resetMemberValidation,
  };
};
