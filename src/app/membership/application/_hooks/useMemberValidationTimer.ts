import { useEffect } from "react";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";

/**
 * Custom hook to manage persistent timer for member validation cooldown.
 * This timer persists across page navigation and browser sessions.
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

      setMemberValidationRemainingTime(remainingSeconds);

      if (remaining <= 0) {
        // Timer has expired
        setMemberValidationRemainingTime(0);
      }
    };

    // Update immediately
    updateRemainingTime();

    // Set up interval to update every second
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime, setMemberValidationRemainingTime]);

  return {
    remainingTime,
    isInCooldown: cooldownEndTime ? Date.now() < cooldownEndTime : false,
  };
}
