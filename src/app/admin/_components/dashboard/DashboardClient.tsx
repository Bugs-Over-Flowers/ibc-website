import {
  CalendarClock,
  ClipboardList,
  FileWarning,
  Handshake,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/server/admin/queries/getDashboardData";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { StatCard } from "./StatCard";
import { TopSectorsPanel } from "./TopSectorsPanel";

type DashboardClientProps = {
  data: DashboardData;
};

export function DashboardClient({ data }: DashboardClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/70 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-status-green" />
          <span className="font-medium">System status:</span>
          <span className="text-foreground capitalize">
            {data.health.status}
          </span>
        </div>
        <div className="text-muted-foreground">
          <span className="font-medium">Last sync:</span>{" "}
          {new Date(data.health.lastSyncTime).toLocaleString("en-PH")}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          badge={`${data.applications.rejectionRate}% reject`}
          description={`${data.applications.pendingRejections} pending rejection reviews`}
          icon={<ClipboardList className="h-4 w-4" />}
          title="New Applications"
          tone="blue"
          value={String(data.applications.totalNewApplications)}
        />
        <StatCard
          description="Applications awaiting interview schedule"
          icon={<CalendarClock className="h-4 w-4" />}
          title="Pending Interviews"
          tone="amber"
          value={String(data.applications.pendingInterviews)}
        />
        <StatCard
          description="Paid and active member records"
          icon={<UserCheck className="h-4 w-4" />}
          title="Active Members"
          tone="green"
          value={String(data.members.totalActiveMembers)}
        />
        <StatCard
          description="Events happening in the next 7 days"
          icon={<Handshake className="h-4 w-4" />}
          title="Upcoming Events"
          tone="violet"
          value={String(data.events.upcomingEventsNext7Days)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          badge={`+30d: ${data.members.renewalsDueNext30Days}`}
          description="Renewals due this month"
          icon={<FileWarning className="h-4 w-4" />}
          title="Membership Renewals Due"
          tone="amber"
          value={String(data.members.renewalsDueThisMonth)}
        />
        <StatCard
          badge={`${data.events.attendedParticipants}/${data.events.totalParticipants} attended`}
          description={`${data.events.eventsWithLowRegistration} events with low registration`}
          icon={<Users className="h-4 w-4" />}
          title="Event Registrations"
          tone="cyan"
          value={String(data.events.totalRegistrationsAcrossActiveEvents)}
        />
        <StatCard
          badge={`Recent: ${data.evaluations.recentEvaluationCount}`}
          description={`Avg satisfaction: ${data.evaluations.averageSatisfactionScore}/5`}
          icon={<ClipboardList className="h-4 w-4" />}
          title="Evaluations Pending"
          tone="blue"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard
              badge={`${data.sponsoredRegistrations.activeSponsoredLinks} active`}
              description="Overall conversion rate across sponsored links"
              icon={<Handshake className="h-4 w-4" />}
              title="Sponsored Link Conversions"
              tone="violet"
              value={`${data.sponsoredRegistrations.usageRate}%`}
            />
            <StatCard
              badge={`${data.members.totalActiveMembers} active`}
              description="Members currently marked inactive or expired"
              icon={<FileWarning className="h-4 w-4" />}
              title="Inactive / Expired Members"
              tone="rose"
              value={String(data.members.totalInactiveOrExpiredMembers)}
            />
          </div>
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
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-border/50 bg-background/80 px-3 py-2"
                  key={link.sponsoredRegistrationId}
                >
                  <span className="line-clamp-1 font-medium text-sm">
                    {link.label}
                  </span>
                  <span className="text-right text-muted-foreground text-xs tabular-nums">
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
        </div>
      </section>
    </div>
  );
}
