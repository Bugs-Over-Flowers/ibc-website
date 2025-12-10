"use client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
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
      eventType: "",
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

      toast.success("Event created successfully!");
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.AppField name="registrationFee">
                {(field) => <field.NumberField label="Registration Fee * " />}
              </form.AppField>

              <form.AppField name="eventType">
                {(field) => (
                  <field.SelectField
                    label="Event Type *"
                    placeholder="Select event type"
                    options={[
                      { label: "Public", value: "public" },
                      { label: "Private", value: "private" },
                    ]}
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="eventImage">
              {(field) => (
                <field.FileDropzoneField
                  label="Event Image *"
                  description="Upload an image for the event banner"
                  multiple
                  maxFiles={3}
                />
              )}
            </form.AppField>

            <div className="flex justify-end">
              <form.SubmitButton
                label="Create Event"
                isSubmittingLabel="Creating..."
              />
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
