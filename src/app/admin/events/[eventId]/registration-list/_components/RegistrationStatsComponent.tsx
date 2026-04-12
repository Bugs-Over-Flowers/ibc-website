import { BarChart3, CheckCircle2, Clock3, Users2 } from "lucide-react";
import type { RegistrationListStats as RegistrationListStatsProps } from "@/lib/validation/registration-management";

export default function RegistrationListStats({
  pendingRegistrations,
  totalParticipants,
  totalRegistrations,
  verifiedRegistrations,
}: RegistrationListStatsProps) {
  const verificationRate =
    totalRegistrations > 0
      ? Math.round((verifiedRegistrations / totalRegistrations) * 100)
      : 0;

  const stats = [
    {
      label: "Total registrations",
      icon: Users2,
      value: totalRegistrations.toLocaleString(),
      sub: "All registrations for this event",
      valueClass: "",
    },
    {
      label: "Verified registrations",
      icon: CheckCircle2,
      value: verifiedRegistrations.toLocaleString(),
      sub: `${verificationRate}% verification rate`,
      valueClass: "text-[#27500A] dark:text-[#9FE1CB]",
      progress: verificationRate,
      progressClass: "bg-[#639922] dark:bg-[#97C459]",
    },
    {
      label: "Pending registrations",
      icon: Clock3,
      value: pendingRegistrations.toLocaleString(),
      sub: "Awaiting payment review",
      valueClass: "text-[#633806] dark:text-[#FAC775]",
      progress:
        totalRegistrations > 0
          ? Math.round((pendingRegistrations / totalRegistrations) * 100)
          : 0,
      progressClass: "bg-[#EF9F27] dark:bg-[#FAC775]",
    },
    {
      label: "Total participants",
      icon: BarChart3,
      value: totalParticipants.toLocaleString(),
      sub: "Combined headcount across registrations",
      valueClass: "text-[#185FA5] dark:text-[#85B7EB]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
      {stats.map(
        ({
          label,
          icon: Icon,
          progress,
          progressClass,
          sub,
          value,
          valueClass,
        }) => (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4"
            key={label}
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
              <Icon className="size-3.5" />
              {label}
            </div>
            <div>
              <p className={`font-medium text-3xl leading-none ${valueClass}`}>
                {value}
              </p>
              {progress !== undefined && (
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${progressClass}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <p className="mt-1.5 text-muted-foreground text-xs">{sub}</p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
