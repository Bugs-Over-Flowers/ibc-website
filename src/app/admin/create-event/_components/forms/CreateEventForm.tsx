"use client";

import { formContext } from "@/hooks/_formHooks";
import { useCreateEventForm } from "../../_hooks/createEventHook";
import CreateEventMainSections from "./CreateEventMainSections";
import CreateEventSidebar from "./CreateEventSidebar";
import CreateEventTopBar from "./CreateEventTopBar";

export function CreateEventForm() {
  const { form, router } = useCreateEventForm();

  const handleCancel = () => {
    router.push("/admin/events");
  };

  const handleSaveDraft = () => {
    form.setFieldValue("eventType", null);
    form.handleSubmit();
  };

  const handlePublishCurrent = () => {
    const selected = form.state.values.eventType;
    if (!selected) {
      return;
    }

    form.handleSubmit();
  };

  return (
    <div className="min-h-screen">
      <CreateEventTopBar />

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
              <CreateEventMainSections form={form} />

              <CreateEventSidebar
                form={form}
                onCancel={handleCancel}
                onPublishCurrent={handlePublishCurrent}
                onSaveDraft={handleSaveDraft}
              />
            </div>
          </form>
        </formContext.Provider>
      </div>
    </div>
  );
}
