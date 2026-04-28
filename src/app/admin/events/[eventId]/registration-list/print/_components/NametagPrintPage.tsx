"use client";

import { Printer, Users } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import type { ParticipantForPrint } from "@/server/registration/queries/getEventParticipantsForPrint";
import NametagGrid from "./NametagGrid";
import NametagPrintToolbar from "./NametagPrintToolbar";

interface NametagPrintPageProps {
  eventTitle: string;
  participants: ParticipantForPrint[];
}

export default function NametagPrintPage({
  eventTitle,
  participants,
}: NametagPrintPageProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(participants.map((p) => p.participantId)),
  );

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${eventTitle} — Nametags`,
    pageStyle: "@page { size: A4 portrait; margin: 0; }",
  });

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

  const allSelected = selectedIds.size === participants.length;
  const noneSelected = selectedIds.size === 0;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <NametagPrintToolbar
        allSelected={allSelected}
        handleToggleAll={handleToggleAll}
        selectedCount={selectedIds.size}
        totalCount={participants.length}
      />

      {/* Print button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="size-4" />
          <span>
            {selectedParticipants.length} of {participants.length} selected for
            printing
          </span>
        </div>
        <Button className="gap-2" disabled={noneSelected} onClick={handlePrint}>
          <Printer className="size-4" />
          Print Nametags
        </Button>
      </div>

      {/* Selection list (screen only) */}
      <div className="space-y-2 print:hidden">
        {participants.map((participant) => {
          const isSelected = selectedIds.has(participant.participantId);
          return (
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                isSelected
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card hover:bg-accent/50"
              }`}
              key={participant.participantId}
            >
              <input
                checked={isSelected}
                className="size-4 accent-primary"
                onChange={() => handleToggleOne(participant.participantId)}
                type="checkbox"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm">
                  {participant.firstName} {participant.lastName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {participant.affiliation || "No affiliation"} ·{" "}
                  {participant.registrationIdentifier}
                </p>
              </div>
            </label>
          );
        })}
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
              Select at least one participant to preview nametags.
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
