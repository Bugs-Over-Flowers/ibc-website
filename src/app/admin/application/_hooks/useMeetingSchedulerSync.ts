import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMeetingSchedulerStore } from "../_store/useMeetingSchedulerStore";
import type { useMeetingScheduler } from "./useMeetingScheduler";

/**
 * Hook to synchronize form state with persistent stores
 * and handle navigation for the meeting scheduler
 */
export function useMeetingSchedulerSync(
  form: ReturnType<typeof useMeetingScheduler>,
) {
  const router = useRouter();
  const { setInterviewDate, setInterviewVenue } = useMeetingSchedulerStore();

  // Sync interview date to store
  useEffect(() => {
    const dateString = form.state.values.interviewDate;
    if (!dateString) {
      setInterviewDate(undefined);
      return;
    }

    const parsed = new Date(dateString);
    if (!Number.isNaN(parsed.getTime())) {
      setInterviewDate(parsed);
    }
  }, [form.state.values.interviewDate, setInterviewDate]);

  // Sync interview venue to store
  useEffect(() => {
    setInterviewVenue(form.state.values.interviewVenue ?? "");
  }, [form.state.values.interviewVenue, setInterviewVenue]);

  const handleNavigateToSchedule = () => {
    // Ensure store is updated with latest form values before navigation
    const dateString = form.state.values.interviewDate;
    if (dateString) {
      const parsed = new Date(dateString);
      if (!Number.isNaN(parsed.getTime())) {
        setInterviewDate(parsed);
      }
    } else {
      setInterviewDate(undefined);
    }
    setInterviewVenue(form.state.values.interviewVenue ?? "");
    router.push("/admin/application/schedule-interview");
  };

  return { handleNavigateToSchedule };
}
