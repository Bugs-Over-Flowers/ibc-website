"use client";

import { ArrowLeft, ArrowRight, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep2 } from "../../../_hooks/useRegistrationStep2";
import RegistrationStepCard from "../_utils/RegistrationStepCard";
import { RemoveParticipantDialog } from "./RemoveParticipantDialog";
import { ParticipantFields } from "./Step2ParticipantFields";
import { RemoveParticipantButton } from "./Step2RemoveParticipantButton";

const MAX_OTHER_PARTICIPANTS = 9;

const EMPTY_REGISTRANT = {
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
} as const;

export default function Step2() {
  const form = useRegistrationStep2();
  const setStep = useRegistrationStore((state) => state.setStep);
  const setRegistrationData = useRegistrationStore(
    (state) => state.setRegistrationData,
  );

  const onBack = async () => {
    setStep(1);
    setRegistrationData({
      step2: form.state.values,
    });
  };

  function onNext(e?: React.SubmitEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  }

  return (
    <form onSubmit={onNext}>
      <RegistrationStepCard
        className="w-full overflow-hidden rounded-2xl border-none bg-transparent shadow-none ring-0"
        contentClassName="space-y-12 px-0 sm:px-6"
        description="Enter the details of the primary registrant and any additional attendees."
        footer={
          <div className="flex w-full flex-col-reverse gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="w-full rounded-xl sm:w-auto"
              onClick={onBack}
              size="lg"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              className="w-full rounded-xl shadow-md sm:w-auto sm:px-8"
              size="lg"
              type="submit"
            >
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        }
        headerClassName="bg-card/5"
        Icon={Users}
        title="Participant Details"
      >
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-3">
          <h3 className="pb-2 font-semibold text-foreground text-lg">
            Primary Registrant
          </h3>
          <Badge className="shrink-0" variant="secondary">
            <form.Subscribe
              selector={(s) => s.values.otherParticipants?.length ?? 0}
            >
              {(otherParticipantsCount) => (
                <>
                  {otherParticipantsCount + 1} / {MAX_OTHER_PARTICIPANTS + 1}
                </>
              )}
            </form.Subscribe>
          </Badge>
        </div>

        <ParticipantFields form={form} />

        <form.AppField mode="array" name="otherParticipants">
          {(field) => {
            const otherParticipantsCount = field.state.value?.length ?? 0;
            const canAddMore = otherParticipantsCount < MAX_OTHER_PARTICIPANTS;

            return (
              <div className="space-y-12">
                {field.state.value?.map((registrant, idx) => {
                  const hasData =
                    registrant.firstName ||
                    registrant.lastName ||
                    registrant.email ||
                    registrant.contactNumber;

                  return (
                    <div
                      className="slide-in-from-top-2 fade-in relative animate-in space-y-4 rounded-xl pt-4"
                      key={registrant.id}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground text-lg">
                          Additional Participant #{idx + 1}
                        </h4>
                        {hasData ? (
                          <RemoveParticipantDialog idx={idx} />
                        ) : (
                          <RemoveParticipantButton idx={idx} />
                        )}
                      </div>
                      <ParticipantFields form={form} index={idx} />
                    </div>
                  );
                })}

                <Button
                  className="mt-12 h-12 w-full rounded-xl border-2 border-dashed transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  disabled={!canAddMore}
                  onClick={() =>
                    field.pushValue({
                      ...EMPTY_REGISTRANT,
                      id: crypto.randomUUID(),
                    })
                  }
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {canAddMore
                    ? "Add Another Participant"
                    : `Maximum ${MAX_OTHER_PARTICIPANTS + 1} participants reached`}
                </Button>
              </div>
            );
          }}
        </form.AppField>
      </RegistrationStepCard>
    </form>
  );
}
