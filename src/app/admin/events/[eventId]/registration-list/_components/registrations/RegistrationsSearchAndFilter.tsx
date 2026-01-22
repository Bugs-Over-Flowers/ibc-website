"use client";

import { X } from "lucide-react";
import { useSearchForm } from "@/app/admin/events/[eventId]/registration-list/_hooks/useSearchForm";
import useSetFilter from "@/app/admin/events/[eventId]/registration-list/_hooks/useSetFilter";
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

export default function RegistrationSearchAndFilter() {
  const form = useSearchForm({ scope: "registrations" });

  const { filter, setFilter } = useSetFilter({ scope: "registrations" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card>
      <CardContent className="flex w-full flex-col gap-10 lg:flex-row">
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
            <Select onValueChange={setFilter} value={filter}>
              <SelectTrigger className="w-full">
                <SelectValue data-placeholder="Select Payment Status" />
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
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
}
