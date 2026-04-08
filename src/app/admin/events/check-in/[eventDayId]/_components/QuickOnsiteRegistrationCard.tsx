"use client";

import { Building, Plus, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Registration</CardTitle>
          <CardDescription>
            Register a walk-in attendee, mark onsite payment as accepted, and
            check them in immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Use this for assisted admin-side walk-in registration and immediate
            check-in.
          </p>
          <Button className="w-full" onClick={() => setOpen(true)}>
            <Plus />
            Quick Register Walk-in
          </Button>
        </CardContent>
      </Card>

      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent className="sm:max-w-xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              quickForm.handleSubmit({ keepOpen: false });
            }}
          >
            <DialogHeader>
              <DialogTitle>Quick Onsite Registration</DialogTitle>
              <DialogDescription>
                Minimal walk-in flow for admins. This creates the registration,
                accepts payment, and checks in the attendee for the selected
                event day.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <FieldGroup>
                <quickForm.AppField name="member">
                  {(field) => (
                    <FieldSet className="space-y-3">
                      <RadioGroup
                        className="space-y-0"
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {[
                            {
                              id: "member",
                              value: "member",
                              icon: Building,
                              title: "Corporate Member",
                            },
                            {
                              id: "nonmember",
                              value: "nonmember",
                              icon: UserCircle,
                              title: "Non-member",
                            },
                          ].map((option) => {
                            const Icon = option.icon;

                            return (
                              <div className="flex-1" key={option.id}>
                                <Label
                                  className={cn(
                                    "flex h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent p-4 text-center transition-all",
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
                                  <span
                                    className={cn(
                                      "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                                      field.state.value === option.value &&
                                        "border-primary/30 bg-primary/10 text-primary",
                                    )}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </span>
                                  <span className="font-semibold text-lg">
                                    {option.title}
                                  </span>
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </RadioGroup>
                    </FieldSet>
                  )}
                </quickForm.AppField>

                <quickForm.Subscribe selector={(state) => state.values.member}>
                  {(member) =>
                    member === "member" ? (
                      <quickForm.AppField name="businessMemberId">
                        {(field) => (
                          <field.SingleComboBoxField
                            label="Select Organization"
                            options={memberOptions}
                            placeholder="Choose your organization"
                          />
                        )}
                      </quickForm.AppField>
                    ) : (
                      <quickForm.AppField name="nonMemberName">
                        {(field) => (
                          <field.TextField
                            label="Organization or Company Name"
                            placeholder="Acme Corp, Independent, etc."
                          />
                        )}
                      </quickForm.AppField>
                    )
                  }
                </quickForm.Subscribe>

                <div className="grid gap-4 sm:grid-cols-2">
                  <quickForm.AppField name="firstName">
                    {(field) => <field.TextField label="First name" />}
                  </quickForm.AppField>
                  <quickForm.AppField name="lastName">
                    {(field) => <field.TextField label="Last name" />}
                  </quickForm.AppField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <quickForm.AppField name="email">
                    {(field) => <field.TextField label="Email" type="email" />}
                  </quickForm.AppField>
                  <quickForm.AppField name="contactNumber">
                    {(field) => <field.TextField label="Contact number" />}
                  </quickForm.AppField>
                </div>

                <quickForm.AppField name="remark">
                  {(field) => (
                    <field.TextareaField
                      label="Remark"
                      placeholder="Optional notes for this check-in"
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

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <quickForm.Subscribe
                selector={(state) => [state.isSubmitting, state.isValid]}
              >
                {([isSubmitting, isValid]) => (
                  <>
                    <Button
                      disabled={isSubmitting || !isValid}
                      onClick={() => quickForm.handleSubmit({ keepOpen: true })}
                      type="button"
                      variant="outline"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : "Check In Another Participant"}
                    </Button>
                    <Button disabled={isSubmitting || !isValid} type="submit">
                      {isSubmitting ? "Processing..." : "Register and Check In"}
                    </Button>
                  </>
                )}
              </quickForm.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
