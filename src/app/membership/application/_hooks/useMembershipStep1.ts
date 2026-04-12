import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import tryCatch from "@/lib/server/tryCatch";
import { resolveMemberLogoUrl } from "@/lib/storage/memberLogo";
import type { FormSubmitMeta } from "@/lib/types/FormSubmitMeta";
import { zodValidator } from "@/lib/utils";
import { MembershipApplicationStep1Schema } from "@/lib/validation/membership/application";
import { checkMemberExistsAndGet } from "@/server/membership/queries/checkMemberExistsAndGet";

const defaultMeta: FormSubmitMeta = {
  nextStep: false,
};

function toBirthdate(value?: string): Date {
  if (!value) {
    return undefined as unknown as Date;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined as unknown as Date;
  }

  return date;
}

function toRepresentative(
  representative:
    | {
        firstName?: string;
        lastName?: string;
        emailAddress?: string;
        mobileNumber?: string;
        landline?: string;
        mailingAddress?: string;
        companyDesignation?: string;
        birthdate?: string;
        nationality?: string;
        sex?: string;
      }
    | undefined,
  type: "principal" | "alternate",
) {
  const representativeSex: "male" | "female" =
    representative?.sex === "female" ? "female" : "male";

  return {
    companyMemberType: type,
    firstName: representative?.firstName ?? "",
    lastName: representative?.lastName ?? "",
    mailingAddress: representative?.mailingAddress ?? "",
    sex: representativeSex,
    nationality: representative?.nationality ?? "",
    birthdate: toBirthdate(representative?.birthdate),
    companyDesignation: representative?.companyDesignation ?? "",
    landline: representative?.landline ?? "",
    mobileNumber: representative?.mobileNumber ?? "",
    emailAddress: representative?.emailAddress ?? "",
  };
}

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

      // If proceeding to next step and member identifier is required, validate it first
      if (
        meta.nextStep &&
        (refinedValue.applicationType === "renewal" ||
          refinedValue.applicationType === "updating")
      ) {
        // Check cooldown first - this applies regardless of identifier input
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

        // If cooldown has expired, reset attempts so user gets a fresh set
        if (
          memberValidation.cooldownEndTime &&
          now >= memberValidation.cooldownEndTime
        ) {
          setMemberValidationAttempt(0);
          setMemberValidationCooldown(null);
        }

        // Business Member Identifier is required for renewal/updating
        if (!refinedValue.businessMemberIdentifier?.trim()) {
          toast.error(
            "Business Member Identifier is required for renewal and update applications",
          );
          return;
        }

        // Check if already validated with the current member identifier and same application type
        const currentMemberIdentifier =
          refinedValue.businessMemberIdentifier.trim();
        const currentAppType = refinedValue.applicationType as
          | "renewal"
          | "updating";
        const alreadyValidated =
          memberValidation.validationStatus === "valid" &&
          memberValidation.lastValidatedMemberIdentifier ===
            currentMemberIdentifier &&
          memberValidation.lastValidatedApplicationType === currentAppType;

        if (!alreadyValidated) {
          try {
            const result = await tryCatch(
              checkMemberExistsAndGet({
                identifier: currentMemberIdentifier,
                applicationType: currentAppType,
              }),
            );

            if (!result.success || result.error) {
              setMemberValidationStatus(
                "invalid",
                {},
                currentMemberIdentifier,
                currentAppType,
              );
              toast.error(
                result.error || "Unable to verify Business Member Identifier",
              );

              const newAttemptCount = memberValidation.attemptCount + 1;
              setMemberValidationAttempt(newAttemptCount);

              if (newAttemptCount >= 3) {
                const cooldownEnd = now + 30000; // temporary // 900000; // 15 minutes permanently
                setMemberValidationCooldown(cooldownEnd);
                toast.error(
                  "Too many failed attempts. Please wait 15 minutes before trying again.",
                );
              }
              return;
            }

            const data = result.data;
            if (!data?.exists) {
              setMemberValidationStatus(
                "invalid",
                {},
                currentMemberIdentifier,
                currentAppType,
              );
              toast.error(
                data?.message || "Business Member Identifier not found",
              );

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

            // Member validated successfully - keep identifier for checks and UUID for submission
            setMemberValidationStatus(
              "valid",
              {
                companyName: data.companyName,
                membershipStatus: data.membershipStatus,
                businessMemberIdentifier:
                  data.businessMemberIdentifier ?? currentMemberIdentifier,
                businessMemberId: data.businessMemberId,
              },
              currentMemberIdentifier,
              currentAppType,
            );

            setApplicationData({
              step2: {
                companyName: data.companyName ?? "",
                companyAddress: data.companyAddress ?? "",
                sectorId: String(data.sectorId ?? ""),
                landline: data.landline ?? "",
                mobileNumber: data.mobileNumber ?? "",
                emailAddress: data.emailAddress ?? "",
                websiteURL: data.websiteURL ?? "",
                logoImageURL: resolveMemberLogoUrl(data.logoImageURL) ?? "",
                logoImage: undefined,
              },
              step3: {
                representatives: [
                  toRepresentative(data.principalRepresentative, "principal"),
                  toRepresentative(data.alternateRepresentative, "alternate"),
                ],
              },
            });

            toast.success(`Member verified: ${data.companyName}`);
          } catch {
            setMemberValidationStatus(
              "invalid",
              {},
              currentMemberIdentifier,
              currentAppType,
            );
            toast.error(
              "Unable to validate Business Member Identifier at this time",
            );

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
