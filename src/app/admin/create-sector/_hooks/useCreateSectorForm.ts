"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import { createSectorSchema } from "@/lib/validation/sector/sectorSchema";
import { createSector } from "@/server/sectors/mutations";

const defaultValues = {
  sectorName: "",
};

export const useCreateSectorForm = () => {
  const router = useRouter();
  const form = useAppForm({
    defaultValues,
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
      form.reset(defaultValues);
      setTimeout(() => {
        router.push("/admin/manage-sector" as Route);
      }, 0);
    },
  });

  return { form, router };
};
