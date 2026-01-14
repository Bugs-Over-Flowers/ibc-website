"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SectorOption {
  label: string;
  value: string;
}

interface MembersFilterProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterSector: string;
  setFilterSector: (v: string) => void;
  sectors: SectorOption[];
  filteredCount: number;
}
export default function MembersFilter({
  searchQuery,
  setSearchQuery,
  filterSector,
  setFilterSector,
  sectors,
  filteredCount,
}: MembersFilterProps) {
  const [open, setOpen] = React.useState(false);

  const allSectorsOption: SectorOption = { label: "All Sectors", value: "" };
  const sectorOptions = [allSectorsOption, ...sectors];

  const selectedLabel =
    sectorOptions.find((s) => s.value === filterSector)?.label ||
    sectorOptions[0]?.label ||
    "Select sector...";

  return (
    <section className="border-border border-b bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 transform text-foreground/50 drop-shadow-md" />
            <Input
              className="h-[52px] justify-between rounded-xl border border-border/50 bg-white/80 px-5 pl-12 text-foreground shadow-lg ring-1 ring-white/30 backdrop-blur-xl hover:bg-white/90 focus:ring-2 focus:ring-primary/30"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name or sector..."
              type="text"
              value={searchQuery}
            />
          </div>
          {/* Sector Combobox */}
          <div className="w-full sm:w-64">
            <Popover onOpenChange={setOpen} open={open}>
              <PopoverTrigger
                aria-expanded={open}
                className={cn(
                  "h-[52px] w-full min-w-[140px] justify-between rounded-xl",
                  "border border-border/50 bg-white px-5 shadow-lg",
                  "ring-1 ring-white/30 backdrop-blur-xl hover:bg-white/90",
                  "inline-flex items-center",
                )}
                role="combobox"
              >
                <span className="block max-w-[140px] truncate text-left">
                  {selectedLabel}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[260px] rounded-xl border border-border bg-white p-0 text-foreground">
                <Command className="rounded-xl bg-white p-2 text-foreground">
                  <CommandInput
                    className="h-9 bg-white text-foreground placeholder:text-muted-foreground"
                    placeholder="Search sector..."
                  />
                  <CommandList className="w-[240px] bg-white text-foreground/50">
                    <CommandEmpty className="text-muted-foreground">
                      No sector found.
                    </CommandEmpty>
                    <CommandGroup className="rounded bg-white px-1 py-1 text-foreground">
                      <div className="mb-1">
                        {sectorOptions.map((sector, idx) => (
                          <React.Fragment key={sector.value}>
                            <CommandItem
                              className={cn(
                                "wrap-break-word max-w-[200px] cursor-pointer whitespace-normal rounded-lg px-3 py-2 transition-colors hover:bg-primary/50",
                                filterSector === sector.value
                                  ? "bg-accent text-accent-foreground"
                                  : "",
                              )}
                              onSelect={() => {
                                setFilterSector(sector.value);
                                setOpen(false);
                              }}
                              value={sector.value}
                            >
                              <span className="wrap-break-word block max-w-[160px] whitespace-normal">
                                {sector.label}
                              </span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4 text-primary",
                                  filterSector === sector.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                            {idx < sectorOptions.length - 1 && (
                              <hr className="my-1 border-border/30" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="text-muted-foreground text-sm">
          Showing {filteredCount} {filteredCount === 1 ? "member" : "members"}
        </div>
      </div>
    </section>
  );
}
