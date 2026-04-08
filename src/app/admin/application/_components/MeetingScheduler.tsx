"use client";

import { addDays, isSameDay, parseISO, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMeetingScheduler } from "../_hooks/useMeetingScheduler";
import { useMeetingSchedulerSync } from "../_hooks/useMeetingSchedulerSync";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";

export default function MeetingScheduler() {
  const { selectedApplicationIds, clearSelection } =
    useSelectedApplicationsStore();
  const minInterviewDate = addDays(startOfDay(new Date()), 1);

  const form = useMeetingScheduler(() => {
    clearSelection();
  });

  const { handleNavigateToSchedule } = useMeetingSchedulerSync(form);

  const selectedCount = selectedApplicationIds.size;

  return (
    <Card className="flex h-full flex-col gap-0 rounded-2xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarIcon className="size-4" />
          <span>Schedule Interview</span>
          <Badge className="ml-auto" variant="secondary">
            {selectedCount} selected
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Set a date and venue for all selected applications.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <form.AppField name="interviewDate">
                {(field) => (
                  <div suppressHydrationWarning>
                    <field.FormDateTimePicker
                      className="w-full"
                      minDate={minInterviewDate}
                    />
                  </div>
                )}
              </form.AppField>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="px-1 font-normal text-muted-foreground text-xs">
                Venue
              </Label>
              <form.AppField name="interviewVenue">
                {(field) => (
                  <field.TextField placeholder="Enter venue address" />
                )}
              </form.AppField>
            </div>
          </div>

          <CardFooter className="border-t px-0 pt-4">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                onClick={clearSelection}
                size="sm"
                type="button"
                variant="outline"
              >
                Clear
              </Button>
              <form.Subscribe
                selector={(state) => ({
                  interviewDate: state.values.interviewDate,
                  interviewVenue: state.values.interviewVenue,
                  isFieldInvalid:
                    (state.fieldMeta.interviewDate?.errors?.length ?? 0) > 0 ||
                    (state.fieldMeta.interviewVenue?.errors?.length ?? 0) > 0,
                  isVenueTooShort:
                    !state.values.interviewVenue ||
                    state.values.interviewVenue.trim().length < 3,
                  isCurrentDateSelected:
                    !!state.values.interviewDate &&
                    isSameDay(parseISO(state.values.interviewDate), new Date()),
                })}
              >
                {(state) => (
                  <Button
                    disabled={
                      selectedCount === 0 ||
                      !state.interviewDate ||
                      !state.interviewVenue ||
                      state.isFieldInvalid ||
                      state.isVenueTooShort ||
                      state.isCurrentDateSelected
                    }
                    onClick={handleNavigateToSchedule}
                    size="sm"
                    type="button"
                  >
                    Send Message
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
