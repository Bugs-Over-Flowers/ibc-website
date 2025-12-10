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
    <div className="w-full flex justify-between flex-col md:flex-row gap-2 md:gap-4">
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
        <Card key={label} className="h-36 w-full">
          <CardContent className="flex flex-col h-full justify-between">
            <div className="flex gap-2 items-center">
              {icon}
              <h3 className="text-lg font-medium">{label}</h3>
            </div>
            <p className={cn("text-lg font-medium", className)}>{data}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
