import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ClipboardList,
  Clock,
  Edit,
  Globe,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { getEventStats } from "@/server/events/queries/getEventStats";

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

  const { data: stats, error: statsError } = await tryCatch(
    getEventStats(requestCookies, { eventId }),
  );

  if (eventError || !event) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-bold text-2xl">Error loading event</h1>
          <p className="text-muted-foreground">
            {typeof eventError === "string" ? eventError : "Event not found"}
          </p>
          <Link href="/admin/events">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
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

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <div>
        <Link href="/admin/events">
          <Button size="sm" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Event Header Card */}
      <Card className="overflow-hidden">
        <div className="relative h-[300px] w-full">
          <Image
            alt={event.eventTitle}
            className="object-cover"
            fill
            priority
            src={event.eventHeaderUrl || "/images/backgrounds/placeholder.jpg"}
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-2xl">{event.eventTitle}</h1>
                <Badge
                  variant={
                    event.eventType === "public" ? "default" : "secondary"
                  }
                >
                  {event.eventType || "Draft"}
                </Badge>
              </div>
              <p className="font-mono text-muted-foreground text-xs">
                ID: {event.eventId}
              </p>
              <p className="max-w-3xl text-muted-foreground">
                {event.description}
              </p>
            </div>
            <Link href={`/admin/events/${eventId}/edit-event` as Route}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Date & Time
                </p>
                <p className="font-medium">
                  {event.eventStartDate
                    ? format(
                        new Date(event.eventStartDate),
                        "MMM d, yyyy, hh:mm a",
                      )
                    : "TBA"}
                </p>
                {event.eventEndDate && (
                  <p className="text-muted-foreground text-sm">
                    to{" "}
                    {format(
                      new Date(event.eventEndDate),
                      "MMM d, yyyy, hh:mm a",
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Venue
                </p>
                <p className="font-medium">{event.venue || "TBA"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Registration Fee
                </p>
                <p className="font-medium text-primary">
                  {event.registrationFee
                    ? `₱${event.registrationFee.toLocaleString()}`
                    : "Free"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Published
                </p>
                <p className="font-medium">
                  {event.publishedAt
                    ? format(
                        new Date(event.publishedAt),
                        "MMM d, yyyy, hh:mm a",
                      )
                    : "Not published"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  Last Updated
                </p>
                <p className="font-medium">
                  {event.updatedAt
                    ? format(new Date(event.updatedAt), "MMM d, yyyy, hh:mm a")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">
              {eventStats.total_registrations}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {eventStats.verified_registrations}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-orange-600">
              {eventStats.pending_registrations}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">
              {eventStats.participants}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-teal-600">
              {eventStats.attended}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">Registration List</h3>
            <p className="mb-6 flex-1 text-muted-foreground text-sm">
              View and manage all registrations, payment verification, and
              participant details
            </p>
            <Link href={`/admin/events/${eventId}/registration-list` as Route}>
              <Button className="w-full" variant="default">
                <ClipboardList className="mr-2 h-4 w-4" />
                View Registration List
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">Check-in List</h3>
            <p className="mb-6 flex-1 text-muted-foreground text-sm">
              View daily attendance records and export check-in data by event
              day
            </p>
            <Link href={`/admin/events/${eventId}/check-in-list` as Route}>
              <Button className="w-full" variant="outline">
                <CheckSquare className="mr-2 h-4 w-4" />
                View Check-in List
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">Event Feedbacks</h3>
            <p className="mb-6 flex-1 text-muted-foreground text-sm">
              View and analyze participant feedback and ratings for this event
            </p>
            <Link href={`/admin/events/${eventId}/feedbacks` as Route}>
              <Button className="w-full" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Feedbacks
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
