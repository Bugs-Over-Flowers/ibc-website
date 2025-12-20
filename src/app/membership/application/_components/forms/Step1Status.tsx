import type { useMembershipStep1 } from "@/app/membership/application/_hooks/useMembershipStep1";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { MembershipApplicationStep1Schema } from "@/lib/validation/membership/application";

interface StepProps {
  form: ReturnType<typeof useMembershipStep1>;
}

export function Step1Status({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-blue-50 p-4 text-blue-900">
        <h3 className="mb-2 flex items-center gap-2 font-semibold">
          ℹ️ Membership Guidelines
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            All new or renewed memberships shall be dated on the first day of
            the month during which the membership fee was paid.
          </li>
          <li>
            Memberships are by invitation, but may be proposed by any member,
            subject to endorsement by the Membership Committee and Board
            approval.
          </li>
          <li>
            Corporate members may request representation changes in case of
            re-assignment or death of the primary member.
          </li>
          <li>
            No refund will be given if membership is terminated before the next
            anniversary date.
          </li>
        </ul>
        <p className="mt-4 text-blue-700 text-xs">
          By proceeding, you consent to the collection and processing of your
          personal information in accordance with Republic Act No. 10173 (Data
          Privacy Act of 2012).
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Select Membership Status *</Label>
        <form.AppField name="applicationType">
          {(field) => (
            <RadioGroup
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              onValueChange={(
                val: MembershipApplicationStep1Schema["applicationType"],
              ) => field.handleChange(val)}
              value={field.state.value}
            >
              <div>
                <RadioGroupItem
                  className="peer sr-only"
                  id="newMember"
                  value="newMember"
                />
                <Label
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  htmlFor="newMember"
                >
                  <span className="font-semibold text-lg">New Member</span>
                  <span className="text-muted-foreground text-sm">
                    First time joining
                  </span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  className="peer sr-only"
                  id="renewal"
                  value="renewal"
                />
                <Label
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  htmlFor="renewal"
                >
                  <span className="font-semibold text-lg">Renewal</span>
                  <span className="text-muted-foreground text-sm">
                    Renewing membership
                  </span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  className="peer sr-only"
                  id="updating"
                  value="updating"
                />
                <Label
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  htmlFor="updating"
                >
                  <span className="font-semibold text-lg">Update Info</span>
                  <span className="text-muted-foreground text-sm">
                    Updating details
                  </span>
                </Label>
              </div>
            </RadioGroup>
          )}
        </form.AppField>
      </div>
    </div>
  );
}
