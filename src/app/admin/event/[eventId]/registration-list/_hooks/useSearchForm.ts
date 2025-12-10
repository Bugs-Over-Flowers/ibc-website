import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";
import { setParamsOrDelete } from "@/lib/utils";

export const useSearchForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const form = useAppForm({
    defaultValues: {
      searchQuery: searchParams.get("q") || "",
    },
    onSubmit: ({ value }) => {
      const params = setParamsOrDelete(
        "q",
        value.searchQuery,
        [],
        searchParams,
      );

      router.push(`${pathName}?${params.toString()}` as Route);
    },
  });

  return form;
};
