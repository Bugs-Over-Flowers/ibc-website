"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import { createSectorSchema } from "@/lib/validation/sector/sectorSchema";
import { createSector } from "@/server/sectors/mutations";
export const useCreateSectorForm = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      sectorName: "",
    },
    validators: {
      onSubmit: zodValidator(createSectorSchema),
    },
    onSubmit: async ({ value }) => {
      const { error } = await tryCatch(createSector(value));

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

      toast.success("Sector created successfully!");
      form.reset({
        sectorName: "",
      });
      router.push("/admin/manage-sector" as Route);
    },
  });

  return { form, router };
};
