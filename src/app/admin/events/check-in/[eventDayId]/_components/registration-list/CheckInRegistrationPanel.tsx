import { Badge } from "@/components/ui/badge";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import CheckInRegistrationFilters from "./CheckInRegistrationFilters";
import CheckInRegistrationTable from "./CheckInRegistrationTable";

interface CheckInRegistrationPanelProps {
  errorMessage?: string;
  eventDayId: string;
  eventId: string;
  registrationList: RegistrationItem[];
}

export default function CheckInRegistrationPanel({
  errorMessage,
  eventDayId,
  eventId,
  registrationList,
}: CheckInRegistrationPanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-medium text-sm">Registration List</h2>
          <Badge
            className="rounded-full border-border bg-muted px-2 py-0 font-medium text-[11px] text-muted-foreground"
            variant="outline"
          >
            {registrationList.length}
          </Badge>
        </div>
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
    </div>
  );
}
