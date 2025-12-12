"use client";

import { Filter, Search, SortAsc } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
        <Input
          className="w-full pl-10"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilters("search", e.target.value)}
          placeholder="Search title or venue..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
        <div className="col-span-2 md:flex-1">
          <Select
            defaultValue={searchParams.get("sort") || "date-asc"}
            onValueChange={(value) => updateFilters("sort", value)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <SortAsc size={16} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date ↑</SelectItem>
              <SelectItem value="date-desc">Date ↓</SelectItem>
              <SelectItem value="title-asc">Title A → Z</SelectItem>
              <SelectItem value="title-desc">Title Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 md:flex-1">
          <Select
            defaultValue={searchParams.get("status") || "all"}
            onValueChange={(value) =>
              updateFilters("status", value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
