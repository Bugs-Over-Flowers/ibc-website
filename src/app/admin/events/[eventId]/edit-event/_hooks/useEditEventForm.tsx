"use client";

import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/db.types";
import { updateEvent } from "@/server/events/mutations/updateEvent";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];

interface UseEditEventFormOptions {
  event: EventRow;
}

export const useEditEventForm = ({ event }: UseEditEventFormOptions) => {
  const router = useRouter();

  // Determine if the event is a draft (eventType is null)
  const isDraft = event.eventType === null;
  const isPrivatePublished = !isDraft && event.eventType === "private";
  const isFinished =
    event.eventEndDate && new Date() > new Date(event.eventEndDate);

  // Convert timestamptz to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return "";
    return formatDate(dateString, "yyyy-MM-dd'T'HH:mm");
  };

  const form = useAppForm({
    defaultValues: {
      eventId: event.eventId,
      eventTitle: event.eventTitle, // this is a required field for draft
      description: event.description || "",
      eventStartDate: formatForDateTimeLocal(event.eventStartDate),
      eventEndDate: formatForDateTimeLocal(event.eventEndDate),
      venue: event.venue || "",
      registrationFee: event.registrationFee,
      facebookLink: event.facebookLink || "",
      eventType: event.eventType as "public" | "private" | null,
      eventImage: [] as File[],
      eventHeaderUrl: event.eventHeaderUrl || "",
      eventPoster: [] as File[],
      eventPosterUrl: event.eventPoster || "",
    },

    onSubmit: async ({ value }) => {
      console.log("Submitting edit form...", value);

      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
      let headerUrl = value.eventHeaderUrl;
      let posterUrl = value.eventPosterUrl;
      let supabaseClient: Awaited<ReturnType<typeof createClient>> | null =
        null;

      const getSupabaseClient = async () => {
        if (!supabaseClient) {
          supabaseClient = await createClient();
        }
        return supabaseClient;
      };

      const validateFile = (file: File) => {
        const fileExt = file.name.split(".").pop()?.toLowerCase();

        if (!fileExt || !allowedExtensions.includes(fileExt)) {
          toast.error(
            "Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed.",
          );
          return null;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error("File size exceeds 5MB limit.");
          return null;
        }

        return fileExt;
      };

      const deleteOldFile = async (publicUrl?: string | null) => {
        if (!publicUrl) return;
        const [, path] = publicUrl.split("/headerimage/");
        if (!path) return;
        const supabase = await getSupabaseClient();
        const { error } = await supabase.storage
          .from("headerimage")
          .remove([path]);
        if (error) {
          console.error("Failed to delete old image:", error);
        }
      };

      // If a new image was uploaded, upload it first
      if (value.eventImage && value.eventImage.length > 0) {
        const file = value.eventImage[0];
        const fileExt = validateFile(file);

        if (!fileExt) {
          return;
        }

        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `event-headers/${fileName}`;

        const supabase = await getSupabaseClient();
        const { error: uploadError } = await supabase.storage
          .from("headerimage")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Image upload failed: ${uploadError.message}`);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("headerimage").getPublicUrl(filePath);

        headerUrl = publicUrl;
        await deleteOldFile(event.eventHeaderUrl);
      }

      if (value.eventPoster && value.eventPoster.length > 0) {
        const posterFile = value.eventPoster[0];
        const fileExt = validateFile(posterFile);

        if (!fileExt) {
          return;
        }

        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `event-posters/${fileName}`;

        const supabase = await getSupabaseClient();
        const { error: uploadError } = await supabase.storage
          .from("headerimage")
          .upload(filePath, posterFile);

        if (uploadError) {
          toast.error(`Poster upload failed: ${uploadError.message}`);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("headerimage").getPublicUrl(filePath);

        posterUrl = publicUrl;
        await deleteOldFile(event.eventPoster);
      }

      // Validate that dates are provided
      if (!value.eventStartDate || !value.eventEndDate) {
        toast.error("Start date and end date are required");
        return;
      }

      const isoStartDate = new Date(value.eventStartDate).toISOString();
      const isoEndDate = new Date(value.eventEndDate).toISOString();

      const trimmedFacebookLink = value.facebookLink?.trim();
      const normalizedFacebookLink =
        trimmedFacebookLink && trimmedFacebookLink.length > 0
          ? trimmedFacebookLink
          : null;

      const result = isDraft
        ? await updateEvent(
            {
              eventId: value.eventId,
              eventTitle: value.eventTitle,
              description: value.description,
              eventStartDate: isoStartDate,
              eventEndDate: isoEndDate,
              venue: value.venue,
              eventHeaderUrl: headerUrl || undefined,
              eventPoster: posterUrl || undefined,
              eventType: value.eventType,
              facebookLink: normalizedFacebookLink,
              registrationFee: value.registrationFee,
            },
            true,
          )
        : await updateEvent(
            {
              eventId: value.eventId,
              eventTitle: value.eventTitle,
              description: value.description,
              eventStartDate: isoStartDate,
              eventEndDate: isoEndDate,
              venue: value.venue,
              eventHeaderUrl: headerUrl || undefined,
              eventPoster: posterUrl || undefined,
              eventType: value.eventType ?? undefined,
              facebookLink: normalizedFacebookLink,
            },
            false,
          );

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

  return { form, router, isDraft, isFinished, isPrivatePublished };
};
