import { Building, CircleAlert } from "lucide-react";
import { type FormEvent, useMemo } from "react";
import FormButtons from "@/components/FormButtons";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep1 } from "@/hooks/useRegistrationStep1";
import { MemberTypeEnum } from "@/lib/validation/utils";
import type { getAllMembers } from "@/server/members/queries";

interface Step1Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

const Step1 = ({ members }: Step1Props) => {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const form = useRegistrationStep1();

  const onNext = async (e?: FormEvent) => {
    // Implement next button logic here
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  const membersOptions = useMemo(
    () =>
      members.map((m) => ({
        label: m.businessName,
        value: m.businessMemberId,
      })),
    [members],
  );

  const memberName = useMemo(() => {
    const values = form.state.values;
    if (values.member === "member") {
      return members.find((m) => m.businessMemberId === values.businessMemberId)
        ?.businessName;
    }
    return "";
  }, [members, form.state.values]);

  return (
    <form className="space-y-3" onSubmit={onNext}>
      {/* Step 1 Title */}
      <Item>
        <ItemContent>
          <div className="flex items-center gap-2">
            <Building size={18} />
            <ItemTitle>Affiliation</ItemTitle>
          </div>
          <ItemDescription>
            Please identify your affiliation with the organization.
          </ItemDescription>
        </ItemContent>
      </Item>

      <Card>
        <CardContent>
          <form.AppField name="member">
            {(field) => (
              <FieldSet>
                <RadioGroup
                  defaultValue="member"
                  onValueChange={(value) => {
                    const parsedMemberValue = MemberTypeEnum.safeParse(value);

                    console.log(parsedMemberValue);
                    if (!parsedMemberValue.success) return;
                    if (parsedMemberValue.data === "member") {
                      form.setFieldValue("businessMemberId", "");
                    } else if (parsedMemberValue.data === "nonmember") {
                      form.setFieldValue("nonMemberName", "");
                    }

                    console.log(parsedMemberValue.data);

                    field.handleChange(parsedMemberValue.data);
                  }}
                  value={field.state.value}
                >
                  {/* Member Select */}
                  <FieldLabel htmlFor="member">
                    <Field orientation={"horizontal"}>
                      <FieldContent>
                        <FieldTitle>Member</FieldTitle>
                        <FieldDescription>
                          I am a member of IBC.
                        </FieldDescription>
                        {field.state.value === "member" && (
                          <form.AppField name="businessMemberId">
                            {(field) => (
                              <field.SelectField
                                options={membersOptions}
                                placeholder={
                                  memberName !== ""
                                    ? memberName
                                    : "Select Member"
                                }
                              />
                            )}
                          </form.AppField>
                        )}
                      </FieldContent>
                      <RadioGroupItem
                        id="member"
                        value="member"
                        variant={"noIcon"}
                      />
                    </Field>
                  </FieldLabel>

                  {/* Nonmember Select*/}
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
                            <form.AppField name="nonMemberName">
                              {(field) => (
                                <field.TextField
                                  label="Affiliation"
                                  placeholder="Enter your Organization / Company Name"
                                />
                              )}
                            </form.AppField>
                          )}
                      </FieldContent>
                      {eventDetails?.eventType === "public" && (
                        <RadioGroupItem
                          id="nonmember"
                          value="nonmember"
                          variant={"noIcon"}
                        />
                      )}
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FieldSet>
            )}
          </form.AppField>
        </CardContent>
      </Card>

      <Item variant={"outline"}>
        <ItemMedia>
          <CircleAlert />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Note</ItemTitle>
          <ItemDescription>
            In case you can&apos;t find your organization / business /
            affiliation, please contact us.
          </ItemDescription>
        </ItemContent>
      </Item>

      <FormButtons
        onBack={() => {
          console.log("No Back button for step 1");
        }}
        onNext={onNext}
      />
    </form>
  );
};

export default Step1;
