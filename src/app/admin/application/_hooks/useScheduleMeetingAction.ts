"use client";

import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { scheduleMeeting } from "@/server/applications/mutations/scheduleMeeting";

type ScheduleMeetingResult = { success: true; message: string };

interface Options {
  onSuccess?: (data: ScheduleMeetingResult) => void;
  onError?: (error: string | Error) => void;
  persist?: boolean;
}

export function useScheduleMeetingAction(options: Options = {}) {
  const { execute, isPending, error, data, reset } = useAction(
    tryCatch(scheduleMeeting),
    {
      onSuccess: options.onSuccess,
      onError: options.onError,
      persist: options.persist,
    },
  );

  return {
    scheduleMeeting: execute,
    isPending,
    error,
    data,
    reset,
  };
}
