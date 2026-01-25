"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useScheduleMeetingAction } from "@/app/admin/application/_hooks/useScheduleMeetingAction";
import { useMeetingSchedulerStore } from "@/app/admin/application/_store/useMeetingSchedulerStore";
import { useSelectedApplicationsStore } from "@/app/admin/application/_store/useSelectedApplicationsStore";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { fetchApplicationsByIds } from "@/server/applications/queries/fetchApplicationsByIds";
import { ScheduleInterviewContent } from "./ScheduleInterviewContent";
import { ScheduleInterviewSkeleton } from "./ScheduleInterviewSkeleton";

export function ScheduleInterview() {
  const router = useRouter();
  const { selectedApplicationIds, clearSelection } =
    useSelectedApplicationsStore();
  const {
    interviewDate,
    interviewVenue,
    reset: resetScheduler,
  } = useMeetingSchedulerStore();

  // Track if submission was successful to prevent redirect effect from firing
  const [isSubmitSuccess, setIsSubmitSuccess] = React.useState(false);

  // Redirect if required data is not set (but not after successful submission)
  useEffect(() => {
    if (isSubmitSuccess) return;

    if (
      !interviewDate ||
      !interviewVenue ||
      selectedApplicationIds.size === 0
    ) {
      toast.error(
        "Please select applications and set interview date and venue",
      );
      router.push("/admin/application");
    }
  }, [
    interviewDate,
    interviewVenue,
    selectedApplicationIds,
    router,
    isSubmitSuccess,
  ]);

  const { scheduleMeeting, isPending } = useScheduleMeetingAction({
    onSuccess: (data) => {
      toast.success(
        data.message ??
          "Meeting scheduled successfully! Emails sent to applicants.",
      );
      // Mark as success to prevent redirect effect from firing
      setIsSubmitSuccess(true);
      // Reset form and clear selections after successful submission
      resetScheduler();
      clearSelection();
    },
    onError: (error) => {
      toast.error(
        typeof error === "string" ? error : "Failed to schedule meeting",
      );
    },
  });

  const handleSubmit = async (
    customMessage: string,
    applicationIds: string[],
  ) => {
    if (!interviewDate || !interviewVenue) {
      toast.error("Interview date and venue are required");
      return { success: false };
    }

    const result = await scheduleMeeting({
      applicationIds,
      interviewDate,
      interviewVenue,
      customMessage,
    });

    return { success: result.success };
  };

  // Fetch applications via server action
  const { execute: executeGetApplications } = useAction(
    tryCatch(fetchApplicationsByIds),
  );

  const [applications, setApplications] = React.useState<
    Array<{ applicationId: string; companyName: string }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApplications() {
      if (selectedApplicationIds.size > 0) {
        const { error, data, success } = await executeGetApplications(
          Array.from(selectedApplicationIds),
        );

        if (!success || !data) {
          toast.error(
            typeof error === "string" ? error : "Failed to fetch applications",
          );
          router.push("/admin/application");
        } else {
          setApplications(Array.isArray(data) ? data : [data]);
        }
      }
      setIsLoading(false);
    }

    fetchApplications();
  }, [selectedApplicationIds, router, executeGetApplications]);

  if (isLoading) {
    return <ScheduleInterviewSkeleton />;
  }

  return (
    <ScheduleInterviewContent
      applications={applications}
      interviewDate={interviewDate}
      interviewVenue={interviewVenue}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  );
}
