import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MeetingSchedulerState {
  interviewDate: Date | undefined;
  interviewVenue: string;
  setInterviewDate: (date: Date | undefined) => void;
  setInterviewVenue: (venue: string) => void;
  reset: () => void;
}

export const useMeetingSchedulerStore = create<MeetingSchedulerState>()(
  persist(
    (set) => ({
      interviewDate: undefined,
      interviewVenue: "",
      setInterviewDate: (date) => set({ interviewDate: date }),
      setInterviewVenue: (venue) => set({ interviewVenue: venue }),
      reset: () => set({ interviewDate: undefined, interviewVenue: "" }),
    }),
    {
      name: "meeting-scheduler-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        interviewVenue: state.interviewVenue,
      }),
    },
  ),
);
