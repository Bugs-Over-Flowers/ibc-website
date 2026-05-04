import { Plus, User, X } from "lucide-react";
import { useRef } from "react";
import type { useMembershipStep3 } from "@/app/membership/application/_hooks/useMembershipStep3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { preventInvalidKeyDown } from "@/lib/keyboard";

interface StepProps {
  form: ReturnType<typeof useMembershipStep3>;
}

export function Step3Representatives({ form }: StepProps) {
  const representativeKeysRef = useRef(new WeakMap<object, string>());

  const getRepresentativeKey = (representative: object) => {
    const existingKey = representativeKeysRef.current.get(representative);

    if (existingKey) {
      return existingKey;
    }

    const nextKey = crypto.randomUUID();
    representativeKeysRef.current.set(representative, nextKey);
    return nextKey;
  };

  return (
    <div className="space-y-6">
      <form.AppField mode="array" name="representatives">
        {(field) => {
          const principalRepresentative = field.state.value[0];
          const hasAlternate = field.state.value.length > 1;
          const alternateRepresentative = hasAlternate
            ? field.state.value[1]
            : null;

          if (!principalRepresentative) {
            return null;
          }

          const representatives = [
            {
              keyRepresentative: principalRepresentative,
              title: "Principal Member",
              index: 0,
            },
          ];

          const addAlternate = () => {
            field.pushValue({
              companyMemberType: "alternate",
              firstName: "",
              lastName: "",
              mailingAddress: "",
              sex: "male",
              nationality: "",
              birthdate: undefined as unknown as Date,
              companyDesignation: "",
              landline: "",
              mobileNumber: "",
              emailAddress: "",
            });
          };

          const removeAlternate = () => {
            if (field.state.value.length > 1) {
              field.removeValue(1);
            }
          };

          return (
            <div className="space-y-5 sm:space-y-6">
              {representatives.map((representativeMeta) => (
                <Card
                  className="gap-0 overflow-hidden rounded-xl border-border/50 bg-background shadow-sm"
                  key={getRepresentativeKey(
                    representativeMeta.keyRepresentative,
                  )}
                >
                  <div className="border-b px-5 py-4 pt-0 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <CardTitle className="flex min-w-0 items-center gap-2 font-bold text-base text-primary leading-snug">
                        <User className="h-4 w-4" />
                        {representativeMeta.title}
                      </CardTitle>
                    </div>
                  </div>

                  <CardContent className="p-5 sm:p-6">
                    <FieldGroup className="gap-3">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField
                          name={`representatives[${representativeMeta.index}].firstName`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="First Name"
                              placeholder="Enter first name"
                            />
                          )}
                        </form.AppField>

                        <form.AppField
                          name={`representatives[${representativeMeta.index}].lastName`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Last Name"
                              placeholder="Enter last name"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField
                          name={`representatives[${representativeMeta.index}].companyDesignation`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Position / Designation"
                              placeholder="e.g. President, Director"
                            />
                          )}
                        </form.AppField>

                        <form.AppField
                          name={`representatives[${representativeMeta.index}].birthdate`}
                        >
                          {(subField) => (
                            <subField.FormDatePicker label="Birthdate" />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField
                          name={`representatives[${representativeMeta.index}].emailAddress`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Email Address"
                              placeholder="name@example.com"
                              type="email"
                            />
                          )}
                        </form.AppField>

                        <form.AppField
                          name={`representatives[${representativeMeta.index}].mobileNumber`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Mobile Number"
                              onKeyDown={(e) =>
                                preventInvalidKeyDown(e, /[0-9+]/)
                              }
                              placeholder="+639XXXXXXXX or 09XXXXXXXXX"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField
                          name={`representatives[${representativeMeta.index}].sex`}
                        >
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
                          name={`representatives[${representativeMeta.index}].nationality`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Nationality"
                              placeholder="e.g. Filipino"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField
                          name={`representatives[${representativeMeta.index}].mailingAddress`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Mailing Address"
                              placeholder="Enter mailing address"
                            />
                          )}
                        </form.AppField>

                        <form.AppField
                          name={`representatives[${representativeMeta.index}].landline`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Landline"
                              onKeyDown={(e) =>
                                preventInvalidKeyDown(e, /[0-9()\-\s]/)
                              }
                              placeholder="(033) XXX-XXXX"
                            />
                          )}
                        </form.AppField>
                      </div>
                    </FieldGroup>
                  </CardContent>
                </Card>
              ))}

              {hasAlternate ? (
                <Card className="gap-0 overflow-hidden rounded-xl border-border/50 bg-background shadow-sm">
                  <div className="border-b px-5 py-4 pt-0 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <CardTitle className="flex min-w-0 items-center gap-2 font-bold text-base text-primary leading-snug">
                        <User className="h-4 w-4" />
                        Alternate Member
                        <span className="font-normal text-muted-foreground text-xs">
                          (optional)
                        </span>
                      </CardTitle>
                      <Button
                        className="h-8"
                        onClick={removeAlternate}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-5 sm:p-6">
                    <FieldGroup className="gap-3">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField name="representatives[1].firstName">
                          {(subField) => (
                            <subField.TextField
                              label="First Name"
                              placeholder="Enter first name"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="representatives[1].lastName">
                          {(subField) => (
                            <subField.TextField
                              label="Last Name"
                              placeholder="Enter last name"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField name="representatives[1].companyDesignation">
                          {(subField) => (
                            <subField.TextField
                              label="Position / Designation"
                              placeholder="e.g. President, Director"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="representatives[1].birthdate">
                          {(subField) => (
                            <subField.FormDatePicker label="Birthdate" />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField name="representatives[1].emailAddress">
                          {(subField) => (
                            <subField.TextField
                              label="Email Address"
                              placeholder="name@example.com"
                              type="email"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="representatives[1].mobileNumber">
                          {(subField) => (
                            <subField.TextField
                              label="Mobile Number"
                              onKeyDown={(e) =>
                                preventInvalidKeyDown(e, /[0-9+]/)
                              }
                              placeholder="+639XXXXXXXX or 09XXXXXXXXX"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField name="representatives[1].sex">
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

                        <form.AppField name="representatives[1].nationality">
                          {(subField) => (
                            <subField.TextField
                              label="Nationality"
                              placeholder="e.g. Filipino"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                        <form.AppField name="representatives[1].mailingAddress">
                          {(subField) => (
                            <subField.TextField
                              label="Mailing Address"
                              placeholder="Enter mailing address"
                            />
                          )}
                        </form.AppField>

                        <form.AppField name="representatives[1].landline">
                          {(subField) => (
                            <subField.TextField
                              label="Landline"
                              onKeyDown={(e) =>
                                preventInvalidKeyDown(e, /[0-9()\-\s]/)
                              }
                              placeholder="(033) XXX-XXXX"
                            />
                          )}
                        </form.AppField>
                      </div>
                    </FieldGroup>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  className="w-full border-dashed"
                  onClick={addAlternate}
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Alternate Representative (optional)
                </Button>
              )}
            </div>
          );
        }}
      </form.AppField>
    </div>
  );
}
