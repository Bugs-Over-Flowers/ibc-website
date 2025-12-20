import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { useMembershipStep2 } from "@/app/membership/application/_hooks/useMembershipStep2";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Dropzone,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

interface StepProps {
  form: ReturnType<typeof useMembershipStep2>;
}

// Mock sectors - replace with DB fetch if available
const sectors = [
  { value: "1", label: "Technology" },
  { value: "2", label: "Finance" },
  { value: "3", label: "Manufacturing" },
  { value: "4", label: "Retail" },
  { value: "5", label: "Services" },
];

export function Step2Company({ form }: StepProps) {
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
              options={sectors}
              placeholder="Select industry"
            />
          )}
        </form.AppField>

        <form.AppField name="companyAddress">
          {(field) => (
            <field.TextField
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
            {(field) => (
              <field.TextField label="Landline" placeholder="(033) XXX-XXXX" />
            )}
          </form.AppField>

          <form.AppField name="faxNumber">
            {(field) => (
              <field.TextField label="Telefax" placeholder="XXXX-XXXX" />
            )}
          </form.AppField>

          <form.AppField name="mobileNumber">
            {(field) => (
              <field.TextField
                label="Mobile Number"
                placeholder="+63XXXXXXXXX"
              />
            )}
          </form.AppField>
        </div>

        <form.Subscribe selector={(state) => state.values.logoImageURL}>
          {(logoImageURL) => (
            <form.AppField name="logoImage">
              {(field) => (
                <Field className="space-y-2">
                  <Label>Company Logo *</Label>
                  <div className="rounded-lg border bg-background p-4">
                    {field.state.value ? (
                      <div className="flex items-center justify-between rounded border bg-muted/20 p-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileIcon className="h-4 w-4 shrink-0" />
                          <span className="max-w-[200px] truncate text-sm">
                            {field.state.value.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({(field.state.value.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          className="h-8 w-8"
                          onClick={() => field.handleChange(undefined)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : logoImageURL ? (
                      <div className="flex items-center justify-between rounded border bg-muted/20 p-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Image
                            alt="Logo"
                            className="h-8 w-8 object-contain"
                            height={32}
                            src={logoImageURL}
                            width={32}
                          />
                          <span className="max-w-[200px] truncate text-sm">
                            Current Logo
                          </span>
                        </div>
                        <Button
                          className="h-8 w-8"
                          onClick={() => {
                            form.setFieldValue("logoImageURL", "");
                          }}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Dropzone
                        accept={{
                          "image/*": [".png", ".jpg", ".jpeg"],
                        }}
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024}
                        onDrop={(acceptedFiles, fileRejections) => {
                          if (acceptedFiles.length > 0) {
                            field.handleChange(acceptedFiles[0]);
                          }

                          if (fileRejections.length > 0) {
                            const error = fileRejections[0].errors[0];
                            if (error.code === "file-too-large") {
                              toast.error("File size must be less than 5MB");
                            } else {
                              toast.error("Invalid file");
                            }
                          }
                        }}
                      >
                        <DropzoneEmptyState />
                      </Dropzone>
                    )}
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.AppField>
          )}
        </form.Subscribe>
      </FieldGroup>
    </div>
  );
}
