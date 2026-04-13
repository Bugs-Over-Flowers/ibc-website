"use client";

import { Search, X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSearchForm } from "@/app/admin/events/[eventId]/registration-list/_hooks/useSearchForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ParticipantsSearchAndFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useSearchForm({ scope: "participants" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit();
  };

  const hasActiveFilters = (searchParams.get("part_q") || "").trim() !== "";

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("part_q");
    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end">
      <form className="flex flex-1 flex-col gap-1" onSubmit={handleSubmit}>
        <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Search participants
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
                  placeholder="Affiliation, participant name, or email"
                  value={field.state.value}
                />
                {field.state.value !== "" && (
                  <button
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      field.handleChange("");
                      clearFilters();
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
                  variant="outline"
                />
              </form.AppForm>
            </div>
          )}
        </form.AppField>
      </form>

      {hasActiveFilters ? (
        <Button
          className="h-9 md:ml-auto"
          onClick={() => {
            clearFilters();
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
