import { Building, Info } from "lucide-react";
import type { FormEvent } from "react";
import FormButtons from "@/components/FormButtons";
import { Card, CardContent } from "@/components/ui/card";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
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
  const form = useRegistrationStep1();

  const onNext = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  const membersOptions = members.map((m) => ({
    label: m.businessName,
    value: m.businessMemberId,
  }));

  return (
    <form className="space-y-6" onSubmit={onNext}>
      <RegistrationStepHeader
        description="Please identify your affiliation with the organization."
        Icon={Building}
        title="Organization Affiliation"
      />

      <MemberTypeSelection form={form} membersOptions={membersOptions} />

      {/* Help Note */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-muted-foreground">
          Can&apos;t find your organization? Please contact us for assistance.
        </p>
      </div>

      <FormButtons onBack={() => {}} onNext={onNext} />
    </form>
  );
};

export default Step1;

interface MemberTypeSelectionProps {
  form: ReturnType<typeof useRegistrationStep1>;
  membersOptions: Array<{ label: string; value: string }>;
}

function MemberTypeSelection({
  form,
  membersOptions,
}: MemberTypeSelectionProps) {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);

  return (
    <Card>
      <CardContent className="pt-6">
        <form.AppField name="member">
          {(field) => (
            <FieldSet className="space-y-4">
              <Label className="font-medium text-sm">Affiliation Type</Label>
              <RadioGroup
                onValueChange={(value) => field.handleChange(value)}
                value={field.state.value}
              >
                <div className="flex flex-row gap-4">
                  {/* Member Option Column */}
                  <div className="flex-1">
                    <FieldLabel
                      className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                      htmlFor="member"
                    >
                      <RadioGroupItem
                        className="mt-0.5"
                        id="member"
                        value="member"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          Member
                        </span>
                        <p className="mt-0.5 text-muted-foreground text-sm">
                          I am a member of the organization
                        </p>
                      </div>
                    </FieldLabel>
                  </div>
                  {/* Non-member Option Column */}
                  {eventDetails?.eventType === "public" && (
                    <div className="flex-1">
                      <FieldLabel
                        className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                        htmlFor="nonmember"
                      >
                        <RadioGroupItem
                          className="mt-0.5"
                          id="nonmember"
                          value="nonmember"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-foreground">
                            Non-member
                          </span>
                          <p className="mt-0.5 text-muted-foreground text-sm">
                            I am not a member of the organization
                          </p>
                        </div>
                      </FieldLabel>
                    </div>
                  )}
                </div>
              </RadioGroup>

              {/* Unified Field Below Columns */}
              <div className="mt-4 space-y-2 border-primary/30 border-l-2 pl-4">
                {field.state.value === "member" ? (
                  <form.AppField name="businessMemberId">
                    {(field) => (
                      <field.SingleComboBoxField
                        label="Select your organization"
                        options={membersOptions}
                        placeholder="Choose an organization"
                      />
                    )}
                  </form.AppField>
                ) : eventDetails?.eventType === "public" &&
                  field.state.value === "nonmember" ? (
                  <form.AppField name="nonMemberName">
                    {(field) => (
                      <field.TextField
                        label="Company / Organization Name"
                        placeholder="Enter your company or organization name"
                      />
                    )}
                  </form.AppField>
                ) : null}
              </div>

              {/* Private Event Notice */}
              {eventDetails?.eventType === "private" &&
                field.state.value === "nonmember" && (
                  <div className="text-destructive text-sm">
                    This is a private event. Only IBC members can attend.
                  </div>
                )}
            </FieldSet>
          )}
        </form.AppField>
      </CardContent>
    </Card>
  );
}
