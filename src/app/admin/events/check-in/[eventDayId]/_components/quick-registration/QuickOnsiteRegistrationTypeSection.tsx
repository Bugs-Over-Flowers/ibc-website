"use client";

import { Building, UserCircle } from "lucide-react";
import type useQuickRegistration from "@/app/admin/events/check-in/[eventDayId]/_hooks/useQuickRegistration";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface QuickOnsiteRegistrationTypeSectionProps {
  memberOptions: Array<{ label: string; value: string }>;
  quickForm: ReturnType<typeof useQuickRegistration>;
}

export default function QuickOnsiteRegistrationTypeSection({
  memberOptions,
  quickForm,
}: QuickOnsiteRegistrationTypeSectionProps) {
  return (
    <FieldGroup>
      <div className="space-y-1">
        <p className="font-semibold text-foreground text-sm">
          Registration Type
        </p>
        <p className="text-muted-foreground text-xs">
          Choose whether this attendee is linked to a member organization.
        </p>
      </div>

      <quickForm.AppField name="member">
        {(field) => (
          <RadioGroup
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            onValueChange={(value) => {
              field.handleChange(value);

              if (value === "member") {
                quickForm.setFieldValue("nonMemberName", "");
              } else {
                quickForm.setFieldValue("businessMemberId", "");
              }
            }}
            value={field.state.value}
          >
            {[
              {
                id: "member",
                value: "member",
                icon: Building,
                title: "Corporate Member",
                description: "Belongs to a registered organization",
              },
              {
                id: "nonmember",
                value: "nonmember",
                icon: UserCircle,
                title: "Non-member",
                description: "Independent or walk-in attendee",
              },
            ].map((option) => {
              const Icon = option.icon;
              const isActive = field.state.value === option.value;

              return (
                <div key={option.id}>
                  <Label
                    className={cn(
                      "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-border bg-transparent px-4 py-3 text-center transition-all",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/40 hover:bg-muted/30",
                    )}
                    htmlFor={option.id}
                  >
                    <RadioGroupItem
                      className="sr-only"
                      id={option.id}
                      value={option.value}
                    />
                    <span
                      className={cn(
                        "mb-1 flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : null,
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="font-semibold text-sm">
                      {option.title}
                    </span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {option.description}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      </quickForm.AppField>

      <quickForm.Subscribe selector={(state) => state.values.member}>
        {(member) =>
          member === "member" ? (
            <quickForm.AppField name="businessMemberId">
              {(field) => (
                <field.SingleComboBoxField
                  label="Select organization"
                  options={memberOptions}
                  placeholder="Choose your organization"
                />
              )}
            </quickForm.AppField>
          ) : (
            <quickForm.AppField name="nonMemberName">
              {(field) => (
                <field.TextField
                  label="Organization or Company"
                  placeholder="Acme Corp, Independent, etc."
                />
              )}
            </quickForm.AppField>
          )
        }
      </quickForm.Subscribe>
    </FieldGroup>
  );
}
