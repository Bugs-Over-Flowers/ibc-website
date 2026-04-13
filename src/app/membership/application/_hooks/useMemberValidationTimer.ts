import { useEffect } from "react";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";

function getManilaDateKey(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

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
  const lastRateLimitResetDate = useMembershipApplicationStore(
    (state) => state.memberValidation.lastRateLimitResetDate,
  );
  const resetMemberValidationRateLimit = useMembershipApplicationStore(
    (state) => state.resetMemberValidationRateLimit,
  );

  useEffect(() => {
    const today = getManilaDateKey();
    if (lastRateLimitResetDate !== today) {
      resetMemberValidationRateLimit();
    }
  }, [lastRateLimitResetDate, resetMemberValidationRateLimit]);

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
        resetMemberValidationRateLimit();
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
    resetMemberValidationRateLimit,
  ]);

  return {
    remainingTime,
    isInCooldown: cooldownEndTime ? Date.now() < cooldownEndTime : false,
  };
}
