import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { scheduleMeetingSchema } from "@/lib/validation/application";
import { scheduleMeeting } from "@/server/applications/mutations/scheduleMeeting";
import { useSelectedApplications } from "../_context/SelectedApplicationsContext";

export function useMeetingScheduler(onSuccess?: () => void) {
  const router = useRouter();
  const { selectedApplicationIds } = useSelectedApplications();

  const form = useAppForm({
    defaultValues: {
      applicationIds: Array.from(selectedApplicationIds),
      interviewDate: undefined as Date | undefined,
      interviewVenue: "",
    },
    validators: {
      onSubmit: scheduleMeetingSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.interviewDate) {
        toast.error("Interview date is required");
        return;
      }

      const result = await tryCatch(
        scheduleMeeting({
          ...value,
          interviewDate: value.interviewDate,
          applicationIds: Array.from(selectedApplicationIds),
        }),
      );

      if (!result.success) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to schedule meeting",
        );
        return;
      }
      toast.success(
        "Meeting scheduled successfully! Emails sent to applicants.",
      );
      form.reset();
      onSuccess?.();
      router.refresh();
    },
  });

  // Keep applicationIds in sync with current selection so validation/button state is accurate.
  useEffect(() => {
    form.setFieldValue("applicationIds", Array.from(selectedApplicationIds));
  }, [form, selectedApplicationIds]);

  return form;
}
