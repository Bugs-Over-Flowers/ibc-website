"use client";

import { Search, Users } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReactToPrint } from "react-to-print";
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

export default function NametagPrintPage({
  eventTitle,
  participants,
}: NametagPrintPageProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(participants.map((p) => p.participantId)),
  );
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${eventTitle} — Nametags`,
    pageStyle: "@page { size: A4 portrait; margin: 0; }",
  });

  const filteredParticipants = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.affiliation.toLowerCase().includes(q) ||
        p.registrationIdentifier.toLowerCase().includes(q),
    );
  }, [participants, deferredSearch]);

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

      {/* Search */}
      <div className="relative print:hidden">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-lg border border-border bg-card py-2 pr-4 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, affiliation, or identifier..."
          type="text"
          value={search}
        />
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
                              {participant.registrationIdentifier}
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
      <div className="fixed top-0 left-[-9999px]">
        <div ref={printRef}>
          <NametagGrid
            eventTitle={eventTitle}
            participants={selectedParticipants}
          />
        </div>
      </div>

      {/* Preview grid (screen only) */}
      <div className="print:hidden">
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
    </div>
  );
}
