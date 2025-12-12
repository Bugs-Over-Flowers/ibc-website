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
import type { getRegistrationData } from "@/server/registration/queries/getRegistrationData";
import RegistrationRowActions from "../../../_components/registrations/RegistrationRowActions";
import OnlinePaymentSection from "./OnlinePaymentSection";
import ParticipantCard from "./ParticipantCard";

export default function Registrationdata({
  data,
}: {
  data: Awaited<ReturnType<typeof getRegistrationData>>;
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
              Registration data
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Registered on{" "}
                {format(new Date(data.registrationDate), "MMMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RegistrationRowActions
            data={{
              email: data.registrant.email,
              eventId: data.event.eventId,
              registrationId: data.registrationId,
              paymentStatus: data.paymentStatus,
              proofOfPaymentImageURL: data.signedUrl,
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
                <p className="font-medium">{data.event.eventTitle}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Affiliation
                </p>
                <p className="font-medium">{data.affiliation}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Registration ID
                </p>
                <p className="break-all font-mono text-muted-foreground text-xs">
                  {data.registrationId}
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
                  {data.otherParticipants.length + 1}
                </Badge>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  {data.registrant.firstName[0]}
                  {data.registrant.lastName[0]}
                </div>
                <div>
                  <p className="font-medium leading-none">
                    {data.registrant.firstName} {data.registrant.lastName}
                  </p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Registrant
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    className="truncate hover:underline"
                    href={`mailto:${data.registrant.email}`}
                  >
                    {data.registrant.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    className="hover:underline"
                    href={`tel:${data.registrant.contactNumber}`}
                  >
                    {data.registrant.contactNumber}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details Section*/}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                Payment Method
                <span>
                  <Badge> {data.paymentMethod}</Badge>
                </span>
              </div>
              {data.signedUrl && data.signedUrl !== "" && (
                <OnlinePaymentSection
                  getStatusColor={getStatusColor}
                  paymentStatus={data.paymentStatus}
                  proofImageURL={data.signedUrl}
                  registrationId={data.registrationId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
