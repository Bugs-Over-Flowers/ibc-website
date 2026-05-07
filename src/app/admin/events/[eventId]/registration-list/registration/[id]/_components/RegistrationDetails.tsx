"use client";

import { format } from "date-fns";
import {
  Building2,
  CalendarDays,
  CreditCard,
  Hash,
  StickyNote,
  Users,
} from "lucide-react";
import BackButton from "@/app/admin/_components/BackButton";
import RegistrationRowActions from "@/app/admin/events/[eventId]/registration-list/_components/registrations/RegistrationRowActions";
import OnlinePaymentSection from "@/app/admin/events/[eventId]/registration-list/registration/[id]/_components/OnlinePaymentSection";
import ParticipantCard from "@/app/admin/events/[eventId]/registration-list/registration/[id]/_components/ParticipantCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { getRegistrationData } from "@/server/registration/queries/getRegistrationData";
import getStatusColor from "../../_utils/getStatusColor";

interface RegistrationDetailsProps {
  data: Awaited<ReturnType<typeof getRegistrationData>>;
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
  const participantsCount = data.otherParticipants.length + 1;
  const paymentProofStatus = data.paymentProofStatus ?? "pending";
  const sectionCardClass = "rounded-2xl border border-border/50 bg-background";
  const sectionContentClass = "space-y-6 px-6";

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <BackButton back label="Back" />

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

        {data.note && (
          <StatTile
            icon={<StickyNote className="h-4 w-4" />}
            label="Note"
            value={data.note}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
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
                affiliation={data.affiliation}
                contactNumber={data.registrant.contactNumber}
                email={data.registrant.email}
                fullName={`${data.registrant.firstName} ${data.registrant.lastName}`}
                key={data.registrant.participantId}
                participantIdentifier={data.registrant.participantIdentifier}
                registrant={data.registrant.isPrincipal}
              />
              {data.otherParticipants.map((participant) => (
                <ParticipantCard
                  affiliation={data.affiliation}
                  contactNumber={participant.contactNumber}
                  email={participant.email}
                  fullName={`${participant.firstName} ${participant.lastName}`}
                  key={participant.participantId}
                  participantIdentifier={participant.participantIdentifier}
                  registrant={participant.isPrincipal}
                />
              ))}
            </div>
          </CardContent>
        </Card>

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
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Payment Method
                  </span>
                  <span className="font-semibold text-base leading-tight">
                    <span className="block">{data.paymentMethod}</span>
                  </span>
                </div>

                {data.signedUrls && data.signedUrls.length > 0 && (
                  <OnlinePaymentSection
                    paymentProofStatus={paymentProofStatus}
                    proofImageURLs={data.signedUrls}
                    registrationId={data.registrationId}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
