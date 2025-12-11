"use client";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formContext, useAppForm } from "@/hooks/_formHooks";
import createEventSchema from "@/lib/validation/event/createEventSchema";
import { createEvent } from "@/server/events/actions";

function CreateEventForm() {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      eventTitle: "",
      description: "",
      eventStartDate: "",
      eventEndDate: "",
      venue: "",
      registrationFee: 0,
      eventType: null as "public" | "private" | null,
      eventImage: [] as File[],
    },

    validators: {
      onSubmit: createEventSchema,
    },

    onSubmit: async ({ value }) => {
      console.log("Submitting form to server...", value);
      const result = await createEvent(value);

      if (!result.success) {
        toast.error(result.error as string);
        return;
      }

      const message =
        value.eventType === null
          ? "Saved event as draft"
          : "Event created successfully!";

      toast.success(message);
      router.push("/admin/dashboard");
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-0">
      <button type="button" onClick={() => router.push("/admin/dashboard")}>
        Back to events
      </button>
      <h2 className="font-bold mb-2 mt-12">Create New Event</h2>
      <p className="!text-lg mb-6">Fill in the details to create new event.</p>

      <div className=" min-h-screen rounded-lg">
        <formContext.Provider value={form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.AppField name="eventStartDate">
                {(field) => (
                  <field.TextField
                    type="datetime-local"
                    label="Event Start Date *"
                  />
                )}
              </form.AppField>

              <form.AppField name="eventEndDate">
                {(field) => (
                  <field.TextField
                    type="datetime-local"
                    label="Event End Date *"
                  />
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

            <form.AppField name="registrationFee">
              {(field) => <field.NumberField label="Registration Fee * " />}
            </form.AppField>

            <form.AppField name="eventImage">
              {(field) => (
                <field.FileDropzoneField
                  label="Event Image *"
                  description="Upload an image for the event banner"
                  maxFiles={1}
                />
              )}
            </form.AppField>

            <div className="flex justify-end gap-4">
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => {
                        form.setFieldValue("eventType", null);
                        form.handleSubmit();
                      }}
                    >
                      Save as Draft
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button disabled={isSubmitting}>
                          {isSubmitting ? "Creating..." : "Create Event"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0" align="end">
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none"
                            onClick={() => {
                              form.setFieldValue("eventType", "public");
                              form.handleSubmit();
                            }}
                          >
                            Public Event
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start rounded-none"
                            onClick={() => {
                              form.setFieldValue("eventType", "private");
                              form.handleSubmit();
                            }}
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

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEventForm />
    </Suspense>
  );
}
