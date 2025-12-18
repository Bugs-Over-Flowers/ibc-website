import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useMemo, useOptimistic } from "react";
import { setParamsOrDelete } from "@/lib/utils";

type FilterScope = "registrations" | "participants";
interface UseSetFilterProps {
  scope: FilterScope;
}

function useSetFilter(options: UseSetFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const s_key = useMemo(() => {
    if (options.scope === "registrations") return "reg_paymentStatus";
    return "q";
  }, [options.scope]);

  const [filter, updateOptimistic] = useOptimistic(
    searchParams.get(s_key) || "",
    (_, newState: string) => (newState !== "" ? newState : "all"),
  );

  const setFilter = (filter: string) => {
    const params = setParamsOrDelete(s_key, filter, ["all"], searchParams);

    const nextUrl = `${pathName}?${params.toString()}` as Route;
    const currentUrl = `${pathName}?${searchParams.toString()}` as Route;

    if (nextUrl !== currentUrl) {
      startTransition(() => {
        updateOptimistic(filter);
        router.push(nextUrl);
      });
    }
  };

  return { filter: filter !== "" ? filter : "all", setFilter };
}

export default useSetFilter;
