import type { useCreateManualMemberStep1 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep1";
import { FieldGroup } from "@/components/ui/field";

interface Step1CompanyProps {
  form: ReturnType<typeof useCreateManualMemberStep1>["form"];
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

export function Step1Company({ form, sectors }: Step1CompanyProps) {
  const sectorOptions = sectors.map((sector) => ({
    value: String(sector.sectorId),
    label: sector.sectorName,
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Company Information</h3>
        <p className="text-muted-foreground text-sm">
          Provide your company details below
        </p>
      </div>

      <FieldGroup>
        <form.AppField name="companyName">
          {(field) => (
            <field.TextField
              label="Company Name"
              placeholder="Enter your company name"
            />
          )}
        </form.AppField>

        <form.AppField name="sectorId">
          {(field) => (
            <field.SelectField
              label="Industry/Sector"
              options={sectorOptions}
              placeholder="Select industry"
            />
          )}
        </form.AppField>

        <form.AppField name="companyAddress">
          {(field) => (
            <field.TextareaField
              label="Company Address"
              placeholder="Enter complete business address"
            />
          )}
        </form.AppField>

        <form.AppField name="websiteURL">
          {(field) => (
            <field.TextField
              description="Enter your company's website or profile URL"
              label="Company Profile / Website"
              placeholder="https://www.example.com"
            />
          )}
        </form.AppField>

        <form.AppField name="emailAddress">
          {(field) => (
            <field.TextField
              description="We'll send confirmation to this email"
              label="Email Address"
              placeholder="company@example.com"
              type="email"
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <form.AppField name="landline">
            {(field) => <field.TextField label="Landline" />}
          </form.AppField>

          <form.AppField name="mobileNumber">
            {(field) => <field.TextField label="Mobile Number" />}
          </form.AppField>

          <form.AppField name="faxNumber">
            {(field) => <field.TextField label="Telefax" />}
          </form.AppField>
        </div>

        <form.AppField name="logoImageURL">
          {(field) => (
            <field.ImageField
              description="Upload your company logo image"
              label="Company Logo"
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.AppField name="applicationMemberType">
            {(field) => (
              <field.SelectField
                label="Application Member Type"
                options={[
                  { label: "Corporate", value: "corporate" },
                  { label: "Personal", value: "personal" },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="membershipStatus">
            {(field) => (
              <field.SelectField
                label="Initial Membership Status"
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            )}
          </form.AppField>
        </div>
      </FieldGroup>
    </div>
  );
}
