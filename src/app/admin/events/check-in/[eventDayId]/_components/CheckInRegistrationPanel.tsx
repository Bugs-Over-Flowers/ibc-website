import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>Registration List</CardTitle>
        <CheckInRegistrationFilters />
      </CardHeader>
      <CardContent className="space-y-3">
        {errorMessage ? (
          <p className="text-destructive text-sm">{errorMessage}</p>
        ) : null}

        <div className="text-muted-foreground text-sm">
          {registrationList.length} result
          {registrationList.length === 1 ? "" : "s"}
        </div>

        <CheckInRegistrationTable
          eventDayId={eventDayId}
          eventId={eventId}
          registrationList={registrationList}
        />
      </CardContent>
    </Card>
  );
}
