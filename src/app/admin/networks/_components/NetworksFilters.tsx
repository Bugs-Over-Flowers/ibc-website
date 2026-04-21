import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "./networkForm";

interface NetworksFiltersProps {
  searchQuery: string;
  sortBy: SortOption;
  onSearchQueryChange: (value: string) => void;
  onSortByChange: (value: SortOption) => void;
}

export function NetworksFilters({
  searchQuery,
  sortBy,
  onSearchQueryChange,
  onSortByChange,
}: NetworksFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search by organization"
          value={searchQuery}
        />
      </div>

      <Select
        onValueChange={(value) => onSortByChange(value as SortOption)}
        value={sortBy}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
