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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import useRegistrationStore from "@/hooks/registration.store";
import { useRegistrationStep2 } from "@/hooks/useRegistrationStep2";
import type { StandardRegistrationStep2Schema } from "@/lib/validation/registration/standard";

const MAX_OTHER_PARTICIPANTS = 9;

const EMPTY_REGISTRANT = {
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
} as const;

export default function Step2() {
  const f = useRegistrationStep2();
  const setStep = useRegistrationStore((s) => s.setStep);
  const setRegistrationData = useRegistrationStore(
    (s) => s.setRegistrationData,
  );

  const onBack = async () => {
    setStep(1);
    setRegistrationData({
      step2: f.state.values,
    });
  };

  const onNext = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    f.handleSubmit({ nextStep: true });
  };

  return (
    <form className="space-y-4" onSubmit={onNext}>
      <Item>
        <ItemContent>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <ItemTitle>Participants</ItemTitle>
          </div>
          <ItemDescription>
            You may register up to {MAX_OTHER_PARTICIPANTS + 1} participants
            (including yourself).
          </ItemDescription>
        </ItemContent>
      </Item>

      {/* Participant Counter */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
        <span className="text-sm text-muted-foreground">
          Total Participants
        </span>
        <span className="font-medium">
          <f.Subscribe selector={(s) => s.values.otherRegistrants?.length ?? 0}>
            {(otherRegistrantsCount) => (
              <>
                {otherRegistrantsCount + 1} / {MAX_OTHER_PARTICIPANTS + 1}
              </>
            )}
          </f.Subscribe>
        </span>
      </div>

      {/* Principal Registrant */}
      <Card>
        <CardContent>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <FieldTitle>
                <h3>Principal Registrant</h3>
              </FieldTitle>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                You
              </span>
            </div>
            <FieldDescription>
              Please provide your information as the main registrant.
            </FieldDescription>
            <ParticipantFields f={f} />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Other Registrants */}
      <f.AppField name="otherRegistrants" mode="array">
        {(field) => {
          const otherRegistrantsCount = field.state.value?.length ?? 0;
          const canAddMore = otherRegistrantsCount < MAX_OTHER_PARTICIPANTS;
          const totalParticipants = 1 + otherRegistrantsCount;

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
                      <div className="flex items-center justify-between">
                        <FieldTitle>
                          <h3>Participant {idx + 2}</h3>
                        </FieldTitle>
                        {hasData ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove Participant?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this
                                  participant? Any information entered will be
                                  lost.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => field.removeValue(idx)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => field.removeValue(idx)}
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
                        <ParticipantFields f={f} index={idx} />
                      </FieldGroup>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={!canAddMore}
                onClick={() => field.pushValue({ ...EMPTY_REGISTRANT })}
              >
                <Plus className="mr-2 h-4 w-4" />
                {canAddMore
                  ? "Add Another Participant"
                  : `Maximum ${MAX_OTHER_PARTICIPANTS + 1} participants reached`}
              </Button>
            </div>
          );
        }}
      </f.AppField>

      <FormButtons onNext={onNext} onBack={onBack} />
    </form>
  );
}

type Step2FieldName =
  | `principalRegistrant.${keyof StandardRegistrationStep2Schema["principalRegistrant"]}`
  | `otherRegistrants[${number}].${keyof NonNullable<StandardRegistrationStep2Schema["otherRegistrants"]>[number]}`;

interface ParticipantFieldsProps {
  f: ReturnType<typeof useRegistrationStep2>;
  index?: number;
}

function ParticipantFields({ f, index }: ParticipantFieldsProps) {
  const prefix =
    index === undefined ? "principalRegistrant" : `otherRegistrants[${index}]`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <f.AppField name={`${prefix}.firstName` as Step2FieldName}>
        {(field) => <field.TextField label="First Name" placeholder="Juan" />}
      </f.AppField>
      <f.AppField name={`${prefix}.lastName` as Step2FieldName}>
        {(field) => (
          <field.TextField label="Last Name" placeholder="Dela Cruz" />
        )}
      </f.AppField>
      <f.AppField name={`${prefix}.email` as Step2FieldName}>
        {(field) => (
          <field.TextField
            label="Email"
            type="email"
            placeholder="juan@example.com"
          />
        )}
      </f.AppField>
      <f.AppField name={`${prefix}.contactNumber` as Step2FieldName}>
        {(field) => (
          <field.TextField label="Contact Number" placeholder="09171234567" />
        )}
      </f.AppField>
    </div>
  );
}
