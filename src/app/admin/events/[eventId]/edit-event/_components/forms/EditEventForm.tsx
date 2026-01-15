"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formContext } from "@/hooks/_formHooks";
import type { Database } from "@/lib/supabase/db.types";
import { useEditEventForm } from "../../_hooks/useEditEventForm";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];

interface EditEventFormProps {
  event: EventRow;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const { form, router, isDraft, isFinished } = useEditEventForm({ event });

  // Only block editing if it's finished AND NOT a draft
  if (isFinished && !isDraft) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-0">
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/admin/events/${event.eventId}`)}
          type="button"
        >
          ← Back to event
        </button>
        <div className="mt-12 text-center">
          <h2 className="font-bold text-2xl text-destructive">
            Cannot Edit Finished Event
          </h2>
          <p className="mt-2 text-muted-foreground">
            This event has already ended and cannot be modified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        className="text-muted-foreground hover:text-foreground"
        onClick={() => router.push(`/admin/events/${event.eventId}`)}
        type="button"
      >
        ← Back to event
      </button>
      <h2 className="mt-12 mb-2 font-bold text-2xl">Edit Event</h2>
      <p className="mb-6 text-lg text-muted-foreground">
        {isDraft
          ? "This is a draft event. All fields are editable."
          : "This is a published event. Only title, description, dates, venue, and image can be edited."}
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
                  placeholder="Enter event title"
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
                {(field) => (
                  <field.FormDateTimePicker label="Event Start Date *" />
                )}
              </form.AppField>

              <form.AppField name="eventEndDate">
                {(field) => (
                  <field.FormDateTimePicker label="Event End Date *" />
                )}
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

            {/* Registration Fee - Only editable for draft events */}
            {isDraft && (
              <form.AppField name="registrationFee">
                {(field) => <field.NumberField label="Registration Fee *" />}
              </form.AppField>
            )}

            {/* Show current registration fee for published events */}
            {!isDraft && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Registration Fee</p>
                <p className="text-muted-foreground">
                  ₱{event.registrationFee.toLocaleString()} (Cannot be edited
                  for published events)
                </p>
              </div>
            )}

            <form.AppField name="maxGuest">
              {(field) => <field.NumberField label="Max Guest *" />}
            </form.AppField>

            {/* Current Image Preview */}
            {event.eventHeaderUrl && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Current Image</p>
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    alt="Current event image"
                    className="object-cover"
                    fill
                    src={event.eventHeaderUrl}
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            <form.AppField name="eventImage">
              {(field) => (
                <field.FileDropzoneField
                  description="Upload a new image to replace the current one (optional) (5 MB max)"
                  label="New Event Image"
                  layout="banner"
                  maxFiles={1}
                />
              )}
            </form.AppField>

            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
              <form.Subscribe
                selector={(state) => ({
                  isSubmitting: state.isSubmitting,
                  isDirty: state.isDirty,
                })}
              >
                {({ isSubmitting, isDirty }) => (
                  <>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={isSubmitting}
                      onClick={() =>
                        router.push(`/admin/events/${event.eventId}`)
                      }
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>

                    {isDraft ? (
                      <>
                        <Button
                          className="w-full sm:w-auto"
                          disabled={isSubmitting || !isDirty}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                              <Button
                                className="w-full sm:w-auto"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Saving..." : "Publish Event"}
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            }
                          />

                          <PopoverContent align="end" className="w-40 p-0">
                            <div className="flex flex-col">
                              <Button
                                className="justify-start rounded-none"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  form.setFieldValue("eventType", "public");
                                  form.handleSubmit();
                                }}
                                variant="ghost"
                              >
                                Public Event
                              </Button>
                              <Button
                                className="justify-start rounded-none"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
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
                    ) : (
                      <Button
                        className="w-full sm:w-auto"
                        disabled={isSubmitting || !isDirty}
                        type="submit"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
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
