"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import createEventSchema from "@/lib/validation/event/createEventSchema";
import { draftEvent } from "@/server/events/actions/draftEvent";
import { publishEvent } from "@/server/events/actions/publishEvent";

export const useCreateEventForm = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      eventTitle: "",
      description: "",
      eventStartDate: "",
      eventEndDate: "",
      venue: "",
      registrationFee: 0,
      eventType: null as "public" | "private" | null,
      eventImage: [] as File[],
    },

    validators: {
      onSubmit: createEventSchema,
    },

    onSubmit: async ({ value }) => {
      console.log("Submitting form to server...", value);

      const result =
        value.eventType === null
          ? await draftEvent(value)
          : await publishEvent(value);

      if (!result.success) {
        toast.error(result.error as string);
        return;
      }

      const message =
        value.eventType === null
          ? "Saved event as draft"
          : "Event created successfully!";

      toast.success(message);
      router.push("/admin/dashboard");
    },
  });

  return { form, router };
};
