"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formContext } from "@/hooks/_formHooks";
import { useCreateEventForm } from "../../_hooks/createEventHook";

export function CreateEventForm() {
  const { form, router } = useCreateEventForm();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-0">
      <Button
        className="mb-2"
        onClick={() => router.push("/admin/events")}
        type="button"
        variant="ghost"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to events
      </Button>
      <h2 className="mt-8 mb-2 font-bold text-2xl">Create New Event</h2>
      <p className="mb-6 text-lg!">
        Fill in the details to create a new event.
      </p>

      <div className="min-h-screen rounded-lg">
        <formContext.Provider value={form}>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.AppField name="eventTitle">
              {(field) => (
                <field.TextField
                  label={
                    <span>
                      Event Title <span className="text-destructive">*</span>
                    </span>
                  }
                  placeholder="Enter event title "
                />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Description"
                  placeholder="Enter event description"
                />
              )}
            </form.AppField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.AppField name="eventStartDate">
                {(field) => <field.FormCalendar label="Event Start Date *" />}
              </form.AppField>

              <form.AppField name="eventEndDate">
                {(field) => <field.FormCalendar label="Event End Date *" />}
              </form.AppField>
            </div>

            <form.AppField name="venue">
              {(field) => (
                <field.TextField
                  label="Venue *"
                  placeholder="Enter venue location"
                />
              )}
            </form.AppField>

            <form.AppField name="registrationFee">
              {(field) => <field.NumberField label="Registration Fee * " />}
            </form.AppField>

            <form.AppField name="eventImage">
              {(field) => (
                <field.FileDropzoneField
                  description="Upload an image for the event banner"
                  label="Event Image *"
                  maxFiles={1}
                />
              )}
            </form.AppField>

            <div className="flex justify-end gap-4">
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <>
                    <Button
                      disabled={isSubmitting}
                      onClick={() => router.push("/admin/events")}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={isSubmitting}
                      onClick={() => {
                        form.setFieldValue("eventType", null);
                        form.handleSubmit();
                      }}
                      type="button"
                      variant="outline"
                    >
                      Save as Draft
                    </Button>

                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Event"}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        }
                      />

                      <PopoverContent align="end" className="w-40 p-0">
                        <div className="flex flex-col">
                          <Button
                            className="justify-start rounded-none"
                            onClick={() => {
                              form.setFieldValue("eventType", "public");
                              form.handleSubmit();
                            }}
                            variant="ghost"
                          >
                            Public Event
                          </Button>
                          <Button
                            className="justify-start rounded-none"
                            onClick={() => {
                              form.setFieldValue("eventType", "private");
                              form.handleSubmit();
                            }}
                            variant="ghost"
                          >
                            Private Event
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </form.Subscribe>
            </div>
          </form>
        </formContext.Provider>
      </div>
    </div>
  );
}
