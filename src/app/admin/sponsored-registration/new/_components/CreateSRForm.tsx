"use client";

import { useRouter } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import { createSRFormSchema } from "@/lib/validation/sponsored-registration/sponsored-registration";
import { createSR } from "@/server/sponsored-registrations/actions/createSR";

interface CreateSRFormProps {
  events: Array<{
    eventId: string;
    eventTitle: string;
    eventStartDate: string | null;
    eventEndDate: string | null;
  }>;
}

export function CreateSRForm({ events }: CreateSRFormProps) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      eventId: "",
      sponsoredBy: "",
      feeDeduction: 0,
      maxSponsoredGuests: 1,
    },
    validators: {
      onSubmit: zodValidator(createSRFormSchema),
    },
    onSubmit: async ({ value }) => {
      const { error, data, success } = await tryCatch(createSR(value));

      if (!success) {
        form.setFieldMeta("eventId", (prev) => ({
          ...prev,
          errors: [String(error)],
        }));
        return;
      }

      router.push(
        `/admin/events/${data.eventId}/sponsored-registrations/${data.sponsoredRegistrationId}`,
      );
    },
  });

  const eventOptions = events.map((event) => ({
    value: event.eventId,
    label: event.eventTitle,
  }));

  return (
    <form
      className="mx-auto max-w-7xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-5 rounded-lg border bg-card p-5">
        <form.AppField name="eventId">
          {(field) => (
            <field.SelectField
              description="Choose the event for this sponsored registration"
              label="Event"
              options={eventOptions}
              placeholder="Select an event"
            />
          )}
        </form.AppField>
        <form.AppField name="sponsoredBy">
          {(field) => (
            <field.TextField
              description="Organization, individual, or department providing the sponsorship"
              label="Sponsored By"
              placeholder="e.g., ACME Corp, John Doe, Department of CS"
            />
          )}
        </form.AppField>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <form.AppField name="feeDeduction">
            {(field) => (
              <field.NumberField
                description="Amount to deduct from registration fee"
                label="Fee Deduction (₱)"
                max={1500}
                min={0}
                placeholder="0"
                step={1}
              />
            )}
          </form.AppField>

          <form.AppField name="maxSponsoredGuests">
            {(field) => (
              <field.NumberField
                description="Total registrations allowed via this link"
                label="Maximum Guests"
                min={1}
                placeholder="e.g., 10"
                step={1}
              />
            )}
          </form.AppField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 rounded-lg border bg-muted/50 px-5 py-3">
        <span className="text-muted-foreground text-sm">
          A unique link will be generated
        </span>
        <form.AppForm>
          <form.SubmitButton
            isSubmittingLabel="Creating..."
            label="Create Sponsored Registration"
          />
        </form.AppForm>
      </div>
    </form>
  );
}
