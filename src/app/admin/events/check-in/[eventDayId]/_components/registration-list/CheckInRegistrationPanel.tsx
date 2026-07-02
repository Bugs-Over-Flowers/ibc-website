"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import type { CheckInDayParticipantListItem } from "@/server/check-in/queries/getEventDayParticipantList";
import CheckInParticipantFilters from "./CheckInParticipantFilters";
import CheckInParticipantTable from "./CheckInParticipantTable";
import CheckInRegistrationFilters from "./CheckInRegistrationFilters";
import CheckInRegistrationTable from "./CheckInRegistrationTable";

type CheckInView = "registrations" | "participants";

const isCheckInView = (value: string | null): value is CheckInView =>
  value === "registrations" || value === "participants";

interface CheckInRegistrationPanelProps {
  errorMessage?: string;
  eventDayId: string;
  eventId: string;
  registrationList: RegistrationItem[];
  participantList: CheckInDayParticipantListItem[];
}

export default function CheckInRegistrationPanel({
  errorMessage,
  eventDayId,
  eventId,
  registrationList,
  participantList,
}: CheckInRegistrationPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view: CheckInView = useMemo(() => {
    const raw = searchParams.get("check_view");
    return isCheckInView(raw) ? raw : "registrations";
  }, [searchParams]);

  const setView = useCallback(
    (next: CheckInView) => {
      if (next === view) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next === "registrations") {
        params.delete("check_view");
      } else {
        params.set("check_view", next);
      }
      const nextUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      router.push(nextUrl as never);
    },
    [pathname, router, searchParams, view],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card">
      <Tabs onValueChange={(v) => setView(v as CheckInView)} value={view}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-sm">Check-in list</h2>
            <Badge
              className="rounded-full border-border bg-muted px-2 py-0 font-medium text-[11px] text-muted-foreground"
              variant="outline"
            >
              {view === "registrations"
                ? registrationList.length
                : participantList.length}
            </Badge>
          </div>
          <TabsList className="h-8">
            <TabsTrigger className="h-6 text-xs" value="registrations">
              Registrations
            </TabsTrigger>
            <TabsTrigger className="h-6 text-xs" value="participants">
              Participants
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="m-0" value="registrations">
          <div className="border-b bg-muted/30 px-5 py-4">
            <CheckInRegistrationFilters />
          </div>
          {errorMessage ? (
            <div className="m-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm">
              {errorMessage}
            </div>
          ) : (
            <CheckInRegistrationTable
              eventDayId={eventDayId}
              eventId={eventId}
              registrationList={registrationList}
            />
          )}
        </TabsContent>

        <TabsContent className="m-0" value="participants">
          <div className="border-b bg-muted/30 px-5 py-4">
            <CheckInParticipantFilters />
          </div>
          <CheckInParticipantTable
            eventDayId={eventDayId}
            eventId={eventId}
            participantList={participantList}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
