import { useEffect } from "react";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";

/**
 * Custom hook to manage persistent timer for member validation cooldown.
 * This timer persists across page navigation and browser sessions.
 * When the cooldown expires, it resets the attempt count so users
 * get a fresh set of attempts.
 */
export function useMemberValidationTimer() {
  const cooldownEndTime = useMembershipApplicationStore(
    (state) => state.memberValidation.cooldownEndTime,
  );
  const remainingTime = useMembershipApplicationStore(
    (state) => state.memberValidation.remainingTime,
  );
  const setMemberValidationRemainingTime = useMembershipApplicationStore(
    (state) => state.setMemberValidationRemainingTime,
  );
  const setMemberValidationAttempt = useMembershipApplicationStore(
    (state) => state.setMemberValidationAttempt,
  );
  const setMemberValidationCooldown = useMembershipApplicationStore(
    (state) => state.setMemberValidationCooldown,
  );

  useEffect(() => {
    if (!cooldownEndTime) {
      setMemberValidationRemainingTime(0);
      return;
    }

    const updateRemainingTime = () => {
      const now = Date.now();
      if (!cooldownEndTime) return;

      const remaining = Math.max(0, cooldownEndTime - now);
      const remainingSeconds = Math.ceil(remaining / 1000);

      if (remaining <= 0) {
        // Timer has expired — reset attempts so user gets a fresh set
        setMemberValidationRemainingTime(0);
        setMemberValidationAttempt(0);
        setMemberValidationCooldown(null);
      } else {
        setMemberValidationRemainingTime(remainingSeconds);
      }
    };

    // Update immediately
    updateRemainingTime();

    // Set up interval to update every second
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [
    cooldownEndTime,
    setMemberValidationRemainingTime,
    setMemberValidationAttempt,
    setMemberValidationCooldown,
  ]);

  return {
    remainingTime,
    isInCooldown: cooldownEndTime ? Date.now() < cooldownEndTime : false,
  };
}
