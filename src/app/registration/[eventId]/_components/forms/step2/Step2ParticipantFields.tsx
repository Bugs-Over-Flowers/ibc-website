import { Label } from "@/components/ui/label";
import type { StandardRegistrationStep2Schema } from "@/lib/validation/registration/standard";
import type { useRegistrationStep2 } from "../../../_hooks/useRegistrationStep2";

export type Step2FieldName =
  | `registrant.${keyof StandardRegistrationStep2Schema["registrant"]}`
  | `otherParticipants[${number}].${keyof NonNullable<StandardRegistrationStep2Schema["otherParticipants"]>[number]}`;

interface ParticipantFieldsProps {
  form: ReturnType<typeof useRegistrationStep2>;
  index?: number;
}

export function ParticipantFields({ form, index }: ParticipantFieldsProps) {
  const prefix =
    index === undefined ? "registrant" : `otherParticipants[${index}]`;

  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="grid gap-6 sm:grid-cols-2">
        <form.AppField name={`${prefix}.firstName` as Step2FieldName}>
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm">
                First Name <span className="text-destructive">*</span>
              </Label>
              <field.TextField className="h-11 rounded-xl" placeholder="Juan" />
            </div>
          )}
        </form.AppField>
        <form.AppField name={`${prefix}.lastName` as Step2FieldName}>
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <field.TextField
                className="h-11 rounded-xl"
                placeholder="Dela Cruz"
              />
            </div>
          )}
        </form.AppField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <form.AppField name={`${prefix}.email` as Step2FieldName}>
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm">Email Address</Label>
              <field.TextField
                className="h-11 rounded-xl"
                placeholder="juan.delacruz@example.com"
                type="email"
              />
            </div>
          )}
        </form.AppField>

        <form.AppField name={`${prefix}.contactNumber` as Step2FieldName}>
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm">
                Contact Number / Telephone Number
              </Label>
              <field.TextField
                className="h-11 rounded-xl"
                placeholder="09XXXXXXXXX / 0XXXX-XXXX"
              />
            </div>
          )}
        </form.AppField>
      </div>
    </div>
  );
}
