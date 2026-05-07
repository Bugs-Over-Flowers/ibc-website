"use client";

import { useState } from "react";
import useQuickRegistration from "@/app/admin/events/check-in/[eventDayId]/_hooks/useQuickRegistration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QuickOnsiteRegistrationForm } from "@/lib/validation/registration/quickRegistration";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import QuickOnsiteRegistrantSection from "./QuickOnsiteRegistrantSection";
import QuickOnsiteRegistrationActions from "./QuickOnsiteRegistrationActions";
import QuickOnsiteRegistrationTriggerCard from "./QuickOnsiteRegistrationTriggerCard";
import QuickOnsiteRegistrationTypeSection from "./QuickOnsiteRegistrationTypeSection";

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
      <QuickOnsiteRegistrationTriggerCard onOpen={() => setOpen(true)} />

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
              <QuickOnsiteRegistrationTypeSection
                memberOptions={memberOptions}
                quickForm={quickForm}
              />
              <QuickOnsiteRegistrantSection quickForm={quickForm} />
            </div>

            <QuickOnsiteRegistrationActions quickForm={quickForm} />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
