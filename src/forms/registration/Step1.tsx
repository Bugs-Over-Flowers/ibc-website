import { type FormEvent, useMemo } from "react";
import FormButtons from "@/components/FormButtons";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep1 } from "@/hooks/useRegistrationStep1";
import { StandardRegistrationStep1Schema } from "@/lib/validation/registration/standard";
import type { getAllMembers } from "@/server/members/queries";

interface Step1Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

const Step1 = ({ members }: Step1Props) => {
  const eventDetails = useRegistrationStore((s) => s.eventDetails);
  const f = useRegistrationStep1();

  const onBack = async () => {
    // Implement back button logic here
    f.handleSubmit({ nextStep: false });
  };

  const onNext = async (e?: FormEvent) => {
    // Implement next button logic here
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    f.handleSubmit({ nextStep: true });
  };

  const membersOptions = useMemo(
    () =>
      members.map((m) => ({
        label: m.businessName,
        value: m.businessMemberId,
      })),
    [members],
  );

  const memberName = members.find(
    (m) => m.businessMemberId === f.state.values.businessMemberId,
  )?.businessName;

  return (
    <form onSubmit={onNext} className="space-y-3">
      <FieldGroup>
        <f.AppField name="member">
          {(field) => (
            <FieldSet>
              <FieldTitle>
                <h3>Affiliation</h3>
              </FieldTitle>
              <FieldDescription>Are you a member of IBC?</FieldDescription>
              <RadioGroup
                defaultValue="member"
                value={field.state.value}
                onValueChange={(value) => {
                  const result =
                    StandardRegistrationStep1Schema.shape.member.safeParse(
                      value,
                    );

                  if (!result.success) {
                    return;
                  }

                  field.handleChange(result.data);
                }}
              >
                <FieldLabel htmlFor="member">
                  <Field orientation={"horizontal"}>
                    <FieldContent>
                      <FieldTitle>Member</FieldTitle>
                      <FieldDescription>I am a member of IBC.</FieldDescription>
                      {field.state.value === "member" && (
                        <f.AppField name="businessMemberId">
                          {(field) => (
                            <field.SelectField
                              placeholder={memberName ?? "Select Member"}
                              options={membersOptions}
                            />
                          )}
                        </f.AppField>
                      )}
                    </FieldContent>
                    <RadioGroupItem
                      value="member"
                      id="member"
                      variant={"noIcon"}
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="nonmember">
                  <Field orientation={"horizontal"}>
                    <FieldContent>
                      <FieldTitle>Non-member</FieldTitle>
                      <FieldDescription>
                        I am not a member of IBC.
                      </FieldDescription>
                      {eventDetails?.eventType === "private" && (
                        <FieldDescription>
                          This event is private only. Only members of IBC are
                          allowed to attend this event.
                        </FieldDescription>
                      )}
                      {field.state.value === "nonmember" &&
                        eventDetails?.eventType === "public" && (
                          <f.AppField name="nonMemberName">
                            {(field) => (
                              <field.TextField
                                placeholder="Enter your Organization / Company Name"
                                label="Affiliation"
                              />
                            )}
                          </f.AppField>
                        )}
                    </FieldContent>
                    {eventDetails?.eventType === "public" && (
                      <RadioGroupItem
                        value="nonmember"
                        id="nonmember"
                        variant={"noIcon"}
                      />
                    )}
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </FieldSet>
          )}
        </f.AppField>
      </FieldGroup>
      <FormButtons onBack={onBack} onNext={onNext} />
    </form>
  );
};

export default Step1;
