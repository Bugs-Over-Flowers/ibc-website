import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { scheduleMeetingAction } from "@/server/applications/mutations/scheduleMeetingAction";
import { useMeetingSchedulerStore } from "../_store/useMeetingSchedulerStore";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";

export function useMeetingScheduler(onSuccess?: () => void) {
  const router = useRouter();
  const { selectedApplicationIds } = useSelectedApplicationsStore();
  const { interviewDate, interviewVenue, reset } = useMeetingSchedulerStore();

  // Persisted store may hydrate interviewDate as a string; normalize to Date.
  const hydratedInterviewDate =
    typeof interviewDate === "string" ? new Date(interviewDate) : interviewDate;
  const hasValidInterviewDate =
    hydratedInterviewDate && !Number.isNaN(hydratedInterviewDate.getTime());

  // Format store date as string for FormDateTimePicker
  const defaultDateString = hasValidInterviewDate
    ? hydratedInterviewDate.toISOString().slice(0, 16)
    : "";

  const form = useAppForm({
    defaultValues: {
      applicationIds: Array.from(selectedApplicationIds),
      interviewDate: defaultDateString,
      interviewVenue: interviewVenue ?? "",
      customMessage: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: ({ value }) => {
        const errors: Record<string, string> = {};

        if (!value.interviewDate) {
          errors.interviewDate = "Interview date is required";
        }

        if (!value.interviewVenue || value.interviewVenue.trim().length < 3) {
          errors.interviewVenue =
            "Interview venue is required (min. 3 characters)";
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      // Convert string datetime to Date object
      const interviewDateObj = new Date(value.interviewDate);

      const [error, data] = await scheduleMeetingAction({
        ...value,
        interviewDate: interviewDateObj,
        applicationIds: Array.from(selectedApplicationIds),
      });

      if (error || !data) {
        toast.error(error ?? "Failed to schedule meeting");
        return;
      }
      toast.success(
        data.message ??
          "Meeting scheduled successfully! Emails sent to applicants.",
      );
      form.reset();
      reset();
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
