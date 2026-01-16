import type { useMembershipStep1 } from "@/app/membership/application/_hooks/useMembershipStep1";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
          {(field) => {
            const options: {
              value: MembershipApplicationStep1Schema["applicationType"];
              label: string;
              description: string;
            }[] = [
              {
                value: "newMember",
                label: "New Member",
                description: "First time joining",
              },
              {
                value: "renewal",
                label: "Renewal",
                description: "Renewing membership",
              },
              {
                value: "updating",
                label: "Update Info",
                description: "Updating details",
              },
            ];

            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {options.map((option) => (
                  <button
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-between rounded-md border-2 bg-popover p-4 transition-colors hover:bg-accent hover:text-accent-foreground",
                      field.state.value === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted",
                    )}
                    key={option.value}
                    onClick={() => field.handleChange(option.value)}
                    type="button"
                  >
                    <span className="font-semibold text-lg">
                      {option.label}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            );
          }}
        </form.AppField>
      </div>
    </div>
  );
}
