import { CheckCircle, Clock, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RegistrationListStatsProps {
  total: number;
  verified: number;
  pending: number;
}

export default function RegistrationListStats({
  total,
  verified,
  pending,
}: RegistrationListStatsProps) {
  return (
    <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:gap-4">
      {[
        {
          label: "Total Registrations",
          data: total,
          className: "text-blue-600",
          icon: <Users2 />,
        },
        {
          label: "Verified Registrations",
          data: verified,
          className: "text-green-600",
          icon: <CheckCircle />,
        },
        {
          label: "Pending Registrations",
          data: pending,
          className: "text-yellow-600",
          icon: <Clock />,
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
