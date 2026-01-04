import { Calendar, CheckCircle, Users } from "lucide-react";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { getApplications } from "@/server/applications/queries/getApplications";

export default async function ApplicationsStats() {
  const cookieStore = await cookies();
  const applications = await getApplications(cookieStore.getAll());

  const counts = applications.reduce(
    (acc, app) => {
      const status = app.applicationStatus as
        | "new"
        | "pending"
        | "approved"
        | "rejected"
        | undefined;
      if (status === "new") acc.new += 1;
      else if (status === "pending") acc.pending += 1;
      else if (status === "approved" || status === "rejected")
        acc.finished += 1;
      return acc;
    },
    { new: 0, pending: 0, finished: 0 },
  );

  const items = [
    {
      label: "New Applications",
      value: counts.new,
      icon: Users,
      colorClass: "text-status-green",
    },
    {
      label: "Pending Interviews",
      value: counts.pending,
      icon: Calendar,
      colorClass: "text-status-blue",
    },
    {
      label: "Finished Meetings",
      value: counts.finished,
      icon: CheckCircle,
      colorClass: "text-status-orange",
    },
  ];

  return (
    <Card className="flex h-full min-h-64 flex-col">
      <CardContent className="flex flex-1 flex-col justify-center gap-4">
        {items.map(({ label, value, icon: Icon, colorClass }) => (
          <div className="flex items-center gap-4" key={label}>
            <div className="rounded-md bg-muted p-2">
              <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
            <div>
              <div className="text-muted-foreground text-sm">{label}</div>
              <div className={`font-semibold text-2xl ${colorClass}`}>
                {value}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
