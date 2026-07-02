"use client";

import { Search, X } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

export default function CheckInParticipantFilters() {
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQueryParam = useMemo(
    () => searchParams.get("check_pq") || "",
    [searchParams],
  );

  const [searchQuery, setSearchQuery] = useState(searchQueryParam);

  useEffect(() => {
    setSearchQuery(searchQueryParam);
  }, [searchQueryParam]);

  const updateSearchParams = (nextQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim() === "") {
      params.delete("check_pq");
    } else {
      params.set("check_pq", nextQuery.trim());
    }

    const nextUrl = `${pathName}?${params.toString()}` as Route;
    const currentUrl = `${pathName}?${searchParams.toString()}` as Route;

    if (nextUrl !== currentUrl) {
      router.push(nextUrl);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
        Search participants
      </span>
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 bg-background pr-8 pl-8 text-sm"
          onBlur={(event) => {
            setSearchQuery(event.target.value);
            updateSearchParams(event.target.value);
          }}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Identifier, name, or affiliation"
          value={searchQuery}
        />
        {searchQuery !== "" && (
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearchQuery("");
              updateSearchParams("");
            }}
            type="button"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
