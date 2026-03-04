import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { scheduleMeetingSchema } from "@/lib/validation/scheduleMeeting";
import { scheduleMeetingAction } from "@/server/applications/mutations/scheduleMeetingAction";
import { useMeetingSchedulerStore } from "../_store/useMeetingSchedulerStore";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";

export function useMeetingScheduler(onSuccess?: () => void) {
  const router = useRouter();
  const { selectedApplicationIds } = useSelectedApplicationsStore();
  const { interviewDate, interviewVenue, reset } = useMeetingSchedulerStore();

  // Format store date as string for FormDateTimePicker
  const defaultDateString =
    interviewDate && !Number.isNaN(interviewDate.getTime())
      ? interviewDate.toISOString().slice(0, 16)
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
      onDynamic: scheduleMeetingSchema,
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
