import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useAppForm } from "@/hooks/_formHooks";
import { setParamsOrDelete } from "@/lib/utils";

type SearchFormScope = "registrations" | "participants";

interface UseSearchFormOptions {
  scope: SearchFormScope;
}

/**
 * Debounced URL search param updater.
 *
 * - Avoids triggering a navigation on every blur/interaction.
 * - Avoids redundant pushes when params haven't changed.
 * - Supports namespaced params:
 *   - registrations: reg_q
 *   - participants: part_q
 *   - shared: q
 */
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
    onSubmit: ({ value }) => {
      const params = setParamsOrDelete(
        qKey,
        value.searchQuery,
        [],
        searchParams,
      );

      router.push(`${pathName}?${params.toString()}` as Route);
    },
  });

  return form;
};
