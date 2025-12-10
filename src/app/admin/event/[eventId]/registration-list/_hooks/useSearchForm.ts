import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";

export const useSearchForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const form = useAppForm({
    defaultValues: {
      searchQuery: searchParams.get("affiliation") || "",
    },
    onSubmit: ({ value }) => {
      const params = new URLSearchParams(searchParams.toString());
      const query = value.searchQuery !== "" ? value.searchQuery : null;

      if (query === null) {
        params.delete("affiliation");
      } else {
        params.set("affiliation", query);
      }

      router.push(`${pathName}?${params.toString()}` as Route);
    },
  });

  return form;
};
