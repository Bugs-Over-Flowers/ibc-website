import { Trash2, User, UserPlus } from "lucide-react";
import { useRef } from "react";
import type { useMembershipStep3 } from "@/app/membership/application/_hooks/useMembershipStep3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

interface StepProps {
  form: ReturnType<typeof useMembershipStep3>;
}

const EMPTY_ALTERNATE_REPRESENTATIVE = {
  companyMemberType: "alternate" as const,
  firstName: "",
  lastName: "",
  mailingAddress: "",
  sex: "male" as const,
  nationality: "",
  birthdate: undefined as unknown as Date,
  companyDesignation: "",
  landline: "",
  mobileNumber: "",
  emailAddress: "",
};

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
    <div className="space-y-8">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-bold text-primary text-sm uppercase tracking-wider">
          Representative Assignment
        </h3>
        <p className="mt-2 text-muted-foreground text-sm">
          The first representative is treated as the principal member. You may
          add more alternate representatives as needed.
        </p>
      </div>

      <form.AppField mode="array" name="representatives">
        {(field) => (
          <div className="space-y-6">
            {field.state.value.map((representative, index) => (
              <Card
                className="overflow-hidden rounded-xl border-border/50 bg-background shadow-sm"
                key={getRepresentativeKey(representative)}
              >
                <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 font-bold text-primary text-sm">
                      <User className="h-4 w-4" />
                      {index === 0
                        ? "Principal Member"
                        : `Alternate Member ${index}`}
                    </CardTitle>

                    {index > 1 && (
                      <Button
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => field.removeValue(index)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  <FieldGroup>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <form.AppField
                        name={`representatives[${index}].companyDesignation`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Position / Designation"
                            placeholder="e.g. President, Director"
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

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <form.AppField
                        name={`representatives[${index}].emailAddress`}
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
                        name={`representatives[${index}].mobileNumber`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Mobile Number"
                            onKeyDown={(e) => {
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
                                ((e.ctrlKey || e.metaKey) &&
                                  ["a", "c", "v", "x"].includes(e.key))
                              ) {
                                return;
                              }

                              if (!/[0-9+]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="+639######### or 09#########"
                          />
                        )}
                      </form.AppField>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                    <form.AppField name={`representatives[${index}].landline`}>
                      {(subField) => (
                        <subField.TextField
                          label="Landline"
                          onKeyDown={(e) => {
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
                              ((e.ctrlKey || e.metaKey) &&
                                ["a", "c", "v", "x"].includes(e.key))
                            ) {
                              return;
                            }

                            if (!/[0-9()\-\s]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          placeholder="(033) XXX-XXXX"
                        />
                      )}
                    </form.AppField>
                  </FieldGroup>
                </CardContent>
              </Card>
            ))}

            <Button
              className="h-12 w-full rounded-xl border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => field.pushValue(EMPTY_ALTERNATE_REPRESENTATIVE)}
              type="button"
              variant="outline"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Alternate Representative
            </Button>
          </div>
        )}
      </form.AppField>
    </div>
  );
}
