"use client";

import { X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          updateSearchParams(searchQuery, selectedPaymentStatus);
        }}
      >
        <div className="mb-1 text-sm">Search Registration</div>
        <div className="flex items-center gap-2">
          <InputGroup className="rounded-md border border-neutral-300 bg-neutral-100">
            <InputGroupInput
              autoCapitalize="on"
              autoComplete="off"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Enter an identifier, affiliation, name, or email"
              value={searchQuery}
            />
            {searchQuery !== "" && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  className="rounded-full"
                  onClick={() => {
                    setSearchQuery("");
                    updateSearchParams("", selectedPaymentStatus);
                  }}
                  size="icon-xs"
                >
                  <X />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button size="sm" type="submit" variant="outline">
            Search
          </Button>
        </div>
      </form>

      <div>
        <div className="mb-1 text-sm">Payment Status</div>
        <InputGroup className="rounded-md bg-neutral-100 ring-1 ring-neutral-300">
          <Select
            onValueChange={(value) => {
              if (!isPaymentStatusFilter(value)) {
                return;
              }

              updateSearchParams(searchQuery, value);
            }}
            value={selectedPaymentStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue data-placeholder="Select Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Payment Status</SelectLabel>
                {PaymentProofStatusFilterOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </InputGroup>
      </div>
    </div>
  );
}
