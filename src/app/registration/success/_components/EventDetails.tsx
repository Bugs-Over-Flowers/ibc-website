import { formatDate } from "date-fns";
import {
  CreditCard,
  Download,
  Info,
  Mail,
  QrCode,
  ScanLine,
  Smartphone,
} from "lucide-react";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Image from "next/image";
import { getSuccessPageData } from "@/server/registration/queries/getSuccessPageData";
import { EventActions } from "./EventActions";
import { EventHeader } from "./EventHeader";
import { EventTitleBlock } from "./EventTitleBlock";
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

  if (
    !data ||
    !data.registeredEvent ||
    !data.registeredEvent.eventStartDate ||
    !data.registrationDetails
  ) {
    return null;
  }

  const isOnsite = data.registrationDetails?.paymentMethod === "ONSITE";
  const paymentNote = isOnsite
    ? `Pay on-site · ${formatDate(data.registeredEvent.eventStartDate, "MMM d, yyyy")}`
    : "Contact IBC to verify payment";

  const infoRows = [
    {
      icon: Mail,
      label: "Confirmation sent to",
      value: data.email,
      bold: true,
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
      value: "Present your QR code at the event entrance",
      bold: false,
    },
    {
      icon: Info,
      label: "Note",
      value: "Event dates may change — watch for announcements",
      bold: false,
    },
  ];

  const qrSteps = [
    {
      icon: QrCode,
      text: "Your QR code is unique to your registration.",
    },
    {
      icon: Download,
      text: "Download the QR code and save it to your device.",
    },
    {
      icon: Smartphone,
      text: "Present it at the entrance. Covers all attendees you registered.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-7">
      {/* ── Event Header Image ── */}
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

      {/* ── Header ── */}
      <EventHeader
        subtitle="You're all set. See the details below and keep your QR code ready."
        title="Registration Confirmed"
      />

      {/* ── Divider ── */}
      <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

      {/* ── Event title block ── */}
      <EventTitleBlock
        eventStartDate={new Date(data.registeredEvent.eventStartDate)}
        eventTitle={data.registeredEvent.eventTitle}
      />

      {/* ── Info rows ── */}
      <RegistrationDetails infoRows={infoRows} />

      {/* ── QR Code Section ── */}
      <QRCodeSection
        affiliation={data.affiliation}
        email={data.email}
        qrSteps={qrSteps}
        registrationIdentifier={registrationIdentifier}
      />

      {/* ── Actions ── */}
      <EventActions eventId={data.registeredEvent.eventId} />
    </section>
  );
}
