import { useEffect } from "react";
import useMembershipApplicationStore from "./membershipApplication.store";

/**
 * Custom hook to manage the member validation cooldown timer.
 * This persists across navigation and page refreshes.
 */
export const useMemberValidationTimer = () => {
  const memberValidation = useMembershipApplicationStore(
    (state) => state.memberValidation,
  );
  const setMemberValidationRemainingTime = useMembershipApplicationStore(
    (state) => state.setMemberValidationRemainingTime,
  );

  useEffect(() => {
    if (memberValidation.cooldownEndTime) {
      const updateTimer = () => {
        const now = Date.now();
        const cooldownEnd = memberValidation.cooldownEndTime;
        if (!cooldownEnd) return false;

        const remaining = Math.max(0, cooldownEnd - now);
        const remainingSeconds = Math.ceil(remaining / 1000);

        setMemberValidationRemainingTime(remainingSeconds);

        // Timer expired
        if (remaining <= 0) {
          return false; // Stop the timer
        }
        return true; // Continue the timer
      };

      // Initial update
      const shouldContinue = updateTimer();

      if (shouldContinue) {
        const interval = setInterval(() => {
          const shouldContinue = updateTimer();
          if (!shouldContinue) {
            clearInterval(interval);
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    } else {
      // No cooldown, reset remaining time
      setMemberValidationRemainingTime(0);
    }
  }, [memberValidation.cooldownEndTime, setMemberValidationRemainingTime]);

  return {
    isInCooldown:
      memberValidation.cooldownEndTime &&
      Date.now() < memberValidation.cooldownEndTime,
    remainingTime: memberValidation.remainingTime,
    attemptCount: memberValidation.attemptCount,
    validationStatus: memberValidation.validationStatus,
    memberInfo: memberValidation.memberInfo,
  };
};
