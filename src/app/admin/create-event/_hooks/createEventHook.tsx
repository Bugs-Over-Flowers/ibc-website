"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { createClient } from "@/lib/supabase/client";
import { zodErrorToFieldErrors } from "@/lib/utils";
import {
  createEventSchema,
  type DraftEventInput,
  type PublishEventInput,
} from "@/lib/validation/event/createEventSchema";
import { draftEvent } from "@/server/events/mutations/draftEvent";
import { publishEvent } from "@/server/events/mutations/publishEvent";

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
      eventType: null as "public" | "private" | null,
      eventImage: [] as File[],
      eventPoster: [] as File[],
    },

    validationLogic: revalidateLogic(),

    validators: {
      onDynamic: ({ value }) => {
        const result = createEventSchema.safeParse(value);
        if (!result.success) {
          const fields = zodErrorToFieldErrors(result.error);
          return { fields };
        }
        return undefined;
      },
    },

    onSubmit: async ({ value }) => {
      console.log("Submitting form to server...", value);

      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
      let headerUrl: string | null | undefined = null;
      let posterUrl: string | null | undefined = null;
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
          toast.error("File too large. Maximum size is 5MB.");
          return null;
        }

        return fileExt;
      };

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
          data: { publicUrl: url },
        } = supabase.storage.from("headerimage").getPublicUrl(filePath);
        headerUrl = url;
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
          data: { publicUrl: url },
        } = supabase.storage.from("headerimage").getPublicUrl(filePath);
        posterUrl = url;
      }

      if (!posterUrl) {
        toast.error("Poster image is required.");
        return;
      }

      const payload = {
        ...value,
        eventImage: headerUrl,
        eventPoster: posterUrl,
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
