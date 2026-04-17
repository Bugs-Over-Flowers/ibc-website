"use client";

import { format } from "date-fns";
import { Building2, CalendarDays, CreditCard, Hash, Users } from "lucide-react";
import type { Route } from "next";
import { useParams } from "next/navigation";
import BackButton from "@/app/admin/_components/BackButton";
import RegistrationRowActions from "@/app/admin/events/[eventId]/registration-list/_components/registrations/RegistrationRowActions";
import OnlinePaymentSection from "@/app/admin/events/[eventId]/registration-list/registration/[id]/_components/OnlinePaymentSection";
import ParticipantCard from "@/app/admin/events/[eventId]/registration-list/registration/[id]/_components/ParticipantCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { getRegistrationData } from "@/server/registration/queries/getRegistrationData";

interface RegistrationDetailsProps {
  data: Awaited<ReturnType<typeof getRegistrationData>>;
}

function DetailRow({
  label,
  value,
  valueClassName,
  truncate,
  valueTitle,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  truncate?: boolean;
  valueTitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`font-semibold text-base leading-tight ${valueClassName ?? ""}`}
        title={valueTitle}
      >
        <span className={cn("block", truncate && "truncate")}>{value}</span>
      </span>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  valueClassName,
  truncate,
  valueTitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  truncate?: boolean;
  valueTitle?: string;
}) {
  return (
    <div className="h-full rounded-xl border border-border/50 bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="shrink-0">{icon}</span>
        <p className="font-medium text-[11px] uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-2 font-semibold text-foreground text-sm",
          truncate && "truncate",
          valueClassName,
        )}
        title={valueTitle}
      >
        {value}
      </p>
    </div>
  );
}

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function RegistrationDetails({
  data,
}: RegistrationDetailsProps) {
  const { eventId } = useParams();
  const participantsCount = data.otherParticipants.length + 1;
  const paymentProofStatus = data.paymentProofStatus ?? "pending";
  const sectionCardClass = "rounded-2xl border border-border/50 bg-background";
  const sectionContentClass = "space-y-6 px-6";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200";
      case "pending":
        return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200";
      case "rejected":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <BackButton
        href={`/admin/events/${eventId as string}/registration-list` as Route}
        label="Back to Registration List"
      />

      <div className="space-y-6 rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-3xl space-y-3">
            <h1 className="font-bold text-3xl text-foreground">
              Registration Details
            </h1>
            <p className="text-muted-foreground text-sm">
              for{" "}
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                {data.event.eventTitle}
              </span>
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-muted-foreground text-xs">
              <CalendarDays className="h-3.5 w-3.5" />
              Registered on
              <span className="font-semibold text-foreground">
                {format(new Date(data.registrationDate), "MMMM dd, yyyy")}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Quick snapshot for identity, payment, and participants before you
              review full details below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "px-4 py-2 font-semibold text-sm",
                getStatusColor(paymentProofStatus),
              )}
              variant="outline"
            >
              {formatStatusLabel(paymentProofStatus)}
            </Badge>

            <RegistrationRowActions
              data={{
                affiliation: data.affiliation,
                registrationIdentifier: data.registrationIdentifier,
                email: data.registrant.email,
                registrationId: data.registrationId,
                paymentMethod: data.paymentMethod,
                paymentProofStatus: data.paymentProofStatus,
                registrantName: `${data.registrant.firstName} ${data.registrant.lastName}`,
              }}
              eventTitle={data.event.eventTitle}
              isDetailsPage
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<Hash className="h-4 w-4" />}
            label="Identifier"
            truncate
            value={data.identifier}
            valueClassName="font-mono text-xs"
            valueTitle={data.identifier}
          />
          <StatTile
            icon={<Building2 className="h-4 w-4" />}
            label="Affiliation"
            truncate
            value={data.affiliation}
            valueTitle={data.affiliation}
          />
          <StatTile
            icon={<CreditCard className="h-4 w-4" />}
            label="Payment Method"
            value={data.paymentMethod}
          />
          <StatTile
            icon={<Users className="h-4 w-4" />}
            label="Participants"
            value={participantsCount}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className={sectionCardClass}>
            <CardContent className={sectionContentClass}>
              <div className="flex items-center gap-2 font-bold text-primary">
                <Building2 className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">
                  Registration Overview
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Event"
                  truncate
                  value={data.event.eventTitle}
                  valueTitle={data.event.eventTitle}
                />
                <DetailRow
                  label="Registration ID"
                  truncate
                  value={data.registrationId}
                  valueTitle={data.registrationId}
                />
                <DetailRow
                  label="Registrant Name"
                  truncate
                  value={`${data.registrant.firstName} ${data.registrant.lastName}`}
                  valueTitle={`${data.registrant.firstName} ${data.registrant.lastName}`}
                />
                <DetailRow
                  label="Registrant Email"
                  truncate
                  value={data.registrant.email}
                  valueTitle={data.registrant.email}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={sectionCardClass}>
            <CardContent className={sectionContentClass}>
              <div className="flex items-center gap-2 font-bold text-primary">
                <Users className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">
                  Participants
                </span>
                <Badge className="ml-1" variant="secondary">
                  {participantsCount}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <ParticipantCard
                  contactNumber={data.registrant.contactNumber}
                  email={data.registrant.email}
                  fullName={`${data.registrant.firstName} ${data.registrant.lastName}`}
                  key={data.registrant.participantId}
                  registrant={data.registrant.isPrincipal}
                />
                {data.otherParticipants.map((participant) => (
                  <ParticipantCard
                    contactNumber={participant.contactNumber}
                    email={participant.email}
                    fullName={`${participant.firstName} ${participant.lastName}`}
                    key={participant.participantId}
                    registrant={participant.isPrincipal}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className={sectionCardClass}>
            <CardContent className={sectionContentClass}>
              <div className="flex items-center gap-2 font-bold text-primary">
                <CreditCard className="h-5 w-5" />
                <span className="text-base uppercase tracking-wide">
                  Payment Information
                </span>
              </div>

              <div className="space-y-4">
                <DetailRow label="Payment Method" value={data.paymentMethod} />

                {data.signedUrl &&
                typeof data.signedUrl === "string" &&
                data.signedUrl.trim() !== "" ? (
                  <OnlinePaymentSection
                    getStatusColor={getStatusColor}
                    paymentProofStatus={paymentProofStatus}
                    proofImageURL={data.signedUrl.trim()}
                    registrationId={data.registrationId}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No payment proof uploaded for this registration.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
