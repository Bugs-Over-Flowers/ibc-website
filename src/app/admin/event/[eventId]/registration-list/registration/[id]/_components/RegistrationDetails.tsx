"use client";
import { formatDate } from "date-fns";
import { Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RegistrationPage } from "@/lib/validation/registration/registration-list";
import RegistrationRowActions from "../../../_components/RegistrationRowActions";

export default function RegistrationDetails(details: RegistrationPage) {
  const router = useRouter();

  const principalRegistrant = details.participants.filter(
    (p) => p.isPrincipal,
  )[0];

  const otherParticipants = details.participants.filter((p) => !p.isPrincipal);

  return (
    <main className="space-y-2 break-all p-5 md:p-10">
      <Button onClick={() => router.back()}>Back</Button>
      <Card>
        <CardContent>
          <div className="flex justify-between">
            <CardTitle>
              <h2>Registration Details</h2>
            </CardTitle>
            <CardAction>
              <RegistrationRowActions
                data={{
                  email: principalRegistrant.email,
                  eventId: details.event.eventId,
                  registrationId: details.registrationId,
                  paymentStatus: details.paymentStatus,
                }}
                isDetailsPage
              />
            </CardAction>
          </div>
          <div className="pt-3">
            Registered: {formatDate(details.registrationDate, "MMMM dd, yyyy")}
          </div>
          <CardDescription>
            <table className="border-separate border-spacing-3">
              <tbody>
                <tr>
                  <td>
                    <Badge className="w-full">Event</Badge>
                  </td>
                  <td className="px-2 font-bold">{details.event.eventTitle}</td>
                </tr>
                <tr>
                  <td>
                    <Badge>Affiliation</Badge>
                  </td>
                  <td className="px-2">{details.affiliation}</td>
                </tr>
              </tbody>
            </table>
          </CardDescription>
        </CardContent>
        <Separator />
        <CardContent>
          <h3 className="pb-3">People</h3>
          <ParticipantCard
            contactNumber={principalRegistrant.contactNumber}
            customHeader={"Registered by:"}
            email={principalRegistrant.email}
            fullName={`${principalRegistrant.firstName} ${principalRegistrant.lastName}`}
            index={1}
          />
          <div className="py-2 pt-4">Other People</div>
          <div className="space-y-2">
            {otherParticipants.map((participant, idx) => (
              <ParticipantCard
                contactNumber={participant.contactNumber}
                email={participant.email}
                fullName={`${participant.firstName} ${participant.lastName}`}
                index={idx + 2}
                key={participant.participantId}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

interface ParticipantCardProps {
  index: number;
  fullName: string;
  email: string;
  contactNumber: string;
  customHeader?: React.ReactNode;
}
function ParticipantCard({
  index,
  fullName,
  email,
  contactNumber,
  customHeader,
}: ParticipantCardProps) {
  return (
    <Card>
      {customHeader && <CardHeader>{customHeader}</CardHeader>}
      <CardContent className="flex gap-3">
        <div>
          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-300 text-sm">
            {index}
          </div>
        </div>
        <div className="w-full">
          <h4 className="pt-1 font-bold">{fullName}</h4>
          <div className="flex w-full flex-col justify-between gap-5 pt-4 md:flex-row">
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full gap-2">
                <Mail /> Email
              </div>
              <div>{email}</div>
            </div>
            <div className="flex w-full flex-col gap-2">
              <div className="flex gap-2">
                <Phone /> Phone
              </div>
              <div>{contactNumber}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
