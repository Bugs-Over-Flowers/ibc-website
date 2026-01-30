import { CheckCircle, Clock, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RegistrationListStats as RegistrationListStatsProps } from "@/lib/validation/registration-management";

export default function RegistrationListStats({
  pendingRegistrations,
  totalParticipants,
  totalRegistrations,
  verifiedRegistrations,
}: RegistrationListStatsProps) {
  return (
    <div className="flex w-full flex-col justify-between gap-2 md:gap-4 lg:flex-row">
      {[
        {
          label: "Total Registrations",
          data: totalRegistrations,
          className: "text-blue-600",
          icon: <Users2 />,
        },
        {
          label: "Verified Registrations",
          data: verifiedRegistrations,
          className: "text-green-600",
          icon: <CheckCircle />,
        },
        {
          label: "Pending Registrations",
          data: pendingRegistrations,
          className: "text-yellow-600",
          icon: <Clock />,
        },
        {
          label: "Total Participants",
          data: totalParticipants,
          className: "text-purple-600",
          icon: <Users2 />,
        },
      ].map(({ label, data, className, icon }) => (
        <Card className="h-36 w-full" key={label}>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium text-lg">{label}</h3>
            </div>
            <p className={cn("font-medium text-lg", className)}>{data}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
