import { formatDate } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  Info,
  Mail,
  QrCode,
  ScanLine,
  Smartphone,
} from "lucide-react";
import type { Route } from "next";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Image from "next/image";
import Link from "next/link";
import QRDownloader from "@/components/qr/QRDownloader";
import { Button } from "@/components/ui/button";
import { getSuccessPageData } from "@/server/registration/queries/getSuccessPageData";
import QRCodeItem from "./QRCodeItem";

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
    <main className="bg-background px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl p-6 sm:space-y-7 sm:p-8">
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
        <div className="flex items-start gap-4">
          <div className="relative mt-0.5 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
            <div className="relative rounded-full bg-linear-to-br from-primary/20 to-primary/30 p-2.5 ring-1 ring-primary/30">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
              Registration Confirmed
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              You're all set. See the details below and keep your QR code ready.
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        {/* ── Event title block ── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/[0.07] to-transparent p-5 ring-1 ring-primary/25 sm:p-6">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative space-y-1.5">
            <p className="font-semibold text-primary text-xs uppercase tracking-widest">
              Registered Event
            </p>
            <p className="font-bold text-foreground text-xl leading-snug sm:text-2xl">
              {data.registeredEvent.eventTitle}
            </p>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="size-3.5 text-primary" />
              {formatDate(
                data.registeredEvent.eventStartDate,
                "EEEE, MMMM d, yyyy",
              )}
            </div>
          </div>
        </div>

        {/* ── Info rows ── */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-base text-foreground sm:text-lg">
            Registration Details
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoRows.map(({ icon: Icon, label, value, bold }) => (
              <li className="flex items-start gap-3" key={label}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-semibold text-muted-foreground text-xs uppercase leading-none tracking-wider">
                    {label}
                  </p>
                  <p
                    className={`wrap-break-word text-sm leading-relaxed sm:text-[15px] ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    {value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── QR Code — left QR, right instructions ── */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6">
          {/* Section header */}
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <QrCode className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-foreground leading-none">
                Your QR Code
              </h2>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Used for event check-in — keep it accessible
              </p>
            </div>
          </div>

          {/* QR + steps side by side */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
            {/* Left — QR frame */}
            <QRDownloader
              affiliation={data.affiliation}
              email={data.email}
              registrationIdentifier={registrationIdentifier}
            >
              <div className="mx-auto shrink-0 cursor-pointer rounded-2xl border-2 border-border bg-white p-3 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md sm:mx-0">
                <div className="relative size-44">
                  <QRCodeItem
                    encodedRegistrationData={registrationIdentifier}
                  />
                </div>
              </div>
            </QRDownloader>

            {/* Right — step instructions */}
            <ul className="flex flex-col gap-5 sm:max-w-md">
              {qrSteps.map(({ icon: Icon, text }) => (
                <li className="flex items-start gap-3" key={text}>
                  <div className="flex shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm leading-relaxed sm:text-[15px]">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            className="flex-1"
            href={`/events/${data.registeredEvent.eventId}` as Route}
          >
            <Button className="w-full gap-2 font-semibold">
              <ArrowLeft className="size-4" />
              Back to Event
            </Button>
          </Link>
          <Link className="flex-1" href="/events">
            <Button
              className="w-full border-border font-medium text-muted-foreground hover:text-foreground"
              variant="outline"
            >
              Browse All Events
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
