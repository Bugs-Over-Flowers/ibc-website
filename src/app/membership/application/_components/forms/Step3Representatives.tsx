import { User } from "lucide-react";
import type { useMembershipStep3 } from "@/app/membership/application/_hooks/useMembershipStep3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

interface StepProps {
  form: ReturnType<typeof useMembershipStep3>;
}

export function Step3Representatives({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Authorized Representatives</h3>
        <p className="text-muted-foreground text-sm">
          Provide details for your company representatives
        </p>
      </div>

      <form.AppField mode="array" name="representatives">
        {(field) => (
          <div className="space-y-6">
            {field.state.value.map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Index is used as key because items don't have stable IDs yet
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-semibold text-base text-primary">
                    <User className="size-4" />
                    {index === 0 ? "Principal Member" : "Alternate Member"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <FieldGroup>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <form.AppField
                        name={`representatives[${index}].firstName`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="First Name"
                            placeholder="Enter first name"
                          />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`representatives[${index}].lastName`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Last Name"
                            placeholder="Enter last name"
                          />
                        )}
                      </form.AppField>
                    </div>

                    <form.AppField
                      name={`representatives[${index}].emailAddress`}
                    >
                      {(subField) => (
                        <subField.TextField
                          label="Email Address"
                          placeholder={
                            index === 0
                              ? "principal@example.com"
                              : "alternate@example.com"
                          }
                          type="email"
                        />
                      )}
                    </form.AppField>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <form.AppField
                        name={`representatives[${index}].companyDesignation`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Position"
                            placeholder={
                              index === 0
                                ? "e.g. CEO, President"
                                : "e.g. CFO, Director"
                            }
                          />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`representatives[${index}].birthdate`}
                      >
                        {(subField) => (
                          <subField.FormDatePicker label="Birthdate" />
                        )}
                      </form.AppField>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <form.AppField name={`representatives[${index}].sex`}>
                        {(subField) => (
                          <subField.RadioGroupField
                            label="Gender"
                            options={[
                              { value: "male", label: "Male" },
                              { value: "female", label: "Female" },
                            ]}
                          />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`representatives[${index}].nationality`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Nationality"
                            placeholder="e.g. Filipino"
                          />
                        )}
                      </form.AppField>
                    </div>

                    <form.AppField
                      name={`representatives[${index}].mailingAddress`}
                    >
                      {(subField) => (
                        <subField.TextField
                          label="Mailing Address"
                          placeholder="Enter mailing address"
                        />
                      )}
                    </form.AppField>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <form.AppField
                        name={`representatives[${index}].landline`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Landline"
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter, home, end, arrows
                              if (
                                [
                                  "Backspace",
                                  "Delete",
                                  "Tab",
                                  "Escape",
                                  "Enter",
                                  "Home",
                                  "End",
                                  "ArrowLeft",
                                  "ArrowRight",
                                ].includes(e.key) ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                ((e.ctrlKey || e.metaKey) &&
                                  ["a", "c", "v", "x"].includes(e.key))
                              ) {
                                return;
                              }
                              // Block if not a number or allowed special characters
                              if (!/[0-9()\-\s]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="(033) XXX-XXXX"
                          />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`representatives[${index}].faxNumber`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Telefax"
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter, home, end, arrows
                              if (
                                [
                                  "Backspace",
                                  "Delete",
                                  "Tab",
                                  "Escape",
                                  "Enter",
                                  "Home",
                                  "End",
                                  "ArrowLeft",
                                  "ArrowRight",
                                ].includes(e.key) ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                ((e.ctrlKey || e.metaKey) &&
                                  ["a", "c", "v", "x"].includes(e.key))
                              ) {
                                return;
                              }
                              // Block if not a number or hyphen
                              if (!/[0-9-]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="XXXX-XXXX"
                          />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`representatives[${index}].mobileNumber`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Mobile Number"
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter, home, end, arrows
                              if (
                                [
                                  "Backspace",
                                  "Delete",
                                  "Tab",
                                  "Escape",
                                  "Enter",
                                  "Home",
                                  "End",
                                  "ArrowLeft",
                                  "ArrowRight",
                                ].includes(e.key) ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                ((e.ctrlKey || e.metaKey) &&
                                  ["a", "c", "v", "x"].includes(e.key))
                              ) {
                                return;
                              }
                              // Block if not a number or plus sign
                              if (!/[0-9+]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="09XXXXXXXXX"
                          />
                        )}
                      </form.AppField>
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </form.AppField>
    </div>
  );
}
