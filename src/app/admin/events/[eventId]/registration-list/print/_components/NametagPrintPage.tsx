"use client";

import { ArrowDown, ArrowUpDown, Search, Users } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParticipantForPrint } from "@/server/registration/queries/getEventParticipantsForPrint";
import NametagGrid from "./NametagGrid";
import NametagPrintToolbar from "./NametagPrintToolbar";

interface NametagPrintPageProps {
  eventTitle: string;
  participants: ParticipantForPrint[];
}

function groupByAffiliation(participants: ParticipantForPrint[]) {
  const map = new Map<string, ParticipantForPrint[]>();
  for (const p of participants) {
    const key = p.affiliation || "No Affiliation";
    const group = map.get(key);
    if (group) {
      group.push(p);
    } else {
      map.set(key, [p]);
    }
  }
  return map;
}

const sortKeys = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "affiliation", label: "Affiliation" },
];

export default function NametagPrintPage({
  eventTitle,
  participants,
}: NametagPrintPageProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    // new Set(participants.map((p) => p.participantId)),
    new Set(),
  );
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sortKey, setSortKey] =
    useState<(typeof sortKeys)[number]["value"]>("firstName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${eventTitle} — Nametags`,
    pageStyle: "@page { size: A4 portrait; margin: 0; }",
  });

  const filteredParticipants = useMemo(() => {
    let list = participants;

    const q = deferredSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.affiliation.toLowerCase().includes(q) ||
          p.participantIdentifier.toLowerCase().includes(q),
      );
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const cmp =
        sortKey === "firstName"
          ? a.firstName.localeCompare(b.firstName)
          : sortKey === "lastName"
            ? a.lastName.localeCompare(b.lastName)
            : a.affiliation.localeCompare(b.affiliation);
      return cmp * dir;
    });

    return list;
  }, [participants, deferredSearch, sortKey, sortDir]);

  const selectedParticipants = useMemo(
    () => participants.filter((p) => selectedIds.has(p.participantId)),
    [participants, selectedIds],
  );

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === participants.length) {
        return new Set();
      }
      return new Set(participants.map((p) => p.participantId));
    });
  }, [participants]);

  const handleToggleOne = useCallback((participantId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(participantId)) {
        next.delete(participantId);
      } else {
        next.add(participantId);
      }
      return next;
    });
  }, []);

  const handleAffiliationToggle = useCallback(
    (affiliation: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        const allSelected = participants
          .filter((p) => (p.affiliation || "No Affiliation") === affiliation)
          .every((p) => prev.has(p.participantId));

        for (const p of participants) {
          if ((p.affiliation || "No Affiliation") === affiliation) {
            if (allSelected) {
              next.delete(p.participantId);
            } else {
              next.add(p.participantId);
            }
          }
        }
        return next;
      });
    },
    [participants],
  );

  useEffect(() => {
    const handleScroll = () => setShowScrollBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allSelected = selectedIds.size === participants.length;
  const noneSelected = selectedIds.size === 0;

  const affiliationGroups = useMemo(
    () => groupByAffiliation(filteredParticipants),
    [filteredParticipants],
  );

  const searchActive = deferredSearch.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Unified action bar */}
      <NametagPrintToolbar
        allSelected={allSelected}
        handlePrint={() => handlePrint()}
        handleToggleAll={handleToggleAll}
        noneSelected={noneSelected}
        selectedCount={selectedIds.size}
        totalCount={participants.length}
      />

      {/* Search + Sort */}
      <div className="flex items-center gap-2 print:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, affiliation, or identifier..."
            type="text"
            value={search}
          />
        </div>
        <Select
          onValueChange={(v) => setSortKey(v as typeof sortKey)}
          value={sortKey}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue>
              {sortKeys.find((k) => k.value === sortKey)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="firstName">First Name</SelectItem>
            <SelectItem value="lastName">Last Name</SelectItem>
            <SelectItem value="affiliation">Affiliation</SelectItem>
          </SelectContent>
        </Select>
        <Button
          aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          size="icon"
          variant="outline"
        >
          <ArrowUpDown className="size-4" />
        </Button>
      </div>

      {/* Selection list (screen only) */}
      <div className="space-y-6 print:hidden">
        {searchActive && filteredParticipants.length === 0 ? (
          <div className="rounded-xl border border-border border-dashed bg-muted/30 p-8 text-center">
            <Search className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              No participants match your search
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              Try a different name, affiliation, or identifier.
            </p>
          </div>
        ) : (
          Array.from(affiliationGroups).map(([affiliation, group]) => {
            const allInGroupSelected = group.every((p) =>
              selectedIds.has(p.participantId),
            );
            return (
              <div key={affiliation}>
                <div className="mb-2 flex items-center gap-2">
                  <button
                    className="rounded-md px-2 py-0.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => handleAffiliationToggle(affiliation)}
                    type="button"
                  >
                    {allInGroupSelected ? "Deselect" : "Select"} all —{" "}
                    {affiliation}
                  </button>
                </div>
                <div className="space-y-1">
                  {group.map((participant) => {
                    const isSelected = selectedIds.has(
                      participant.participantId,
                    );
                    return (
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          isSelected
                            ? "border-primary/30 bg-primary/5"
                            : "border-border bg-card hover:bg-accent/50"
                        }`}
                        key={participant.participantId}
                      >
                        <input
                          checked={isSelected}
                          className="size-4 accent-primary"
                          onChange={() =>
                            handleToggleOne(participant.participantId)
                          }
                          type="checkbox"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm">
                            {participant.firstName} {participant.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {participant.affiliation || "No affiliation"} ·{" "}
                            <span className="font-mono tracking-wide">
                              {participant.participantIdentifier}
                            </span>
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Hidden print container */}
      <div className="invisible absolute h-0 overflow-hidden">
        <div ref={printRef}>
          <NametagGrid
            eventTitle={eventTitle}
            participants={selectedParticipants}
          />
        </div>
      </div>

      {/* Preview grid (screen only) */}
      <div className="print:hidden" id="nametag-preview">
        {noneSelected ? (
          <div className="rounded-xl border border-border border-dashed bg-muted/30 p-8 text-center">
            <Users className="mx-auto mb-3 size-8 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              No participants selected
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              Select at least one participant from the list above to preview
              nametags.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-4 text-center font-medium text-muted-foreground text-sm">
              Preview — {selectedParticipants.length} nametag
              {selectedParticipants.length !== 1 ? "s" : ""}
            </p>
            <div className="overflow-auto">
              <NametagGrid
                eventTitle={eventTitle}
                participants={selectedParticipants}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scroll-to-preview FAB */}
      {showScrollBtn && !noneSelected && (
        <Button
          aria-label="Scroll to preview"
          className="fixed right-6 bottom-6 z-50 size-12 rounded-full shadow-lg print:hidden"
          onClick={() =>
            document
              .getElementById("nametag-preview")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          size="icon"
        >
          <ArrowDown className="size-5" />
        </Button>
      )}
    </div>
  );
}
