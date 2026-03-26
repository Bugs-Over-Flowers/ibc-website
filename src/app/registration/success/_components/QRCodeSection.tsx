import type { LucideIcon } from "lucide-react";
import { QrCode } from "lucide-react";
import QRDownloader from "@/components/qr/QRDownloader";
import QRCodeItem from "./QRCodeItem";

interface QRStep {
  icon: LucideIcon;
  text: string;
}

interface QRCodeSectionProps {
  qrSteps: QRStep[];
  registrationIdentifier: string;
  email: string;
  affiliation: string;
}

export function QRCodeSection({
  qrSteps,
  registrationIdentifier,
  email,
  affiliation,
}: QRCodeSectionProps) {
  return (
    <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-border/25 sm:p-8">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/30 to-primary/20">
          <QrCode className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-lg leading-none">
            Your QR Code
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Used for event check-in — keep it accessible
          </p>
        </div>
      </div>

      {/* QR + steps side by side */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
        {/* Left — QR frame */}
        <QRDownloader
          affiliation={affiliation}
          email={email}
          registrationIdentifier={registrationIdentifier}
        >
          <div className="mx-auto shrink-0 cursor-pointer rounded-2xl border-2 border-border bg-background p-3 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md sm:mx-0">
            <div className="relative size-44">
              <QRCodeItem encodedRegistrationData={registrationIdentifier} />
            </div>
          </div>
        </QRDownloader>

        {/* Right — step instructions */}
        <ul className="space-y-5 sm:max-w-md">
          {qrSteps.map(({ icon: Icon, text }, index) => (
            <li
              className={`flex gap-4 ${
                index !== qrSteps.length - 1
                  ? "border-primary/15 border-b pb-5"
                  : ""
              }`}
              key={text}
            >
              <div className="shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary/30 to-primary/20">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
