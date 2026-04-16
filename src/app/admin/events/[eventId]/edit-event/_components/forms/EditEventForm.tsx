"use client";

import EditEventMainSections from "@/app/admin/events/[eventId]/edit-event/_components/forms/EditEventMainSections";
import EditEventSidebar from "@/app/admin/events/[eventId]/edit-event/_components/forms/EditEventSidebar";
import EditEventTopBar from "@/app/admin/events/[eventId]/edit-event/_components/forms/EditEventTopBar";
import EditFinishedEventForm from "@/app/admin/events/[eventId]/edit-event/_components/forms/EditFinishedEventForm";
import { formContext } from "@/hooks/_formHooks";
import type { Database } from "@/lib/supabase/db.types";
import { useEditEventForm } from "../../_hooks/useEditEventForm";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];

interface EditEventFormProps {
  event: EventRow;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const { form, router, isDraft, isFinished, isPrivatePublished } =
    useEditEventForm({ event });

  const handleCancel = () => {
    router.push(`/admin/events/${event.eventId}`);
  };

  if (isFinished && !isDraft) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <EditEventTopBar eventId={event.eventId} />

        <div className="mx-auto max-w-7xl py-5">
          <formContext.Provider value={form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <EditFinishedEventForm form={form} onCancel={handleCancel} />
            </form>
          </formContext.Provider>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <EditEventTopBar eventId={event.eventId} />

      <div className="mx-auto max-w-7xl py-5">
        <formContext.Provider value={form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid grid-cols-1 items-start gap-8 px-2 xl:grid-cols-[1fr_320px]">
              <EditEventMainSections
                event={event}
                form={form}
                isDraft={isDraft}
                isPrivatePublished={isPrivatePublished}
              />

              <EditEventSidebar
                form={form}
                isDraft={isDraft}
                isPrivatePublished={isPrivatePublished}
                onCancel={handleCancel}
              />
            </div>
          </form>
        </formContext.Provider>
      </div>
    </div>
  );
}
