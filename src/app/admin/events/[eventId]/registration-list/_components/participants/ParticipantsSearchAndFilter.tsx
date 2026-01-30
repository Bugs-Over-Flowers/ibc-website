"use client";

import { X } from "lucide-react";
import { useSearchForm } from "@/app/admin/events/[eventId]/registration-list/_hooks/useSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function ParticipantsSearchAndFilter() {
  const form = useSearchForm({ scope: "participants" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card>
      <CardContent className="flex w-full flex-col gap-10 lg:flex-row">
        <div className="w-full">
          <div>Search Participant</div>

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
      </CardContent>
    </Card>
  );
}
