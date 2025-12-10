"use client";
import { formatDate } from "date-fns";
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
    <main className="space-y-2 p-5 md:p-10">
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
              />
            </CardAction>
          </div>
          <div>
            Registered: {formatDate(details.registrationDate, "MMMM dd, yyyy")}
          </div>
          <CardDescription>
            <table className="border-separate border-spacing-3">
              <tbody>
                <tr>
                  <td>
                    <Badge className="w-full">Event</Badge>
                  </td>
                  <td className="px-2">{details.event.eventTitle}</td>
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
          <Card>
            <CardHeader>
              <CardTitle>Registered by:</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {principalRegistrant.firstName} {principalRegistrant.lastName}
              </div>
              <div>{principalRegistrant.email}</div>
            </CardContent>
          </Card>
          <div className="py-2 pt-4">Other People</div>
          <div className="space-y-2">
            {otherParticipants.map((participant, idx) => (
              <Card key={participant.participantId}>
                <CardHeader>
                  <CardTitle>Participant {idx + 2}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    {principalRegistrant.firstName}{" "}
                    {principalRegistrant.lastName}
                  </div>
                  <div>{principalRegistrant.email}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
