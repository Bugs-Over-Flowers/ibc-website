import type { useCreateManualMemberStep2 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep2";
import { FieldGroup } from "@/components/ui/field";

interface Step2RepresentativeProps {
  form: ReturnType<typeof useCreateManualMemberStep2>["form"];
}

export function Step2Representative({ form }: Step2RepresentativeProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Primary Representative</h3>
        <p className="text-muted-foreground text-sm">
          Provide details for the primary authorized representative
        </p>
      </div>

      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField
                label="First Name"
                placeholder="Enter first name"
              />
            )}
          </form.AppField>

          <form.AppField name="lastName">
            {(field) => (
              <field.TextField
                label="Last Name"
                placeholder="Enter last name"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="representativeEmailAddress">
          {(field) => (
            <field.TextField
              label="Email Address"
              placeholder="representative@example.com"
              type="email"
            />
          )}
        </form.AppField>

        <form.AppField name="companyDesignation">
          {(field) => (
            <field.TextField
              label="Position/Designation"
              placeholder="e.g. CEO, President"
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.AppField name="birthdate">
            {(field) => <field.FormDatePicker label="Birthdate" />}
          </form.AppField>

          <form.AppField name="sex">
            {(field) => (
              <field.SelectField
                label="Gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="nationality">
          {(field) => (
            <field.TextField label="Nationality" placeholder="e.g. Filipino" />
          )}
        </form.AppField>

        <form.AppField name="mailingAddress">
          {(field) => (
            <field.TextareaField
              label="Mailing Address"
              placeholder="Enter mailing address"
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <form.AppField name="representativeLandline">
            {(field) => <field.TextField label="Landline" />}
          </form.AppField>

          <form.AppField name="representativeMobileNumber">
            {(field) => <field.TextField label="Mobile Number" />}
          </form.AppField>

          <form.AppField name="representativeFaxNumber">
            {(field) => <field.TextField label="Telefax" />}
          </form.AppField>
        </div>

        <form.AppField name="companyMemberType">
          {(field) => (
            <field.SelectField
              label="Representative Type"
              options={[
                { label: "Principal", value: "principal" },
                { label: "Alternate", value: "alternate" },
              ]}
            />
          )}
        </form.AppField>
      </FieldGroup>
    </div>
  );
}
