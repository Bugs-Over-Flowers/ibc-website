"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    membershipStatus?: "paid" | "unpaid" | "cancelled" | null;
    joinDate?: string | null;
    membershipExpiryDate?: string | null;
  };
  sectors: { sectorId: number; sectorName: string }[];
}

export function EditMemberForm({ member, sectors }: EditMemberFormProps) {
  const router = useRouter();

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
