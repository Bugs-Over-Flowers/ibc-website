"use client";

import { useStore } from "@tanstack/react-form";
import { CalendarDays, Info, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import { createSRFormSchema } from "@/lib/validation/sponsored-registration/sponsored-registration";
import { createSR } from "@/server/sponsored-registrations/mutations/createSR";
import { CreateSREventPreview } from "./CreateSREventPreview";
import { CreateSRFeePreview } from "./CreateSRFeePreview";
import type { CreateSREventOption } from "./types";

interface CreateSRFormProps {
  events: CreateSREventOption[];
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
        const errorMessage = String(error);
        const isFeeError = errorMessage.toLowerCase().includes("cannot exceed");

        if (isFeeError) {
          toast.error(
            "Fee deduction cannot exceed the event registration fee.",
          );
        } else {
          toast.error(errorMessage);
        }

        form.setFieldMeta(isFeeError ? "feeDeduction" : "eventId", (prev) => ({
          ...prev,
          errors: [errorMessage],
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

  const selectedEventId = useStore(form.store, (state) => state.values.eventId);
  const feeDeduction = useStore(
    form.store,
    (state) => state.values.feeDeduction,
  );
  const selectedEvent = events.find(
    (event) => event.eventId === selectedEventId,
  );

  return (
    <form
      className="mx-auto w-full max-w-7xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-5">
        <Card className="gap-3 overflow-hidden rounded-xl border-border/60">
          <CardHeader className="border-border/50 border-b bg-none pb-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              Registration Details
            </CardTitle>
            <CardDescription>
              Select the event and identify the sponsor for this registration
              link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
            <form.AppField name="eventId">
              {(field) => (
                <field.SelectField
                  description="Pick the event this sponsored registration link will be attached to"
                  label="Event"
                  options={eventOptions}
                  placeholder="Select an event"
                  reserveErrorSpace={false}
                />
              )}
            </form.AppField>

            {selectedEvent ? (
              <CreateSREventPreview event={selectedEvent} />
            ) : null}

            <form.AppField name="sponsoredBy">
              {(field) => (
                <field.TextField
                  description="Organization, individual, or department providing this sponsorship"
                  label="Sponsored By"
                  placeholder="e.g., ACME Corp"
                />
              )}
            </form.AppField>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border/60">
          <CardHeader className="border-border/50 border-b pb-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Sponsorship Limits
            </CardTitle>
            <CardDescription>
              Set the discount value and how many guests can register using this
              link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
            <div className="grid gap-5 md:grid-cols-2">
              <form.AppField name="feeDeduction">
                {(field) => (
                  <field.NumberField
                    description="Discount amount deducted per registration. Must not exceed the selected event registration fee"
                    label="Fee Deduction (PHP)"
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

            {selectedEvent ? (
              <CreateSRFeePreview
                event={selectedEvent}
                feeDeduction={feeDeduction}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border/60">
          <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
            <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  A unique link will be generated
                </p>
                <p className="mt-1 text-muted-foreground">
                  After creation, the sponsor can share this link with guests
                  and the fee deduction will be applied automatically.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                className="w-full sm:w-auto"
                onClick={() => router.back()}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>

              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting
                      ? "Creating..."
                      : "Create Sponsored Registration"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
