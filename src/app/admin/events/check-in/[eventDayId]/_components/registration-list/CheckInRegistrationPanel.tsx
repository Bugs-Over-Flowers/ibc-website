import { Badge } from "@/components/ui/badge";
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
    <Card className="flex h-full flex-col border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="border-b bg-muted/20 px-6 py-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Registration List</CardTitle>

            <Badge className="rounded-full px-2.5" variant="secondary">
              {registrationList.length}
            </Badge>
          </div>
        </div>
        <div className="mt-4">
          <CheckInRegistrationFilters />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {errorMessage ? (
          <div className="p-8 text-center">
            <p className="text-destructive">{errorMessage}</p>
          </div>
        ) : (
          <div className="h-full">
            <CheckInRegistrationTable
              eventDayId={eventDayId}
              eventId={eventId}
              registrationList={registrationList}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
