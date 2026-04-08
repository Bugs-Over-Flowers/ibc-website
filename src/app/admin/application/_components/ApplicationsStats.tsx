import { Calendar, CheckCircle, Users } from "lucide-react";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
      iconClass: "text-status-green",
      valueClass: "text-status-green",
      iconWrapperClass: "bg-status-green/15",
    },
    {
      label: "Pending Interviews",
      value: counts.pending,
      icon: Calendar,
      iconClass: "text-status-blue",
      valueClass: "text-status-blue",
      iconWrapperClass: "bg-status-blue/15",
    },
    {
      label: "Finished Meetings",
      value: counts.finished,
      icon: CheckCircle,
      iconClass: "text-status-orange",
      valueClass: "text-status-orange",
      iconWrapperClass: "bg-status-orange/15",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(
        ({
          label,
          value,
          icon: Icon,
          iconClass,
          valueClass,
          iconWrapperClass,
        }) => (
          <Card className="rounded-2xl" key={label}>
            <CardContent className="flex items-center gap-4 px-6">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl border border-border/70",
                  iconWrapperClass,
                )}
              >
                <Icon className={cn("size-5", iconClass)} />
              </div>

              <div className="min-w-0">
                <div className="truncate text-muted-foreground text-sm">
                  {label}
                </div>
                <div
                  className={cn(
                    "font-semibold text-3xl leading-none",
                    valueClass,
                  )}
                >
                  {value}
                </div>
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
