"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
        <div className="rounded-2xl border border-border/30 bg-card/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <Input
                className="h-14 rounded-xl border-border/40 bg-background/80 pr-12 pl-12 text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name or sector..."
                type="text"
                value={searchQuery}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-y-0 right-2 flex items-center"
                    exit={{ opacity: 0, scale: 0.8 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      className="h-8 w-8 rounded-full hover:bg-muted/60"
                      onClick={() => setSearchQuery("")}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Sector Filter */}
              <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger
                  className={cn(
                    "inline-flex h-12 flex-1 items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/80 px-4 text-base text-muted-foreground/80 transition-all hover:border-primary/30 hover:bg-background",
                  )}
                >
                  <span
                    className={cn(
                      "truncate",
                      !filterSector && "text-muted-foreground/70",
                    )}
                  >
                    {selectedLabel}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                </PopoverTrigger>
                <PopoverContent className="w-[260px] rounded-xl border-border/50 bg-card p-0 shadow-2xl">
                  <Command className="rounded-xl bg-card p-2">
                    <CommandInput
                      className="h-9 placeholder:text-muted-foreground"
                      placeholder="Search sector..."
                    />
                    <CommandList className="w-[240px]">
                      <CommandEmpty className="text-muted-foreground">
                        No sector found.
                      </CommandEmpty>
                      <CommandGroup className="rounded px-1 py-1">
                        {sectorOptions.map((sector, idx) => (
                          <React.Fragment key={sector.value}>
                            <CommandItem
                              className={cn(
                                "cursor-pointer rounded-lg px-3 py-2 transition-colors",
                                filterSector === sector.value
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "hover:bg-muted/50",
                              )}
                              onSelect={() => {
                                setFilterSector(sector.value);
                                setOpen(false);
                              }}
                              value={sector.value}
                            >
                              <span className="block flex-1">
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
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Results Count */}
              <div className="text-muted-foreground/70 text-sm">
                Showing {filteredCount}{" "}
                {filteredCount === 1 ? "member" : "members"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
