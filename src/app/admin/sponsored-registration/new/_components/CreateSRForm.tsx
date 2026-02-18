"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      className="mx-auto w-full max-w-7xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="font-semibold text-base">Registration Details</h2>
          <p className="text-muted-foreground text-sm">
            Start by selecting an event and identifying the sponsor.
          </p>
        </div>

        <form.AppField name="eventId">
          {(field) => (
            <field.SelectField
              description="Pick the event this sponsored registration link will be attached to"
              label="Event"
              options={eventOptions}
              placeholder="Select an event"
            />
          )}
        </form.AppField>
        <form.AppField name="sponsoredBy">
          {(field) => (
            <field.TextField
              description="Organization, individual, or department providing this sponsorship"
              label="Sponsored By"
              placeholder="e.g., ACME Corp"
            />
          )}
        </form.AppField>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="font-semibold text-base">Sponsorship Limits</h2>
          <p className="text-muted-foreground text-sm">
            Set the discount value and how many guests can register using this
            link.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <form.AppField name="feeDeduction">
            {(field) => (
              <field.NumberField
                description="Discount amount deducted per registration (0 to 1500)"
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
                description="Maximum number of successful registrations allowed"
                label="Maximum Guests"
                min={1}
                placeholder="e.g., 10"
                step={1}
              />
            )}
          </form.AppField>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground text-sm">
          A unique link will be generated
        </span>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancel
          </Button>
          <form.AppForm>
            <form.SubmitButton
              className="min-w-[220px]"
              isSubmittingLabel="Creating..."
              label="Create Sponsored Registration"
            />
          </form.AppForm>
        </div>
      </div>
    </form>
  );
}
