"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/db.types";
import { updateEvent } from "@/server/events/actions/updateEvent";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];

interface UseEditEventFormOptions {
  event: EventRow;
}

export const useEditEventForm = ({ event }: UseEditEventFormOptions) => {
  const router = useRouter();

  // Determine if the event is a draft (eventType is null)
  const isDraft = event.eventType === null;
  const isFinished =
    event.eventEndDate && new Date() > new Date(event.eventEndDate);

  // Format dates for datetime-local input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    // Just take the string as is from the DB (YYYY-MM-DDTHH:mm:ss)
    return dateString.slice(0, 16);
  };

  const form = useAppForm({
    defaultValues: {
      eventId: event.eventId,
      eventTitle: event.eventTitle,
      description: event.description || "",
      eventStartDate: formatDateForInput(event.eventStartDate),
      eventEndDate: formatDateForInput(event.eventEndDate),
      venue: event.venue || "",
      registrationFee: event.registrationFee,
      eventType: event.eventType as "public" | "private" | null,
      eventImage: [] as File[],
      eventHeaderUrl: event.eventHeaderUrl || "",
    },

    onSubmit: async ({ value }) => {
      console.log("Submitting edit form...", value);

      let headerUrl = value.eventHeaderUrl;

      // If a new image was uploaded, upload it first
      if (value.eventImage && value.eventImage.length > 0) {
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

        headerUrl = publicUrl;
      }

      const payload = {
        eventId: value.eventId,
        eventTitle: value.eventTitle,
        description: value.description,
        eventStartDate: value.eventStartDate,
        eventEndDate: value.eventEndDate,
        venue: value.venue,
        eventHeaderUrl: headerUrl || undefined,
        eventType: value.eventType, // Always include eventType to allow switching
        ...(isDraft && {
          registrationFee: value.registrationFee,
        }),
      };
      console.log("Update payload:", payload);
      const result = await updateEvent(payload, isDraft);

      if (!result.success) {
        toast.error(result.error as string);
        console.error("Update event failed:", result.error);
        return;
      }
      console.log("Event updated successfully:", result.data);
      toast.success("Event updated successfully!");
      router.push(`/admin/events/${event.eventId}`);
    },
  });

  return { form, router, isDraft, isFinished };
};
