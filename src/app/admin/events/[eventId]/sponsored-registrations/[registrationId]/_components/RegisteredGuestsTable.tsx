"use client";

import { ChevronDown, Mail, Phone } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/db.types";

type RegistrationWithParticipants =
  Database["public"]["Tables"]["Registration"]["Row"] & {
    participants: Database["public"]["Tables"]["Participant"]["Row"][];
    paymentStatus?: string;
    paymentProofStatus?: "pending" | "rejected" | "accepted";
  };

interface RegisteredGuestsTableProps {
  registrations: RegistrationWithParticipants[];
  isLoading?: boolean;
  error?: string | null;
}

export function RegisteredGuestsTable({
  registrations,
  error,
}: RegisteredGuestsTableProps) {
  const router = useRouter();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  if (error) {
    return (
      <div className="rounded-xl border border-yellow-500 bg-yellow-50 p-6 text-center">
        <p className="font-semibold text-sm text-yellow-800">
          Error loading registrations
        </p>
        <p className="mt-1 text-xs text-yellow-700">{error}</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">No registrations yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-semibold text-sm">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Phone
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Guests
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Payment
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => {
              const participants = registration.participants || [];
              const principalParticipant = participants.find(
                (p) => p.isPrincipal,
              );
              const participantCount = participants.length;
              const isExpanded = expandedRowId === registration.registrationId;

              return (
                <React.Fragment key={registration.registrationId}>
                  <tr
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                    onClick={() =>
                      setExpandedRowId(
                        isExpanded ? null : registration.registrationId,
                      )
                    }
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                        {registration.identifier}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">
                        {principalParticipant
                          ? `${principalParticipant.firstName} ${principalParticipant.lastName}`
                          : registration.nonMemberName || "N/A"}
                      </div>
                      {registration.businessMemberId && (
                        <div className="mt-0.5 text-muted-foreground text-xs">
                          Member Registration
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {principalParticipant?.email || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {principalParticipant?.contactNumber || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
                        {participantCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(() => {
                        const displayStatus =
                          registration.paymentProofStatus ||
                          registration.paymentStatus;

                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                              displayStatus === "accepted" ||
                              displayStatus === "verified"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : displayStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {displayStatus || "N/A"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(
                        registration.registrationDate,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/admin/events/${registration.eventId}/registration-list/registration/${registration.registrationId}` as Route,
                          );
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        View Registration
                      </Button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b bg-muted/10">
                      <td className="px-4 py-4" colSpan={8}>
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-semibold text-base">
                              Participants
                              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-sm">
                                {participants.length}
                              </span>
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {participants.map((participant) => (
                              <div
                                className="items-left flex gap-4 rounded-lg border border-border/40 bg-background px-4 py-3 transition-all hover:border-primary/30"
                                key={participant.participantId}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {participant.firstName}{" "}
                                      {participant.lastName}
                                    </span>
                                    {participant.isPrincipal && (
                                      <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary text-xs">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-auto flex gap-6">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4 text-muted-foreground/70" />
                                    <p className="text-muted-foreground text-sm">
                                      {participant.email || "—"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="h-4 w-4 text-muted-foreground/70" />
                                    <p className="text-muted-foreground text-sm">
                                      {participant.contactNumber || "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
