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
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { useFieldContext } from "@/hooks/_formHooks";
import useRegistrationStore from "@/hooks/registration.store";
import type { StandardRegistrationStep2Schema } from "@/lib/validation/registration/standard";
import { useRegistrationStep2 } from "../../_hooks/useRegistrationStep2";

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
    <form className="space-y-4" onSubmit={onNext}>
      <ItemGroup>
        <Item>
          <ItemContent>
            <div className="flex items-center gap-2">
              <Users size={18} />
              <ItemTitle>Participants</ItemTitle>
            </div>
            <ItemDescription>
              You may register up to {MAX_OTHER_PARTICIPANTS + 1} participants
              (including yourself)
            </ItemDescription>
          </ItemContent>
        </Item>

        {/* Participant Counter */}
        <Item variant={"outline"}>
          <ItemContent>
            <ItemTitle>Total Participants</ItemTitle>
            <span className="font-medium">
              <form.Subscribe
                selector={(s) => s.values.otherRegistrants?.length ?? 0}
              >
                {(otherRegistrantsCount) => (
                  <>
                    {otherRegistrantsCount + 1} / {MAX_OTHER_PARTICIPANTS + 1}
                  </>
                )}
              </form.Subscribe>
            </span>
          </ItemContent>
        </Item>
      </ItemGroup>
      {/* Principal Registrant */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-2 pb-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>
              <h3>Principal Registrant</h3>
            </CardTitle>
            <Badge>You</Badge>
          </div>
          <FieldGroup>
            <CardDescription>
              Please provide your information as the main registrant.
            </CardDescription>
            <ParticipantFields form={form} />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Other Registrants */}
      <form.AppField mode="array" name="otherRegistrants">
        {(field) => {
          const otherRegistrantsCount = field.state.value?.length ?? 0;
          const canAddMore = otherRegistrantsCount < MAX_OTHER_PARTICIPANTS;

          return (
            <div className="space-y-4">
              {field.state.value?.map((registrant, idx) => {
                const hasData =
                  registrant.firstName ||
                  registrant.lastName ||
                  registrant.email ||
                  registrant.contactNumber;

                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: getting index is okay, handled by tanstack form
                  <Card key={idx}>
                    <CardContent>
                      <div className="flex flex-col items-start gap-2 pb-3 md:flex-row md:items-center md:justify-between">
                        <FieldTitle>
                          <h3>Participant {idx + 2}</h3>
                        </FieldTitle>
                        {hasData ? (
                          <RemoveParticipantDialog idx={idx} />
                        ) : (
                          <Button
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                      <FieldGroup>
                        <FieldDescription>
                          Please provide the participant&apos;s information.
                        </FieldDescription>
                        <ParticipantFields form={form} index={idx} />
                      </FieldGroup>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                className="w-full"
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
  | `principalRegistrant.${keyof StandardRegistrationStep2Schema["principalRegistrant"]}`
  | `otherRegistrants[${number}].${keyof NonNullable<StandardRegistrationStep2Schema["otherRegistrants"]>[number]}`;

interface ParticipantFieldsProps {
  form: ReturnType<typeof useRegistrationStep2>;
  index?: number;
}

function ParticipantFields({ form, index }: ParticipantFieldsProps) {
  const prefix =
    index === undefined ? "principalRegistrant" : `otherRegistrants[${index}]`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <form.AppField name={`${prefix}.firstName` as Step2FieldName}>
        {(field) => <field.TextField label="First Name" placeholder="Juan" />}
      </form.AppField>
      <form.AppField name={`${prefix}.lastName` as Step2FieldName}>
        {(field) => (
          <field.TextField label="Last Name" placeholder="Dela Cruz" />
        )}
      </form.AppField>
      <form.AppField name={`${prefix}.email` as Step2FieldName}>
        {(field) => (
          <field.TextField
            label="Email"
            placeholder="juan@example.com"
            type="email"
          />
        )}
      </form.AppField>
      <form.AppField name={`${prefix}.contactNumber` as Step2FieldName}>
        {(field) => (
          <field.TextField label="Contact Number" placeholder="09171234567" />
        )}
      </form.AppField>
    </div>
  );
}

function RemoveParticipantDialog({ idx }: { idx: number }) {
  const field = useFieldContext();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
            Are you sure you want to remove this participant? Any information
            entered will be lost.
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
