import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ClipboardList,
  Clock,
  Edit,
  Globe,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import BackButton from "@/app/admin/_components/BackButton";
import { EvaluationQRDownloader } from "@/components/qr/EvaluationQRDownloader";
import RichTextDisplay from "@/components/RichTextDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { getEventStats } from "@/server/events/queries/getEventStats";
import AddFacebookLinkButton from "./AddFacebookLinkButton";
import EventScheduleDateTime from "./EventScheduleDateTime";

const EVENT_TIME_ZONE = "Asia/Manila";
const EVENT_TIME_ZONE_LABEL = "PHT";

export default async function EventDetails({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();

  const { data: event, error: eventError } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );
  const { data: stats } = await tryCatch(
    getEventStats(requestCookies, { eventId }),
  );

  if (eventError || !event) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Calendar className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-bold text-2xl">Event not found</h1>
          <p className="max-w-sm text-muted-foreground">
            {typeof eventError === "string"
              ? eventError
              : "This event could not be loaded. It may have been removed or you may not have access."}
          </p>
          <Link
            className="mt-4 flex items-center justify-center gap-1 text-primary transition-colors hover:text-primary/80"
            href={"/admin/events" as Route}
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventStats = stats || {
    event_id: eventId,
    total_registrations: 0,
    verified_registrations: 0,
    pending_registrations: 0,
    participants: 0,
    attended: 0,
    event_days: [],
  };

  const isFinished =
    event.eventEndDate && new Date() > new Date(event.eventEndDate);
  const isDraft = !event.eventType;
  const showEditButton = isDraft || !isFinished;

  const statItems = [
    {
      label: "Total Registrations",
      value: eventStats.total_registrations,
      colorClass: "text-status-blue",
    },
    {
      label: "Verified",
      value: eventStats.verified_registrations,
      colorClass: "text-status-green",
    },
    {
      label: "Pending",
      value: eventStats.pending_registrations,
      colorClass: "text-status-orange",
    },
    {
      label: "Participants",
      value: eventStats.participants,
      colorClass: "text-status-purple",
    },
    {
      label: "Attended",
      value: eventStats.attended,
      colorClass: "text-status-teal",
    },
  ];

  const actionCards = [
    {
      icon: ClipboardList,
      label: "Registration List",
      description:
        "View and manage all registrations, payment verification, and participant details",
      href: `/admin/events/${eventId}/registration-list`,
      iconBg: "bg-status-blue/10",
      iconColor: "text-status-blue",
      variant: "default" as const,
    },
    {
      icon: CheckSquare,
      label: "Check-in List",
      description:
        "View daily attendance records and export check-in data by event day",
      href: `/admin/events/${eventId}/check-in-list`,
      iconBg: "bg-status-green/10",
      iconColor: "text-status-green",
      variant: "outline" as const,
    },
    {
      icon: Star,
      label: "Evaluations",
      description:
        "Review participant feedback, inspect ratings, and export event evaluation responses",
      href: `/admin/events/${eventId}/evaluations`,
      iconBg: "bg-status-yellow/10",
      iconColor: "text-status-yellow",
      variant: "outline" as const,
    },
    {
      icon: Users,
      label: "Sponsored Registrations",
      description:
        "Manage sponsored registration links and track sponsored guest usage",
      href: `/admin/events/${eventId}/sponsored-registrations`,
      iconBg: "bg-status-purple/10",
      iconColor: "text-status-purple",
      variant: "outline" as const,
    },
  ];

  const metaItems = [
    {
      icon: Calendar,
      label: "Date & Time",
      primary: event.eventStartDate ? (
        <EventScheduleDateTime
          isoString={event.eventStartDate}
          timeZone={EVENT_TIME_ZONE}
        />
      ) : (
        "TBA"
      ),
      secondary: event.eventEndDate ? (
        <>
          Until{" "}
          <EventScheduleDateTime
            isoString={event.eventEndDate}
            timeZone={EVENT_TIME_ZONE}
          />{" "}
          ({EVENT_TIME_ZONE_LABEL})
        </>
      ) : event.eventStartDate ? (
        `(${EVENT_TIME_ZONE_LABEL})`
      ) : null,
      allowWrap: true,
    },
    {
      icon: MapPin,
      label: "Venue",
      primary: event.venue || "TBA",
      secondary: null,
    },
    {
      icon: Users,
      label: "Registration Fee",
      primary: event.registrationFee
        ? `₱${event.registrationFee.toLocaleString()}`
        : "Free",
      secondary: null,
      primaryClass: "text-primary font-semibold",
    },
    {
      icon: Globe,
      label: "Published",
      primary: event.publishedAt ? (
        <EventScheduleDateTime
          isoString={event.publishedAt}
          timeZone={EVENT_TIME_ZONE}
        />
      ) : (
        "Not published"
      ),
      secondary: event.publishedAt ? `(${EVENT_TIME_ZONE_LABEL})` : null,
    },
    {
      icon: Clock,
      label: "Last Updated",
      primary: event.updatedAt ? (
        <EventScheduleDateTime
          isoString={event.updatedAt}
          timeZone={EVENT_TIME_ZONE}
        />
      ) : (
        "N/A"
      ),
      secondary: event.updatedAt ? `(${EVENT_TIME_ZONE_LABEL})` : null,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Back Navigation */}
      <div className="flex w-full justify-start">
        <BackButton href={"/admin/events" as Route} label="Back to Events" />
      </div>

      {/* Hero Card */}
      <Card className="overflow-hidden border-border/60 pt-0 shadow-md">
        {/* Cover Image */}
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "4 / 1" }}
        >
          <Image
            alt={event.eventTitle}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1600px) 100vw, 1600px"
            src={event.eventHeaderUrl || "/images/backgrounds/placeholder.jpg"}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

          {/* Overlaid title + badge for visual polish */}
          <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1.5">
                <Badge
                  className="font-medium text-xs uppercase tracking-wide"
                  variant={
                    event.eventType === "public" ? "default" : "secondary"
                  }
                >
                  {event.eventType || "Draft"}
                </Badge>
                <h1 className="max-w-2xl font-bold text-white text-xl leading-tight drop-shadow-sm sm:text-2xl lg:text-3xl">
                  {event.eventTitle}
                </h1>
              </div>
              {/* Action buttons on the image */}
              <div className="flex shrink-0 items-center gap-2">
                <AddFacebookLinkButton
                  eventId={eventId}
                  facebookLink={event.facebookLink}
                />
                <EvaluationQRDownloader
                  eventId={eventId}
                  eventTitle={event.eventTitle}
                />
                {showEditButton && (
                  <Link href={`/admin/events/${eventId}/edit-event` as Route}>
                    <Button
                      className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="space-y-6 p-5 sm:p-6">
          {/* Event ID + Description */}
          <div className="space-y-3">
            <p className="font-mono text-muted-foreground/70 text-xs tracking-wide">
              ID: {event.eventId}
            </p>
            {event.description ? (
              <RichTextDisplay
                className="max-w-3xl text-muted-foreground text-sm leading-relaxed"
                content={event.description}
              />
            ) : (
              <p className="text-muted-foreground text-sm italic">
                No description available.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-border/60 border-t" />

          {/* Meta grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {metaItems.map(
              ({
                icon: Icon,
                label,
                primary,
                secondary,
                primaryClass,
                allowWrap,
              }) => (
                <div className="flex min-w-0 items-start gap-3" key={label}>
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-0.5 font-medium text-muted-foreground text-xs">
                      {label}
                    </p>
                    <p
                      className={`truncate font-medium text-sm ${primaryClass}`}
                    >
                      {primary}
                    </p>
                    {secondary && (
                      <p
                        className={`${allowWrap ? "break-words leading-tight" : "truncate"} text-muted-foreground text-xs`}
                      >
                        {secondary}
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statItems.map(({ label, value, colorClass }) => (
          <Card
            className="border-border/60 shadow-sm transition-shadow hover:shadow-md"
            key={label}
          >
            <CardContent className="space-y-2 p-4">
              <p className="font-medium text-muted-foreground text-xs leading-tight">
                {label}
              </p>
              <div className={`flex items-center gap-2`}>
                <span
                  className={`font-bold text-2xl tabular-nums ${colorClass}`}
                >
                  {value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section heading */}
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-widest">
          Management
        </h2>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actionCards.map(
          ({
            icon: Icon,
            label,
            description,
            href,
            iconBg,
            iconColor,
            variant,
          }) => (
            <Card
              className="group border-border/60 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              key={label}
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-semibold text-sm leading-tight transition-colors group-hover:text-primary">
                      {label}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
                <Link className="mt-auto" href={href as Route}>
                  <Button
                    className="h-9 w-full text-sm"
                    size="sm"
                    variant={variant}
                  >
                    <Icon className="mr-2 h-3.5 w-3.5" />
                    {label}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
