"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { getRegistrationData } from "@/server/registration/queries/getRegistrationEventDetails";
import RegistrationRowActions from "../../../_components/RegistrationRowActions";

export default function RegistrationDetails({
  details,
}: {
  details: Awaited<ReturnType<typeof getRegistrationData>>;
}) {
  const router = useRouter();

  // Helper to determine badge color for payment status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200";
      case "pending":
        return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200";
      case "cancelled":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            className="h-9 w-9 shrink-0"
            onClick={() => router.back()}
            size="icon"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">
              Registration Details
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Registered on{" "}
                {format(new Date(details.registrationDate), "MMMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RegistrationRowActions
            data={{
              email: details.registrant.email,
              eventId: details.event.eventId,
              registrationId: details.registrationId,
              paymentStatus: details.paymentStatus,
            }}
            isDetailsPage
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info Column */}
        <div className="space-y-6 md:col-span-2">
          {/* Event & Registration Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Event
                </p>
                <p className="font-medium">{details.event.eventTitle}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Affiliation
                </p>
                <p className="font-medium">{details.affiliation || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Payment Status
                </p>
                <Badge
                  className={cn(
                    "capitalize",
                    getStatusColor(details.paymentStatus),
                  )}
                  variant="outline"
                >
                  {details.paymentStatus}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Registration ID
                </p>
                <p className="break-all font-mono text-muted-foreground text-xs">
                  {details.registrationId}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-lg">
                <Users className="h-5 w-5" />
                Participants
                <Badge className="ml-2" variant="secondary">
                  {details.participants.length}
                </Badge>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {details.participants.map((participant) => (
                <ParticipantCard
                  contactNumber={participant.contactNumber}
                  email={participant.email}
                  fullName={`${participant.firstName} ${participant.lastName}`}
                  isPrincipal={participant.isPrincipal}
                  key={participant.participantId}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Summary Column */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                Primary Contact
              </CardTitle>
              <CardDescription>
                The person who created this registration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {details.registrant.firstName[0]}
                  {details.registrant.lastName[0]}
                </div>
                <div>
                  <p className="font-medium leading-none">
                    {details.registrant.firstName} {details.registrant.lastName}
                  </p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Principal Registrant
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    className="truncate hover:underline"
                    href={`mailto:${details.registrant.email}`}
                  >
                    {details.registrant.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    className="hover:underline"
                    href={`tel:${details.registrant.contactNumber}`}
                  >
                    {details.registrant.contactNumber}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

interface ParticipantCardProps {
  fullName: string;
  email: string;
  contactNumber: string;
  isPrincipal?: boolean;
}

function ParticipantCard({
  fullName,
  email,
  contactNumber,
  isPrincipal,
}: ParticipantCardProps) {
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-sm",
        isPrincipal && "border-primary/50 bg-primary/5",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs",
                isPrincipal
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">{fullName}</CardTitle>
              {isPrincipal && (
                <p className="font-medium text-primary text-xs">Principal</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{contactNumber}</span>
        </div>
      </CardContent>
    </Card>
  );
}
