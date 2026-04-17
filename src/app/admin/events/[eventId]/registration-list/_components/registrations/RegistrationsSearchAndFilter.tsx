"use client";

import { Search, X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSearchForm } from "@/app/admin/events/[eventId]/registration-list/_hooks/useSearchForm";
import useSetFilter from "@/app/admin/events/[eventId]/registration-list/_hooks/useSetFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaymentProofStatusFilterEnum,
  PaymentProofStatusFilterOptions,
} from "@/lib/validation/utils";

type PaymentStatusFilter = (typeof PaymentProofStatusFilterOptions)[number];

export default function RegistrationSearchAndFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useSearchForm({ scope: "registrations" });

  const { filter, setFilter } = useSetFilter({ scope: "registrations" });
  const searchQueryParam = useMemo(
    () => searchParams.get("reg_q") || "",
    [searchParams],
  );

  const selectedPaymentStatus = useMemo<PaymentStatusFilter>(() => {
    const parsedFilter = PaymentProofStatusFilterEnum.safeParse(filter);

    if (!parsedFilter.success) {
      return "all";
    }

    return parsedFilter.data;
  }, [filter]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  const pushWithParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
  };

  const hasActiveFilters =
    searchQueryParam.trim() !== "" || selectedPaymentStatus !== "all";

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end">
      <form className="flex flex-1 flex-col gap-1" onSubmit={handleSubmit}>
        <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Search registrations
        </span>
        <form.AppField name="searchQuery">
          {(field) => (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoCapitalize="on"
                  autoComplete="off"
                  className="h-9 bg-background pr-8 pl-8 text-sm"
                  onBlur={() => {
                    field.handleBlur();
                  }}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Identifier, affiliation, registrant, or email"
                  value={field.state.value}
                />
                {field.state.value !== "" && (
                  <button
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      field.handleChange("");
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.delete("reg_q");
                      pushWithParams(params);
                    }}
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <form.AppForm>
                <form.SubmitButton
                  className="h-9 shrink-0"
                  isSubmittingLabel="Searching"
                  label="Search"
                />
              </form.AppForm>
            </div>
          )}
        </form.AppField>
      </form>

      <div className="flex flex-col gap-1 md:min-w-[170px]">
        <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Payment status
        </span>
        <Select
          onValueChange={(value) => {
            const parsedFilter = PaymentProofStatusFilterEnum.safeParse(value);

            if (!parsedFilter.success) {
              return;
            }

            setFilter(parsedFilter.data);
          }}
          value={selectedPaymentStatus}
        >
          <SelectTrigger className="h-9 w-full bg-background text-xs">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Payment status</SelectLabel>
              {PaymentProofStatusFilterOptions.map((status) => (
                <SelectItem
                  className="text-sm capitalize"
                  key={status}
                  value={status}
                >
                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters ? (
        <Button
          className="h-9 md:ml-auto"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("reg_q");
            params.delete("reg_paymentStatus");
            pushWithParams(params);
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
