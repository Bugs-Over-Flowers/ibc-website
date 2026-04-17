"use client";

import { Building, Plus, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { QuickOnsiteRegistrationForm } from "@/lib/validation/registration/quickRegistration";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import useQuickRegistration from "../_hooks/useQuickRegistration";

interface QuickOnsiteRegistrationCardProps {
  eventDayId: string;
  eventId: string;
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function QuickOnsiteRegistrationCard({
  eventDayId,
  eventId,
  members,
}: QuickOnsiteRegistrationCardProps) {
  const defaultValues: QuickOnsiteRegistrationForm = {
    member: "nonmember",
    nonMemberName: "",
    contactNumber: "",
    email: "",
    firstName: "",
    lastName: "",
    businessMemberId: "",
    remark: "",
  };

  const [open, setOpen] = useState(false);

  const memberOptions = members.map((member) => ({
    label: member.businessName,
    value: member.businessMemberId,
  }));

  const quickForm = useQuickRegistration({
    defaultValues,
    eventDayId,
    setDialogOpen: setOpen,
    eventId,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      quickForm.reset(defaultValues);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Plus className="size-4" />
          </div>
          <div>
            <p className="font-medium text-sm">Quick Registration</p>
            <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
              Register a walk-in, accept payment, and check in immediately.
            </p>
          </div>
        </div>
        <Button
          className="w-full gap-1.5"
          onClick={() => setOpen(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="size-3.5" />
          Register Walk-In
        </Button>
      </div>

      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b bg-muted/10 px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="font-semibold text-lg">
                  Quick Onsite Registration
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  One-step flow to register a walk-in attendee, accept payment,
                  and check in instantly.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              quickForm.handleSubmit({ keepOpen: false });
            }}
          >
            <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
              <FieldGroup>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">
                    Registration Type
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Choose whether this attendee is linked to a member
                    organization.
                  </p>
                </div>

                <quickForm.AppField name="member">
                  {(field) => (
                    <RadioGroup
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      onValueChange={(value) => {
                        field.handleChange(value);

                        if (value === "member") {
                          quickForm.setFieldValue("nonMemberName", "");
                        } else {
                          quickForm.setFieldValue("businessMemberId", "");
                        }
                      }}
                      value={field.state.value}
                    >
                      {[
                        {
                          id: "member",
                          value: "member",
                          icon: Building,
                          title: "Corporate Member",
                          description: "Belongs to a registered organization",
                        },
                        {
                          id: "nonmember",
                          value: "nonmember",
                          icon: UserCircle,
                          title: "Non-member",
                          description: "Independent or walk-in attendee",
                        },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isActive = field.state.value === option.value;

                        return (
                          <div key={option.id}>
                            <Label
                              className={cn(
                                "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-border bg-transparent px-4 py-3 text-center transition-all",
                                isActive
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-primary/40 hover:bg-muted/30",
                              )}
                              htmlFor={option.id}
                            >
                              <RadioGroupItem
                                className="sr-only"
                                id={option.id}
                                value={option.value}
                              />
                              <span
                                className={cn(
                                  "mb-1 flex size-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                                  isActive
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : null,
                                )}
                              >
                                <Icon className="size-5" />
                              </span>
                              <span className="font-semibold text-sm">
                                {option.title}
                              </span>
                              <span className="text-muted-foreground text-xs leading-relaxed">
                                {option.description}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </quickForm.AppField>

                <quickForm.Subscribe selector={(state) => state.values.member}>
                  {(member) =>
                    member === "member" ? (
                      <quickForm.AppField name="businessMemberId">
                        {(field) => (
                          <field.SingleComboBoxField
                            label="Select organization"
                            options={memberOptions}
                            placeholder="Choose your organization"
                          />
                        )}
                      </quickForm.AppField>
                    ) : (
                      <quickForm.AppField name="nonMemberName">
                        {(field) => (
                          <field.TextField
                            label="Organization or Company"
                            placeholder="Acme Corp, Independent, etc."
                          />
                        )}
                      </quickForm.AppField>
                    )
                  }
                </quickForm.Subscribe>

                <div className="space-y-1 pt-1">
                  <p className="font-semibold text-foreground text-sm">
                    Attendee Details
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Capture the primary contact information for this check-in.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <quickForm.AppField name="firstName">
                    {(field) => (
                      <field.TextField label="First Name" placeholder="Juan" />
                    )}
                  </quickForm.AppField>
                  <quickForm.AppField name="lastName">
                    {(field) => (
                      <field.TextField
                        label="Last Name"
                        placeholder="Dela Cruz"
                      />
                    )}
                  </quickForm.AppField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <quickForm.AppField name="email">
                    {(field) => (
                      <field.TextField
                        label="Email Address"
                        placeholder="juan.delacruz@example.com"
                        type="email"
                      />
                    )}
                  </quickForm.AppField>
                  <quickForm.AppField name="contactNumber">
                    {(field) => (
                      <field.TextField
                        label="Contact Number"
                        placeholder="09XXXXXXXXX"
                      />
                    )}
                  </quickForm.AppField>
                </div>

                <quickForm.AppField name="remark">
                  {(field) => (
                    <field.TextareaField
                      label="Remarks (optional)"
                      placeholder="Notes for this check-in"
                      rows={3}
                    />
                  )}
                </quickForm.AppField>

                <quickForm.Subscribe
                  selector={(state) =>
                    state.errorMap as { onSubmit?: { form?: string } }
                  }
                >
                  {(errorMap) => (
                    <FieldError>{errorMap.onSubmit?.form}</FieldError>
                  )}
                </quickForm.Subscribe>
              </FieldGroup>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <DialogClose
                render={
                  <Button
                    className="w-full sm:w-auto"
                    size="sm"
                    type="button"
                    variant="outline"
                  />
                }
              >
                Cancel
              </DialogClose>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <quickForm.Subscribe
                  selector={(state) => [state.isSubmitting, state.isValid]}
                >
                  {([isSubmitting, isValid]) => (
                    <>
                      <Button
                        className="w-full sm:w-auto"
                        disabled={isSubmitting || !isValid}
                        onClick={() =>
                          quickForm.handleSubmit({ keepOpen: true })
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {isSubmitting ? "Processing..." : "Check In Another"}
                      </Button>
                      <Button
                        className="w-full sm:w-auto"
                        disabled={isSubmitting || !isValid}
                        size="sm"
                        type="submit"
                      >
                        {isSubmitting ? "Processing..." : "Register & Check In"}
                      </Button>
                    </>
                  )}
                </quickForm.Subscribe>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
