"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import { useRegistrationStep1 } from "../../../_hooks/useRegistrationStep1";
import RegistrationStepCard from "../_utils/RegistrationStepCard";
import Step1MemberTypeSection from "./Step1MemberTypeSection";

interface Step1Props {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

const Step1 = ({ members }: Step1Props) => {
  const form = useRegistrationStep1();

  function onNext(e?: React.SubmitEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  }

  const membersOptions = members.map((m) => ({
    label: m.businessName,
    value: m.businessMemberId,
  }));

  return (
    <form onSubmit={onNext}>
      <RegistrationStepCard
        className="w-full overflow-hidden rounded-2xl border-none bg-transparent shadow-none ring-0"
        contentClassName="space-y-6 px-0 sm:px-6"
        description="Please identify your affiliation with the organization."
        footer={
          <div className="flex w-full justify-end border-border/50 border-t pt-6">
            <Button
              className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
              size="lg"
              type="submit"
            >
              Continue to Participants
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        }
        Icon={CheckCircle2}
        title="Member Verification"
      >
        <Step1MemberTypeSection form={form} membersOptions={membersOptions} />
      </RegistrationStepCard>
    </form>
  );
};

export default Step1;
