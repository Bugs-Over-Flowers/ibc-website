import { formatDate } from "date-fns";
import {
  CreditCard,
  Download,
  Info,
  Mail,
  QrCode,
  ScanLine,
  Smartphone,
  Users,
} from "lucide-react";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Image from "next/image";
import { getSuccessPageData } from "@/server/registration/queries/getSuccessPageData";
import { EventActions } from "./EventActions";
import { EventHeader } from "./EventHeader";
import { EventTitleBlock } from "./EventTitleBlock";
import ParticipantRow from "./ParticipantRow";
import { QRCodeSection } from "./QRCodeSection";
import { RegistrationDetails } from "./RegistrationDetails";

interface EventDetailsProps {
  cookieStore: RequestCookie[];
  registrationIdentifier: string;
}

export default async function EventDetails({
  cookieStore,
  registrationIdentifier,
}: EventDetailsProps) {
  const data = await getSuccessPageData(cookieStore, {
    registrationIdentifier,
  });

  if (!data?.registeredEvent?.eventStartDate || !data.registrationDetails) {
    return null;
  }

  const isOnsite = data.registrationDetails?.paymentMethod === "ONSITE";
  const paymentNote = isOnsite
    ? `Pay on-site · ${formatDate(data.registeredEvent.eventStartDate, "MMM d, yyyy")}`
    : "Contact IBC to verify payment";

  const participantCount = data.participants?.length ?? 1;
  const sharedEmailParticipants =
    data.participants?.filter((participant) => participant.email === data.email)
      .length ?? 0;

  const infoRows = [
    {
      icon: Mail,
      label: "Confirmation sent to",
      value: data.email,
      bold: true,
    },
    {
      icon: Users,
      label: "Participants",
      value: `${participantCount} registered`,
      bold: false,
    },
    {
      icon: CreditCard,
      label: data.registrationDetails.paymentMethod,
      value: paymentNote,
      bold: false,
    },
    {
      icon: ScanLine,
      label: "Check-in",
      value: "Present the attendee QR code from the email sent to each inbox",
      bold: false,
    },
    {
      icon: Info,
      label: "Registration QR",
      value:
        "Use the QR below for registration reference and support concerns.",
      bold: false,
    },
  ];

  const qrSteps = [
    {
      icon: QrCode,
      text: "This QR is tied to your registration record, not to a single attendee.",
    },
    {
      icon: Download,
      text: "Download it so you can quickly reference your registration if support needs it.",
    },
    {
      icon: Smartphone,
      text: "Each attendee QR code was sent by email and should be used for event entrance check-in.",
    },
  ];

  const participantEmailNote =
    sharedEmailParticipants > 1
      ? `This inbox received attendee QR codes for ${sharedEmailParticipants} people registered under ${data.email}. Other inboxes only received the attendee QR codes assigned to their email.`
      : "This inbox received the attendee QR code assigned to the registrant email. Other inboxes only received the attendee QR codes assigned to their email.";

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-7">
      {data.registeredEvent.eventHeaderUrl && (
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "4 / 1" }}
        >
          <Image
            alt={data.registeredEvent.eventTitle}
            className="object-contain"
            fill
            priority
            sizes="(max-width: 1600px) 100vw, 1600px"
            src={data.registeredEvent.eventHeaderUrl}
          />
        </div>
      )}

      <EventHeader
        subtitle="Your registration is confirmed. Keep this registration QR handy, and use the attendee QR codes from email for event entrance check-in."
        title="Registration Confirmed"
      />

      <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

      <EventTitleBlock
        eventStartDate={new Date(data.registeredEvent.eventStartDate)}
        eventTitle={data.registeredEvent.eventTitle}
      />

      {/* ── Participant List ── */}
      {data.participants && data.participants.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-5">
          <div className="space-y-1">
            <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
              Registered Participants
            </h3>
            <p className="text-muted-foreground text-sm">
              Everyone listed here has an attendee-specific QR code delivered to
              the email address shown for that person.
            </p>
          </div>
          <div className="divide-y divide-border/50">
            {data.participants.map((p) => (
              <ParticipantRow
                affiliation={data.affiliation}
                email={p.email}
                isPrincipal={p.isPrincipal}
                key={p.participantIdentifier}
                name={p.name}
                participantIdentifier={p.participantIdentifier}
              />
            ))}
          </div>
        </div>
      )}

      <RegistrationDetails infoRows={infoRows} />

      <QRCodeSection
        affiliation={data.affiliation}
        email={data.email}
        participantEmailNote={participantEmailNote}
        qrSteps={qrSteps}
        registrationIdentifier={registrationIdentifier}
      />

      <EventActions eventId={data.registeredEvent.eventId} />
    </section>
  );
}
