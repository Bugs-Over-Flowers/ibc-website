"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchForm } from "../_hooks/useSearchForm";

export default function RegistrationSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const form = useSearchForm();

  const setFilter = (filter: "verified" | "pending" | "all") => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("paymentStatus", filter || "");
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
                <field.TextField
                  className="bg-neutral-200"
                  placeholder="Enter an affiliation"
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton isSubmittingLabel="Searching" label="Search" />
            </form.AppForm>
          </form>
        </div>
        <div className="w-full">
          <div> Payment Status</div>
          <Select
            onValueChange={setFilter}
            value={searchParams.get("paymentStatus") || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                {["verified", "pending", "all"].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
