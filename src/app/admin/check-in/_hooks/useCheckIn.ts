"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { checkIn } from "@/server/attendance/mutations/checkin";

export const useCheckIn = () => {
  const action = useAction(tryCatch(checkIn), {
    onSuccess: () => {
      toast.message("Checked in people.");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  return action;
};
