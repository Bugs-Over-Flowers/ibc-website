"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import { UpdateMemberSchema } from "@/lib/validation/members/update";
import { updateMember } from "@/server/members/mutations/updateMember";

interface EditMemberFormProps {
  member: {
    memberId: string;
    applicationId: string;
    businessName: string;
    companyAddress: string;
    emailAddress: string;
    websiteURL?: string | null;
    landline: string;
    faxNumber?: string | null;
    mobileNumber?: string | null;
    sectorId: string;
    representatives: Array<{
      applicationMemberId: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
      mobileNumber: string;
      landline: string;
      mailingAddress: string;
      companyDesignation: string;
      companyMemberType: "principal" | "alternate";
      birthdate: string;
      nationality: string;
      sex: "male" | "female";
    }>;
    membershipStatus?: "paid" | "unpaid" | "cancelled" | null;
    joinDate?: string | null;
    membershipExpiryDate?: string | null;
  };
  sectors: { sectorId: number; sectorName: string }[];
}

const emptyRepresentative = (companyMemberType: "principal" | "alternate") => ({
  applicationMemberId: "",
  firstName: "",
  lastName: "",
  emailAddress: "",
  mobileNumber: "",
  landline: "",
  mailingAddress: "",
  companyDesignation: "",
  companyMemberType,
  birthdate: new Date(),
  nationality: "",
  sex: "male" as const,
});

function normalizeRepresentatives(
  representatives: EditMemberFormProps["member"]["representatives"],
) {
  const principal = representatives.find(
    (representative) => representative.companyMemberType === "principal",
  );
  const alternate = representatives.find(
    (representative) => representative.companyMemberType === "alternate",
  );

  return [
    principal
      ? {
          ...principal,
          birthdate: principal.birthdate
            ? new Date(principal.birthdate)
            : new Date(),
        }
      : emptyRepresentative("principal"),
    alternate
      ? {
          ...alternate,
          birthdate: alternate.birthdate
            ? new Date(alternate.birthdate)
            : new Date(),
        }
      : emptyRepresentative("alternate"),
  ];
}

export function EditMemberForm({ member, sectors }: EditMemberFormProps) {
  const router = useRouter();
  const representativeKeysRef = useRef(new WeakMap<object, string>());

  const defaultValues = {
    ...member,
    websiteURL: member.websiteURL ?? undefined,
    faxNumber: member.faxNumber ?? undefined,
    mobileNumber: member.mobileNumber ?? undefined,
    membershipStatus: member.membershipStatus ?? undefined,
    joinDate: member.joinDate ? new Date(member.joinDate) : undefined,
    membershipExpiryDate: member.membershipExpiryDate
      ? new Date(member.membershipExpiryDate)
      : undefined,
    representatives: normalizeRepresentatives(member.representatives),
  };

  const getRepresentativeKey = (representative: object) => {
    const existingKey = representativeKeysRef.current.get(representative);

    if (existingKey) {
      return existingKey;
    }

    const nextKey = crypto.randomUUID();
    representativeKeysRef.current.set(representative, nextKey);
    return nextKey;
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: zodValidator(UpdateMemberSchema),
    },
    onSubmit: async ({ value }) => {
      const parsedValues = UpdateMemberSchema.parse(value);
      const dataToSubmit = {
        ...parsedValues,
        // Ensure nulls are converted to undefined for the server action
        websiteURL: parsedValues.websiteURL || undefined,
        mobileNumber: parsedValues.mobileNumber || undefined,
        membershipStatus: (parsedValues.membershipStatus || undefined) as
          | "paid"
          | "unpaid"
          | "cancelled"
          | undefined,
        joinDate: parsedValues.joinDate
          ? new Date(parsedValues.joinDate)
          : undefined,
        membershipExpiryDate: parsedValues.membershipExpiryDate
          ? new Date(parsedValues.membershipExpiryDate)
          : undefined,
        representatives: parsedValues.representatives,
        memberId: parsedValues.memberId,
        applicationId: parsedValues.applicationId,
        businessName: parsedValues.businessName,
        companyAddress: parsedValues.companyAddress,
        emailAddress: parsedValues.emailAddress,
        landline: parsedValues.landline,
        sectorId: Number(parsedValues.sectorId),
      };

      const { error, success } = await tryCatch(updateMember(dataToSubmit));

      if (!success) {
        toast.error(error);
        return;
      }

      toast.success("Member details updated successfully");
      router.push(`/admin/members/${value.memberId}`); // Navigate back to details page
      router.refresh();
    },
  });

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Edit Member Details</h1>
        <p className="text-muted-foreground">
          Update the member and application information.
        </p>
      </div>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.AppField name="businessName">
            {(field) => <field.TextField label="Company Name" />}
          </form.AppField>

          <form.AppField name="sectorId">
            {(field) => (
              <field.SelectField
                label="Industry/Sector"
                options={sectors.map((s) => ({
                  label: s.sectorName,
                  value: s.sectorId.toString(),
                }))}
                placeholder="Select sector"
              />
            )}
          </form.AppField>

          <form.AppField name="companyAddress">
            {(field) => (
              <field.TextareaField
                className="md:col-span-2"
                label="Company Address"
              />
            )}
          </form.AppField>

          <form.AppField name="websiteURL">
            {(field) => (
              <field.TextField label="Website URL" placeholder="https://" />
            )}
          </form.AppField>

          <form.AppField name="emailAddress">
            {(field) => <field.TextField label="Email Address" type="email" />}
          </form.AppField>

          <form.AppField name="landline">
            {(field) => <field.TextField label="Landline" />}
          </form.AppField>

          <form.AppField name="mobileNumber">
            {(field) => <field.TextField label="Mobile Number" />}
          </form.AppField>

          <div className="mt-2 border-t pt-6 md:col-span-2">
            <h4 className="mb-4 font-medium text-muted-foreground text-sm uppercase">
              Applicant Representatives
            </h4>
          </div>

          <form.AppField mode="array" name="representatives">
            {(field) => {
              const principalRepresentative = field.state.value[0];
              const alternateRepresentative = field.state.value[1];

              if (!principalRepresentative || !alternateRepresentative) {
                return null;
              }

              const representatives = [
                {
                  keyRepresentative: principalRepresentative,
                  title: "Principal Member",
                  index: 0,
                },
                {
                  keyRepresentative: alternateRepresentative,
                  title: "Alternate Member",
                  index: 1,
                },
              ];

              return (
                <div className="space-y-5 sm:space-y-6 md:col-span-2">
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
                          </div>
                        </FieldGroup>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            }}
          </form.AppField>

          <div className="mt-2 border-t pt-6 md:col-span-2">
            <h4 className="mb-4 font-medium text-muted-foreground text-sm uppercase">
              Membership Details
            </h4>
          </div>

          <form.AppField name="membershipStatus">
            {(field) => (
              <field.SelectField
                label="Status"
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="joinDate">
            {(field) => <field.FormDatePicker label="Join Date" />}
          </form.AppField>

          <form.AppField name="membershipExpiryDate">
            {(field) => <field.FormDatePicker label="Expiry Date" />}
          </form.AppField>
        </div>

        <div className="flex items-center gap-4 border-t pt-4">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
