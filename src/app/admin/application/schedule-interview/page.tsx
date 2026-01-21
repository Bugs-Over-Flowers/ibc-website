"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useScheduleMeetingAction } from "@/app/admin/application/_hooks/useScheduleMeetingAction";
import { useMeetingSchedulerStore } from "@/app/admin/application/_store/useMeetingSchedulerStore";
import { useSelectedApplicationsStore } from "@/app/admin/application/_store/useSelectedApplicationsStore";
import { ScheduleInterviewContent } from "@/app/admin/application/schedule-interview/_components/ScheduleInterviewContent";
import { ScheduleInterviewSkeleton } from "@/app/admin/application/schedule-interview/_components/ScheduleInterviewSkeleton";
import tryCatch from "@/lib/server/tryCatch";
import { getApplicationsByIds } from "@/server/applications/queries/getApplicationsByIds";

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const { selectedApplicationIds } = useSelectedApplicationsStore();
  const { interviewDate, interviewVenue } = useMeetingSchedulerStore();

  // Redirect if required data is not set
  useEffect(() => {
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
  }, [interviewDate, interviewVenue, selectedApplicationIds, router]);

  const { scheduleMeeting, isPending } = useScheduleMeetingAction({
    onSuccess: (data) => {
      toast.success(
        data.message ??
          "Meeting scheduled successfully! Emails sent to applicants.",
      );
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

  // Fetch applications
  const [applications, setApplications] = React.useState<
    Array<{ applicationId: string; companyName: string }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApplications() {
      if (selectedApplicationIds.size > 0) {
        const { error, data, success } = await tryCatch(
          getApplicationsByIds(Array.from(selectedApplicationIds)),
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
  }, [selectedApplicationIds, router]);

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
