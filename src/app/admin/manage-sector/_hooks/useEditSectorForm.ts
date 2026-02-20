"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import { updateSectorSchema } from "@/lib/validation/sector/sectorSchema";
import { updateSector } from "@/server/sectors/mutations";

interface UseEditSectorFormProps {
  id: number;
  currentName: string;
  onSuccess?: () => void;
}

export const useEditSectorForm = ({
  id,
  currentName,
  onSuccess,
}: UseEditSectorFormProps) => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      id,
      sectorName: currentName,
    },
    validators: {
      onSubmit: zodValidator(updateSectorSchema),
    },
    onSubmit: async ({ value }) => {
      const { error } = await tryCatch(updateSector(value));

      if (error) {
        form.setErrorMap({
          onSubmit: {
            form: error,
            fields: {},
          },
        });

        toast.error(error);
        return;
      }

      toast.success("Sector updated successfully!");
      router.refresh();
      onSuccess?.();
    },
  });

  return { form };
};
