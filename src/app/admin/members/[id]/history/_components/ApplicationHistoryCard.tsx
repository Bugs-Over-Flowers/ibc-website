/**
 * ApplicationHistoryCard — Clickable card that renders a single application
 * in the member's history timeline.
 *
 * Displays: status badge, application type/membership type, date, company info,
 * contact details, sector, and representative names (principal + alternate).
 *
 * Clicking navigates to the full application detail page at:
 *   /admin/application/[applicationId]?source=history&memberId=[memberId]
 * The `source=history` param tells the detail page to render a "Back to Application History" link.
 */
import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApplicationHistoryItem } from "@/server/applications/queries/getApplicationHistory";

interface ApplicationHistoryCardProps {
  application: ApplicationHistoryItem;
  memberId: string;
}

/** Maps an application status to its corresponding badge color class. */
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "approved":
      return "bg-status-green";
    case "rejected":
      return "bg-status-red";
    case "pending":
      return "bg-yellow-500";
    default:
      return "bg-muted-foreground";
  }
}

/** Converts enum-style application type values (e.g. "newMember") to human-readable labels. */
function getApplicationTypeLabel(type: string): string {
  switch (type) {
    case "newMember":
      return "New Member";
    case "renewal":
      return "Renewal";
    case "updating":
      return "Updating";
    default:
      return type;
  }
}

export function ApplicationHistoryCard({
  application,
  memberId,
}: ApplicationHistoryCardProps) {
  const formattedDate = new Date(
    application.applicationDate,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const principalMember = application.members.find(
    (m) => m.companyMemberType === "principal",
  );
  const alternateMember = application.members.find(
    (m) => m.companyMemberType === "alternate",
  );

  return (
    <Link
      className="block"
      href={
        `/admin/application/${application.applicationId}?source=history&memberId=${memberId}` as Route
      }
    >
      <div className="rounded-xl border border-border bg-card text-card-foreground transition-all duration-200 hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg">
        <div className="p-6">
          {/* Top row: badges and date */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "text-xs",
                  getStatusBadgeClass(application.applicationStatus),
                )}
                variant="default"
              >
                {application.applicationStatus.charAt(0).toUpperCase() +
                  application.applicationStatus.slice(1)}
              </Badge>
              <Badge className="text-xs" variant="outline">
                {getApplicationTypeLabel(application.applicationType)}
              </Badge>
              <Badge className="text-xs" variant="outline">
                {application.applicationMemberType === "corporate"
                  ? "Corporate"
                  : "Personal"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Company info */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg">{application.companyName}</h3>
            <p className="text-muted-foreground text-sm">
              {application.identifier}
            </p>
          </div>

          {/* Details grid */}
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{application.companyAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{application.emailAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{application.mobileNumber}</span>
            </div>
          </div>

          {/* Sector and representative names */}
          <div className="mt-3 flex flex-wrap items-center gap-4 border-border/50 border-t pt-3 text-muted-foreground text-sm">
            <span>
              Sector:{" "}
              <span className="text-foreground">{application.sectorName}</span>
            </span>
            {principalMember && (
              <span>
                Principal:{" "}
                <span className="text-foreground">
                  {principalMember.firstName} {principalMember.lastName}
                </span>
              </span>
            )}
            {alternateMember && (
              <span>
                Alternate:{" "}
                <span className="text-foreground">
                  {alternateMember.firstName} {alternateMember.lastName}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
