"use client";
import { Plus, Trash2, Users } from "lucide-react";
import type { FormEvent } from "react";
import FormButtons from "@/components/FormButtons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFieldContext } from "@/hooks/_formHooks";
import useRegistrationStore from "@/hooks/registration.store";
import type { StandardRegistrationStep2Schema } from "@/lib/validation/registration/standard";
import { useRegistrationStep2 } from "../../_hooks/useRegistrationStep2";
import RegistrationStepHeader from "./RegistrationStepHeader";

const MAX_OTHER_PARTICIPANTS = 9;

const EMPTY_REGISTRANT = {
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

  const onNext = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.handleSubmit({ nextStep: true });
  };

  return (
    <form className="space-y-6" onSubmit={onNext}>
      <div className="flex items-start justify-between">
        <RegistrationStepHeader
          description={`Register up to ${MAX_OTHER_PARTICIPANTS + 1} participants including yourself.`}
          Icon={Users}
          title="Participant Details"
        />
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

      {/* Primary Registrant */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm">
            Registrant (You)
          </h3>
          <Badge className="text-xs">Primary</Badge>
        </div>
        <ParticipantFields form={form} />
      </div>

      {/* Other Registrants */}
      <form.AppField mode="array" name="otherParticipants">
        {(field) => {
          const otherParticipantsCount = field.state.value?.length ?? 0;
          const canAddMore = otherParticipantsCount < MAX_OTHER_PARTICIPANTS;

          return (
            <div className="space-y-6">
              {field.state.value?.map((registrant, idx) => {
                const hasData =
                  registrant.firstName ||
                  registrant.lastName ||
                  registrant.email ||
                  registrant.contactNumber;

                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: getting index is okay, handled by tanstack form
                  <div className="space-y-4" key={idx}>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm">
                        Participant {idx + 2}
                      </h3>
                      {hasData ? (
                        <RemoveParticipantDialog idx={idx} />
                      ) : (
                        <Button
                          className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => field.removeValue(idx)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <ParticipantFields form={form} index={idx} />
                  </div>
                );
              })}

              {/* Button for adding another participant */}
              <Button
                className="h-11 w-full border-dashed"
                disabled={!canAddMore}
                onClick={() => field.pushValue({ ...EMPTY_REGISTRANT })}
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

      <FormButtons onBack={onBack} onNext={onNext} />
    </form>
  );
}

type Step2FieldName =
  | `registrant.${keyof StandardRegistrationStep2Schema["registrant"]}`
  | `otherParticipants[${number}].${keyof NonNullable<StandardRegistrationStep2Schema["otherParticipants"]>[number]}`;

interface ParticipantFieldsProps {
  form: ReturnType<typeof useRegistrationStep2>;
  index?: number;
}

function ParticipantFields({ form, index }: ParticipantFieldsProps) {
  const prefix =
    index === undefined ? "registrant" : `otherParticipants[${index}]`;

  return (
    <div className="space-y-4">
      {/* Name Row - Two Columns */}
      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name={`${prefix}.firstName` as Step2FieldName}>
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm">First Name</Label>
              <field.TextField className="h-11" placeholder="Juan" />
            </div>
          )}
        </form.AppField>
        <form.AppField name={`${prefix}.lastName` as Step2FieldName}>
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm">Last Name</Label>
              <field.TextField className="h-11" placeholder="Dela Cruz" />
            </div>
          )}
        </form.AppField>
      </div>

      {/* Email - Single Column */}
      <form.AppField name={`${prefix}.email` as Step2FieldName}>
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm">Email Address</Label>
            <field.TextField
              className="h-11"
              placeholder="juan.delacruz@example.com"
              type="email"
            />
          </div>
        )}
      </form.AppField>

      {/* Phone - Single Column */}
      <form.AppField name={`${prefix}.contactNumber` as Step2FieldName}>
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm">Contact Number</Label>
            <field.TextField className="h-11" placeholder="09171234567" />
          </div>
        )}
      </form.AppField>
    </div>
  );
}

function RemoveParticipantDialog({ idx }: { idx: number }) {
  const field = useFieldContext();
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Remove
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
          <AlertDialogDescription>
            Any information entered will be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => field.removeValue(idx)}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
