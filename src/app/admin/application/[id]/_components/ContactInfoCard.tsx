import { DetailRow } from "@/components/detail-row";

interface ContactInfoCardProps {
  emailAddress: string;
  mobileNumber: string;
  landline: string;
}

export function ContactInfoCard({
  emailAddress,
  mobileNumber,
  landline,
}: ContactInfoCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h2 className="font-semibold leading-none tracking-tight">
          Contact Information
        </h2>
      </div>
      <div className="grid gap-4 p-6 pt-0">
        <DetailRow label="Email" value={emailAddress} />
        <DetailRow label="Mobile" value={mobileNumber} />
        <DetailRow label="Landline" value={landline} />
      </div>
    </div>
  );
}
