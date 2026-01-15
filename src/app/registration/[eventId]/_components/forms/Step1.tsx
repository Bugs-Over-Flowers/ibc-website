import { Building, CircleAlert } from "lucide-react";
import type { FormEvent } from "react";
import FormButtons from "@/components/FormButtons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { MemberTypeEnum } from "@/lib/validation/utils";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import { useRegistrationStep1 } from "../../_hooks/useRegistrationStep1";
import RegistrationStepHeader from "./RegistrationStepHeader";

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

  // Prepare member options for select field
  const membersOptions = members.map((m) => ({
    label: m.businessName,
    value: m.businessMemberId,
  }));

  return (
    <form className="space-y-3" onSubmit={onNext}>
      {/* Step 1 Title */}
      <RegistrationStepHeader
        description="Please identify your affiliation with the organization."
        Icon={Building}
        title="Affiliation"
      />
      <Card>
        <CardContent>
          {/* Member or Non-member selection */}
          <form.AppField name="member">
            {(field) => (
              <FieldSet>
                <RadioGroup
                  defaultValue="member"
                  onValueChange={(value) => {
                    // Handle parsing and updating form state
                    // Validate value against MemberTypeEnum
                    // If invalid, do nothing
                    const parsedMemberValue = MemberTypeEnum.safeParse(value);

                    if (!parsedMemberValue.success) return;

                    // Clear form-level error map when switching member type
                    form.setErrorMap({});

                    if (parsedMemberValue.data === "member") {
                      form.setFieldValue("nonMemberName", "");
                    } else if (parsedMemberValue.data === "nonmember") {
                      form.setFieldValue("businessMemberId", "");
                    }

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
                            {/* {(field) => (
                              <field.SelectField
                                options={membersOptions}
                                placeholder="Select your Company"
                              />
                            )} */}

                            {(field) => (
                              <field.SingleComboBoxField
                                options={membersOptions}
                                placeholder="Select your Company"
                              />
                            )}
                          </form.AppField>
                        )}
                      </FieldContent>
                      <RadioGroupItem id="member" value="member" />
                    </Field>
                  </FieldLabel>

                  {/* Nonmember Select */}
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
                        <RadioGroupItem id="nonmember" value="nonmember" />
                      )}
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FieldSet>
            )}
          </form.AppField>
        </CardContent>
      </Card>

      {/* <Item variant={"outline"}>
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
      </Item> */}

      <Alert>
        <CircleAlert />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          In case you can&apos;t find your organization / business /
          affiliation, please contact us.
        </AlertDescription>
      </Alert>

      <FormButtons
        onBack={() => {
          // No back button for step 1 (first step)
        }}
        onNext={onNext}
      />
    </form>
  );
};

export default Step1;
