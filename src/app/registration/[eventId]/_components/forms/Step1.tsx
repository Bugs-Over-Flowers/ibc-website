import { ArrowRight, Building, CheckCircle2, UserCircle } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import { useRegistrationStep1 } from "../../_hooks/useRegistrationStep1";

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
    <form onSubmit={onNext}>
      <Card className="w-full overflow-hidden rounded-2xl border-border bg-card/10 shadow-md ring-0">
        <CardHeader className="border-border/50 border-b bg-card/10 pb-6">
          <CardTitle className="flex items-center gap-2 font-semibold text-2xl">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Member Verification
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Please identify your affiliation with the organization.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          <MemberTypeSelection form={form} membersOptions={membersOptions} />

          <div className="flex justify-end border-border/50 border-t pt-6">
            <Button
              className="rounded-xl px-8 shadow-md"
              size="lg"
              type="submit"
            >
              Continue to Participants
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
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
    <form.AppField name="member">
      {(field) => (
        <FieldSet className="space-y-3">
          <RadioGroup
            className="space-y-0"
            onValueChange={(value) => field.handleChange(value)}
            value={field.state.value}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  id: "member",
                  value: "member",
                  icon: Building,
                  title: "Corporate Member",
                  description: "I belong to a registered organization.",
                  show: true,
                },
                {
                  id: "nonmember",
                  value: "nonmember",
                  icon: UserCircle,
                  title: "Non-member",
                  description: "I am registering independently.",
                  show: eventDetails?.eventType === "public",
                },
              ]
                .filter((option) => option.show)
                .map((option) => {
                  const Icon = option.icon;
                  return (
                    <div className="flex-1" key={option.id}>
                      <Label
                        className={cn(
                          "flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-border bg-transparent p-3 text-center transition-all md:min-h-20",
                          field.state.value === option.value &&
                            "border-primary bg-primary/5",
                        )}
                        htmlFor={option.id}
                      >
                        <RadioGroupItem
                          className="peer sr-only"
                          id={option.id}
                          value={option.value}
                        />
                        <Icon className="mb-3 h-8 w-8 text-primary" />
                        <span className="font-semibold text-lg">
                          {option.title}
                        </span>
                        <span className="mt-1 text-muted-foreground text-sm">
                          {option.description}
                        </span>
                      </Label>
                    </div>
                  );
                })}
            </div>
          </RadioGroup>

          {/* Unified Field Below Columns */}
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
            ) : eventDetails?.eventType === "public" &&
              field.state.value === "nonmember" ? (
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

          {/* Private Event Notice */}
          {eventDetails?.eventType === "private" &&
            field.state.value === "nonmember" && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-sm">
                This is a private event. Only IBC members can attend.
              </div>
            )}
        </FieldSet>
      )}
    </form.AppField>
  );
}
