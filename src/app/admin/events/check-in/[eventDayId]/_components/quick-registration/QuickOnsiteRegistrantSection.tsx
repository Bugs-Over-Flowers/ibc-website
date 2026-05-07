"use client";

import type useQuickRegistration from "@/app/admin/events/check-in/[eventDayId]/_hooks/useQuickRegistration";
import { FieldError, FieldGroup } from "@/components/ui/field";

interface QuickOnsiteRegistrantSectionProps {
  quickForm: ReturnType<typeof useQuickRegistration>;
}

export default function QuickOnsiteRegistrantSection({
  quickForm,
}: QuickOnsiteRegistrantSectionProps) {
  return (
    <FieldGroup>
      <div className="space-y-1 pt-1">
        <p className="font-semibold text-foreground text-sm">
          Attendee Details
        </p>
        <p className="text-muted-foreground text-xs">
          Capture the primary contact information for this check-in.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <quickForm.AppField name="firstName">
          {(field) => <field.TextField label="First Name" placeholder="Juan" />}
        </quickForm.AppField>
        <quickForm.AppField name="lastName">
          {(field) => (
            <field.TextField label="Last Name" placeholder="Dela Cruz" />
          )}
        </quickForm.AppField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <quickForm.AppField name="email">
          {(field) => (
            <field.TextField
              label="Email Address"
              placeholder="juan.delacruz@example.com"
              type="email"
            />
          )}
        </quickForm.AppField>
        <quickForm.AppField name="contactNumber">
          {(field) => (
            <field.TextField label="Contact Number" placeholder="09XXXXXXXXX" />
          )}
        </quickForm.AppField>
      </div>

      <quickForm.AppField name="remark">
        {(field) => (
          <field.TextareaField
            label="Remarks (optional)"
            placeholder="Notes for this check-in"
            rows={3}
          />
        )}
      </quickForm.AppField>

      <quickForm.Subscribe
        selector={(state) => state.errorMap as { onSubmit?: { form?: string } }}
      >
        {(errorMap) => <FieldError>{errorMap.onSubmit?.form}</FieldError>}
      </quickForm.Subscribe>
    </FieldGroup>
  );
}
