import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import z from "zod";
import { useAppForm } from "@/hooks/_formHooks";
import { setParamsOrDelete } from "@/lib/utils";

type SearchFormScope = "registrations" | "participants";

interface UseSearchFormOptions {
  scope: SearchFormScope;
}

export const useSearchForm = (options: UseSearchFormOptions) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const qKey = useMemo(() => {
    if (options.scope === "registrations") return "reg_q";
    if (options.scope === "participants") return "part_q";
    return "q";
  }, [options.scope]);

  const form = useAppForm({
    defaultValues: {
      searchQuery: searchParams.get(qKey) || "",
    },
    validators: {
      onSubmit: z.object({
        searchQuery: z.string().min(2).max(100),
      }),
    },
    onSubmit: ({ value }) => {
      const params = setParamsOrDelete(
        qKey,
        value.searchQuery,
        [],
        searchParams,
      );

      router.replace(`${pathName}?${params.toString()}` as Route);
    },
  });

  return form;
};
