import { Building, UserCircle } from "lucide-react";
import { useEffect } from "react";
import { FieldSet } from "@/components/ui/field";
import useRegistrationStore from "@/hooks/registration.store";
import type { useRegistrationStep1 } from "../../../_hooks/useRegistrationStep1";
import SelectionCardGroup, {
  type SelectionCardOption,
} from "../_utils/SelectionCardGroup";

interface Step1MemberTypeSectionProps {
  form: ReturnType<typeof useRegistrationStep1>;
  membersOptions: Array<{ label: string; value: string }>;
}

export default function Step1MemberTypeSection({
  form,
  membersOptions,
}: Step1MemberTypeSectionProps) {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const normalizedEventType = eventDetails?.eventType?.toLowerCase();
  const isPrivateEvent = normalizedEventType === "private";
  const isPublicEvent = normalizedEventType === "public";

  useEffect(() => {
    if (!isPrivateEvent) {
      return;
    }

    if (form.getFieldValue("member") !== "member") {
      form.setFieldValue("member", "member");
    }

    if (form.getFieldValue("nonMemberName")) {
      form.setFieldValue("nonMemberName", "");
    }
  }, [form, isPrivateEvent]);

  const memberOption = {
    id: "member",
    value: "member",
    icon: Building,
    title: "Corporate Member",
    description: "I belong to a registered organization.",
  } satisfies SelectionCardOption<"member" | "nonmember">;

  const nonMemberOption = {
    id: "nonmember",
    value: "nonmember",
    icon: UserCircle,
    title: "Non-member",
    description: "I am registering independently.",
  } satisfies SelectionCardOption<"member" | "nonmember">;

  const memberTypeOptions = isPublicEvent
    ? [memberOption, nonMemberOption]
    : [memberOption];

  return (
    <form.AppField name="member">
      {(field) => (
        <FieldSet className="space-y-3">
          {isPrivateEvent ? (
            <form.AppField name="businessMemberId">
              {(field) => (
                <field.SingleComboBoxField
                  label="Select Organization"
                  options={membersOptions}
                  placeholder="Choose your organization"
                />
              )}
            </form.AppField>
          ) : (
            <>
              <SelectionCardGroup
                onValueChange={(value: "member" | "nonmember") =>
                  field.handleChange(value)
                }
                options={memberTypeOptions}
                value={field.state.value}
              />

              <div className="slide-in-from-top-2 fade-in mt-6 animate-in space-y-3 duration-300">
                {field.state.value === "member" ? (
                  <form.AppField name="businessMemberId">
                    {(field) => (
                      <field.SingleComboBoxField
                        label="Select Organization"
                        options={membersOptions}
                        placeholder="Choose your organization"
                      />
                    )}
                  </form.AppField>
                ) : isPublicEvent && field.state.value === "nonmember" ? (
                  <form.AppField name="nonMemberName">
                    {(field) => (
                      <field.TextField
                        label="Organization or Company Name"
                        placeholder="Acme Corp, Independent, etc."
                      />
                    )}
                  </form.AppField>
                ) : null}
              </div>
            </>
          )}
        </FieldSet>
      )}
    </form.AppField>
  );
}
