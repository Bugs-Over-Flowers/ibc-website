"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  // Convert timestamptz to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useAppForm({
    defaultValues: {
      eventId: event.eventId,
      eventTitle: event.eventTitle,
      description: event.description || "",
      eventStartDate: formatForDateTimeLocal(event.eventStartDate),
      eventEndDate: formatForDateTimeLocal(event.eventEndDate),
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
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

        if (!fileExt || !allowedExtensions.includes(fileExt)) {
          toast.error(
            "Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed.",
          );
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error("File size exceeds 5MB limit.");
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

        // Delete old image if it exists
        if (event.eventHeaderUrl) {
          const oldUrl = event.eventHeaderUrl;
          // Extract the path from the public URL
          // URL format: .../storage/v1/object/public/headerImage/event-headers/filename.ext
          const pathParts = oldUrl.split("/headerImage/");
          if (pathParts.length > 1) {
            const oldPath = pathParts[1];
            const { error: deleteError } = await supabase.storage
              .from("headerImage")
              .remove([oldPath]);

            if (deleteError) {
              console.error("Failed to delete old image:", deleteError);
            }
          }
        }
      }

      // Validate that dates are provided
      if (!value.eventStartDate || !value.eventEndDate) {
        toast.error("Start date and end date are required");
        return;
      }

      const payload = {
        eventId: value.eventId,
        eventTitle: value.eventTitle,
        description: value.description,
        eventStartDate: value.eventStartDate,
        eventEndDate: value.eventEndDate,
        venue: value.venue,
        eventHeaderUrl: headerUrl || undefined,
        eventType: value.eventType,
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

  useEffect(() => {
    form.reset();
  }, [form]);

  return { form, router, isDraft, isFinished };
};
