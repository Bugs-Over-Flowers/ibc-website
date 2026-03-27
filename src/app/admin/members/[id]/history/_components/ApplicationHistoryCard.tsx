import { ExternalLink, Eye, Mail, MapPin, Phone, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApplicationHistoryItem } from "@/server/applications/queries/getApplicationHistory";

interface ApplicationHistoryCardProps {
  application: ApplicationHistoryItem;
  memberId: string;
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

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

  const detailHref =
    `/admin/application/${application.applicationId}?source=history&memberId=${memberId}` as Route;

  return (
    <div
      className={cn(
        "group relative w-full rounded-xl border bg-card text-card-foreground",
        "transition-all duration-200",
        "hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg",
      )}
    >
      {/* Action Buttons — Desktop hover reveal */}
      <div className="absolute top-5 right-5 z-10 hidden shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
        <Link href={detailHref}>
          <Button
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            size="icon"
            title="View application details"
            type="button"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={detailHref} rel="noopener noreferrer" target="_blank">
          <Button
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            size="icon"
            title="Open in new tab"
            type="button"
            variant="ghost"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Main clickable body */}
      <Link className="block" href={detailHref}>
        <button className="w-full cursor-pointer text-left" type="button">
          <div className="flex flex-col gap-5 p-5">
            {/* ── Header ── */}
            <div className="min-w-0 space-y-1 sm:pr-24">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-5 shrink-0 items-center rounded-full border px-2 font-semibold text-xs uppercase tracking-wide",
                    getStatusStyle(application.applicationStatus),
                  )}
                >
                  {application.applicationStatus.charAt(0).toUpperCase() +
                    application.applicationStatus.slice(1)}
                </span>
                <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-primary/30 bg-primary/10 px-2 font-semibold text-primary text-xs uppercase tracking-wide">
                  {getApplicationTypeLabel(application.applicationType)}
                </span>
                <span className="inline-flex h-5 shrink-0 items-center rounded-full border px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  {application.applicationMemberType === "corporate"
                    ? "Corporate"
                    : "Personal"}
                </span>
              </div>
              <h3 className="font-semibold text-base text-foreground">
                {application.companyName}
              </h3>
              <p className="text-muted-foreground text-xs">
                {application.identifier}
              </p>
            </div>

            {/* ── Meta: Date + Sector as labeled columns ── */}
            <div className="grid grid-cols-2 gap-x-4 text-xs">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">{formattedDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sector</p>
                <p className="font-medium text-foreground">
                  {application.sectorName}
                </p>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="-mx-5 border-t" />

            {/* ── Representatives — always 2-col so space is always filled ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Principal
                  </p>
                  {principalMember ? (
                    <p className="truncate font-medium text-foreground text-sm">
                      {principalMember.firstName} {principalMember.lastName}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">None</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Alternate
                  </p>
                  {alternateMember ? (
                    <p className="truncate font-medium text-foreground text-sm">
                      {alternateMember.firstName} {alternateMember.lastName}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">None</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="-mx-5 border-t" />

            {/* ── Contact Details ── */}
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate" title={application.companyAddress}>
                  {application.companyAddress}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate" title={application.emailAddress}>
                  {application.emailAddress}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{application.mobileNumber}</span>
              </div>
            </div>
          </div>
        </button>
      </Link>

      {/* Mobile Actions */}
      <div className="flex items-center justify-end gap-1 border-t px-5 pt-2 pb-3 sm:hidden">
        <Link href={detailHref}>
          <Button
            className="h-8 gap-1.5 text-xs"
            size="sm"
            type="button"
            variant="ghost"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        </Link>
        <Link href={detailHref} rel="noopener noreferrer" target="_blank">
          <Button
            className="h-8 gap-1.5 text-xs"
            size="sm"
            type="button"
            variant="ghost"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </Button>
        </Link>
      </div>
    </div>
  );
}
