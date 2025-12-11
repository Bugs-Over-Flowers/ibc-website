"use client";

import { X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import { setParamsOrDelete } from "@/lib/utils";
import { useSearchForm } from "../_hooks/useSearchForm";

export default function RegistrationSearchAndFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const form = useSearchForm();

  const setFilter = (filter: "verified" | "pending" | "all") => {
    const params = setParamsOrDelete(
      "paymentStatus",
      filter,
      ["all"],
      searchParams,
    );
    router.push(`${pathName}?${params.toString()}` as Route);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card className="md:h-32">
      <CardContent className="flex w-full flex-col gap-10 md:flex-row">
        <div className="w-full">
          <div>Search Registration</div>
          <form className="flex items-end gap-2" onSubmit={handleSubmit}>
            <form.AppField name="searchQuery">
              {(field) => (
                <InputGroup className="rounded-md border border-neutral-300 bg-neutral-100">
                  <InputGroupInput
                    autoCapitalize="on"
                    autoComplete="off"
                    onBlur={() => {
                      field.handleBlur();
                      form.handleSubmit();
                    }}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter an affiliation, name, or email"
                    value={field.state.value}
                  />
                  {field.state.value !== "" && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        className="rounded-full"
                        onClick={() => {
                          if (field.state.value !== null) {
                            field.handleChange("");
                            form.handleSubmit();
                          }
                        }}
                        size={"icon-xs"}
                      >
                        <X />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton isSubmittingLabel="Searching" label="Search" />
            </form.AppForm>
          </form>
        </div>
        <div className="w-full">
          <div> Payment Status</div>
          <InputGroup className="w-full rounded-md bg-neutral-100 ring-1 ring-neutral-300">
            <Select
              onValueChange={setFilter}
              value={searchParams.get("paymentStatus") || "all"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Payment Status</SelectLabel>
                  {["all", "verified", "pending"].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputGroupAddon align="inline-end" className="pl-2">
              {searchParams.get("paymentStatus") === "all" && (
                <InputGroupButton
                  className="rounded-full"
                  onClick={() => {
                    setFilter("all");
                  }}
                  size={"icon-xs"}
                >
                  <X />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
}
