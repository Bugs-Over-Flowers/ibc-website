"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMeetingScheduler } from "../_hooks/useMeetingScheduler";
import { useMeetingSchedulerStore } from "../_store/useMeetingSchedulerStore";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";

export default function MeetingScheduler() {
  const router = useRouter();
  const { selectedApplicationIds, clearSelection } =
    useSelectedApplicationsStore();
  const { setInterviewDate, setInterviewVenue } = useMeetingSchedulerStore();

  const form = useMeetingScheduler(() => {
    clearSelection();
  });

  const selectedCount = selectedApplicationIds.size;

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

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-xl">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Schedule Interview
          for Selected Applications
          <span className="font-normal text-muted-foreground text-sm">
            ({selectedCount})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <form
          className="flex h-full flex-col"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              {selectedCount} application {selectedCount !== 1 ? "s" : ""}
              selected
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
              <form.AppField name="interviewDate">
                {(field) => (
                  <div suppressHydrationWarning>
                    <field.FormDateTimePicker
                      className="w-full"
                      minDate={new Date()}
                    />
                  </div>
                )}
              </form.AppField>
              <div className="flex flex-col gap-2">
                <Label className="px-1 font-normal text-muted-foreground text-xs">
                  Venue
                </Label>
                <form.AppField name="interviewVenue">
                  {(field) => <field.TextField placeholder="Venue address" />}
                </form.AppField>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              className="active:scale-95 active:opacity-80"
              onClick={clearSelection}
              type="button"
              variant="outline"
            >
              Clear Selection
            </Button>
            <form.Subscribe
              selector={(state) => ({
                interviewDate: state.values.interviewDate,
                interviewVenue: state.values.interviewVenue,
              })}
            >
              {(state) => (
                <Button
                  className="active:scale-95 active:opacity-80"
                  disabled={
                    selectedCount === 0 ||
                    !state.interviewDate ||
                    !state.interviewVenue
                  }
                  onClick={handleNavigateToSchedule}
                  type="button"
                >
                  Send Message
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
