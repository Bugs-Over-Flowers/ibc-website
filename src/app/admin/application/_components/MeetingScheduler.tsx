"use client";
import { addDays, isSameDay, parseISO, startOfDay } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
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
    <Card className="h-auto overflow-hidden rounded-2xl py-2">
      {/* Header */}
      <CardHeader className="space-y-1.5 border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 shrink-0 text-foreground" />
          <CardTitle className="flex-1 font-medium text-sm">
            Schedule interview
          </CardTitle>
          <Badge
            className={
              selectedCount > 0
                ? "border border-[#85B7EB] bg-[#E6F1FB] text-[#0C447C] dark:border-[#185FA5] dark:bg-[#0C447C] dark:text-[#B5D4F4]"
                : ""
            }
            variant={selectedCount > 0 ? "default" : "secondary"}
          >
            {selectedCount} selected
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          Set a date and venue for all selected applications.
        </p>
      </CardHeader>

      {/* Body */}
      <CardContent className="px-5 py-5 pt-0">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Date & time */}
          <div className="flex flex-col gap-1.5">
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

          {/* Venue */}
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 px-0.5 font-normal text-muted-foreground text-xs">
              Venue
            </Label>
            <form.AppField name="interviewVenue">
              {(field) => <field.TextField placeholder="Enter venue address" />}
            </form.AppField>
          </div>

          {/* Footer */}
          <CardFooter className="mt-0 border-t px-0 py-0">
            <div className="flex w-full flex-col gap-2">
              <Button
                className="h-9 w-full justify-center"
                onClick={clearSelection}
                size="sm"
                type="button"
                variant="outline"
              >
                Clear selection
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
                    className="h-9 w-full justify-center gap-1.5"
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
                    <Send className="size-3.5" />
                    Send message
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
