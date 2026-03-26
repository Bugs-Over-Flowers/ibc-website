import {
  Activity,
  CalendarClock,
  ClipboardList,
  FileWarning,
  Handshake,
  RefreshCcw,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/server/admin/queries/getDashboardData";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { StatCard } from "./StatCard";
import { TopSectorsPanel } from "./TopSectorsPanel";

function formatSyncTime(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

type DashboardClientProps = {
  data: DashboardData;
};

export function DashboardClient({ data }: DashboardClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bold text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Core metrics for applications, members, events, sponsored links, and
            evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Activity className="h-4 w-4 text-status-green" />
          <span>System: {data.health.status}</span>
          <span className="opacity-60">|</span>
          <RefreshCcw className="h-3.5 w-3.5" />
          <span>Synced {formatSyncTime(data.health.lastSyncTime)}</span>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          badge={`${data.applications.rejectionRate}% reject`}
          description={`${data.applications.pendingRejections} pending rejection reviews`}
          icon={<ClipboardList className="h-4 w-4" />}
          title="New Applications"
          value={String(data.applications.totalNewApplications)}
        />
        <StatCard
          description="Applications awaiting interview schedule"
          icon={<CalendarClock className="h-4 w-4" />}
          title="Pending Interviews"
          value={String(data.applications.pendingInterviews)}
        />
        <StatCard
          description="Paid and active member records"
          icon={<UserCheck className="h-4 w-4" />}
          title="Active Members"
          value={String(data.members.totalActiveMembers)}
        />
        <StatCard
          description="Events happening in the next 7 days"
          icon={<Handshake className="h-4 w-4" />}
          title="Upcoming Events"
          value={String(data.events.upcomingEventsNext7Days)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          badge={`+30d: ${data.members.renewalsDueNext30Days}`}
          description="Renewals due this month"
          icon={<FileWarning className="h-4 w-4" />}
          title="Membership Renewals Due"
          value={String(data.members.renewalsDueThisMonth)}
        />
        <StatCard
          badge={`${data.events.attendedParticipants}/${data.events.totalParticipants} attended`}
          description={`${data.events.eventsWithLowRegistration} events with low registration`}
          icon={<Users className="h-4 w-4" />}
          title="Event Registrations"
          value={String(data.events.totalRegistrationsAcrossActiveEvents)}
        />
        <StatCard
          badge={`Recent: ${data.evaluations.recentEvaluationCount}`}
          description={`Avg satisfaction: ${data.evaluations.averageSatisfactionScore}/5`}
          icon={<Activity className="h-4 w-4" />}
          title="Evaluations Pending"
          value={String(data.evaluations.pendingEvaluations)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecentActivityPanel initialActivities={data.recentActivity} />
        <div className="space-y-4">
          <QuickActionsPanel />
        </div>
        <div className="space-y-4">
          <TopSectorsPanel sectors={data.members.membersBySector} />
          <StatCard
            badge={`${data.sponsoredRegistrations.activeSponsoredLinks} active`}
            description={
              data.sponsoredRegistrations.topPerformingLinks.length > 0
                ? `Top link: ${data.sponsoredRegistrations.topPerformingLinks[0].label}`
                : "No sponsored links available"
            }
            icon={<Handshake className="h-4 w-4" />}
            title="Sponsored Link Conversions"
            value={`${data.sponsoredRegistrations.usageRate}%`}
          />
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.sponsoredRegistrations.topPerformingLinks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No sponsored links available.
                </p>
              ) : null}

              {data.sponsoredRegistrations.topPerformingLinks.map((link) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background/80 px-3 py-2"
                  key={link.sponsoredRegistrationId}
                >
                  <span className="line-clamp-1 font-medium text-sm">
                    {link.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {link.usedCount}
                    {link.maxSponsoredGuests
                      ? `/${link.maxSponsoredGuests}`
                      : ""}{" "}
                    ({link.conversionRate}%)
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <StatCard
            description="Members marked inactive or expired"
            icon={<FileWarning className="h-4 w-4" />}
            title="Inactive / Expired Members"
            value={String(data.members.totalInactiveOrExpiredMembers)}
          />
        </div>
      </section>
    </div>
  );
}
