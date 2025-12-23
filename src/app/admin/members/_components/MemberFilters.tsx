"use client";

import { Search, X } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberFiltersProps {
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

export default function MemberFilters({ sectors }: MemberFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentSector = searchParams.get("sectorName") || "all";
  const currentSearch = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}` as Route);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFilter("search", searchValue);
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push("/admin/members" as Route);
  };

  const hasActiveFilters =
    currentStatus !== "all" ||
    (currentSector && currentSector !== "all") ||
    currentSearch;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Status Filter */}
          <Select
            onValueChange={(value) => updateFilter("status", value)}
            value={currentStatus}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue aria-label="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>

          {/* Sector Filter */}
          <Select
            onValueChange={(value) => updateFilter("sectorName", value)}
            value={currentSector}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue aria-label="Filter by sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector.sectorId} value={sector.sectorName}>
                  {sector.sectorName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <form className="flex flex-1 gap-2" onSubmit={handleSearchSubmit}>
            <Input
              className="flex-1"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by company name..."
              value={searchValue}
            />
            <Button size="icon" type="submit" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              size="icon"
              title="Clear filters"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
