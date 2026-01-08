"use client";

import { Calendar as CalendarIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelectedApplications } from "../_context/SelectedApplicationsContext";
import { useMeetingScheduler } from "../_hooks/useMeetingScheduler";

export default function MeetingScheduler() {
  const { selectedApplicationIds, clearSelection } = useSelectedApplications();
  const form = useMeetingScheduler(() => {
    clearSelection();
  });

  const selectedCount = selectedApplicationIds.size;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" /> Schedule Interview for Selected
          Applications
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
            form.handleSubmit();
          }}
        >
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              {selectedCount} application{selectedCount !== 1 ? "s" : ""}
              selected
            </p>

            <div className="grid grid-cols-2 gap-2">
              <form.AppField name="interviewDate">
                {(field) => (
                  <field.FormDatePicker label="Date" minDate={new Date()} />
                )}
              </form.AppField>

              <form.AppField name="interviewVenue">
                {(field) => (
                  <field.TextField label="Venue" placeholder="Venue address" />
                )}
              </form.AppField>
            </div>
          </div>

          <form.AppForm>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={clearSelection} type="button" variant="outline">
                Clear Selection
              </Button>
              <form.SubmitButton
                isSubmittingLabel="Sending..."
                label={
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send
                  </span>
                }
              />
            </div>
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
