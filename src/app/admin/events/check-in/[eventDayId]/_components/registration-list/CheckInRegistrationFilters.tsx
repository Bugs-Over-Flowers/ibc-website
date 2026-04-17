"use client";

import { Search, X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

function isPaymentStatusFilter(
  value: string | null,
): value is PaymentStatusFilter {
  return PaymentProofStatusFilterEnum.safeParse(value).success;
}

export default function CheckInRegistrationFilters() {
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQueryParam = useMemo(
    () => searchParams.get("check_q") || "",
    [searchParams],
  );

  const selectedPaymentStatus = useMemo<PaymentStatusFilter>(() => {
    const rawValue = searchParams.get("check_paymentStatus") || "all";

    return isPaymentStatusFilter(rawValue) ? rawValue : "all";
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const hasActiveFilters =
    searchQueryParam.trim() !== "" || selectedPaymentStatus !== "all";

  useEffect(() => {
    setSearchQuery(searchQueryParam);
  }, [searchQueryParam]);

  const updateSearchParams = (
    nextQuery: string,
    nextPaymentStatus: PaymentStatusFilter,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim() === "") {
      params.delete("check_q");
    } else {
      params.set("check_q", nextQuery.trim());
    }

    if (nextPaymentStatus === "all") {
      params.delete("check_paymentStatus");
    } else {
      params.set("check_paymentStatus", nextPaymentStatus);
    }

    const nextUrl = `${pathName}?${params.toString()}` as Route;
    const currentUrl = `${pathName}?${searchParams.toString()}` as Route;

    if (nextUrl !== currentUrl) {
      router.push(nextUrl);
    }
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end">
      <form
        className="flex flex-1 flex-col gap-1"
        onSubmit={(event) => {
          event.preventDefault();
          updateSearchParams(searchQuery, selectedPaymentStatus);
        }}
      >
        <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Search registrations
        </span>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 bg-background pr-8 pl-8 text-sm"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Identifier, name, or affiliation"
              value={searchQuery}
            />
            {searchQuery !== "" && (
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchQuery("");
                  updateSearchParams("", selectedPaymentStatus);
                }}
                type="button"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button
            className="h-9 shrink-0"
            size="sm"
            type="submit"
            variant="outline"
          >
            Search
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-1 md:min-w-[170px]">
        <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Payment status
        </span>
        <Select
          onValueChange={(value) => {
            if (!isPaymentStatusFilter(value)) {
              return;
            }

            updateSearchParams(searchQuery, value);
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
            setSearchQuery("");
            updateSearchParams("", "all");
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
