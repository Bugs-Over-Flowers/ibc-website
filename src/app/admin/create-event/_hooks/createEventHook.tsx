"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { createClient } from "@/lib/supabase/client";
import {
  createEventSchema,
  type DraftEventInput,
  type PublishEventInput,
} from "@/lib/validation/event/createEventSchema";
import { draftEvent } from "@/server/events/actions/draftEvent";
import { publishEvent } from "@/server/events/actions/publishEvent";

export const useCreateEventForm = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      eventTitle: "",
      description: "",
      eventStartDate: undefined as Date | undefined,
      eventEndDate: undefined as Date | undefined,
      venue: "",
      registrationFee: 0,
      maxGuest: 0,
      eventType: null as "public" | "private" | null,
      eventImage: [] as File[],
    },

    validators: {
      onSubmit: createEventSchema,
    },

    onSubmit: async ({ value }) => {
      console.log("Submitting form to server...", value);

      const file = value.eventImage[0];
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        toast.error(
          "Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed.",
        );
        return;
      }

      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `event-headers/${fileName}`;

      const supabase = await createClient();
      const { error: uploadError } = await supabase.storage
        .from("headerImage")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Image upload failed: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("headerImage").getPublicUrl(filePath);

      const payload = {
        ...value,
        eventImage: publicUrl,
      };

      const result =
        value.eventType === null
          ? await draftEvent(payload as DraftEventInput)
          : await publishEvent(payload as PublishEventInput);

      if (!result.success) {
        toast.error(result.error as string);
        return;
      }

      const message =
        value.eventType === null
          ? "Saved event as draft"
          : "Event created successfully!";

      toast.success(message);
      router.push("/admin/events");
    },
  });

  return { form, router };
};
