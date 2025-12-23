import { DetailRow } from "./DetailRow";

interface CompanyInfoCardProps {
  companyName: string;
  sectorName?: string;
  websiteURL: string;
  companyAddress: string;
  applicationType: string;
  applicationMemberType: string;
}

export function CompanyInfoCard({
  companyName,
  sectorName,
  websiteURL,
  companyAddress,
  applicationType,
  applicationMemberType,
}: CompanyInfoCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h2 className="font-semibold leading-none tracking-tight">
          Company Information
        </h2>
      </div>
      <div className="grid gap-4 p-6 pt-0">
        <DetailRow label="Company Name" value={companyName} />
        <DetailRow label="Sector" value={sectorName || "N/A"} />
        <DetailRow label="Website" value={websiteURL} />
        <DetailRow label="Address" value={companyAddress} />
        <DetailRow label="Application Type" value={applicationType} />
        <DetailRow label="Member Type" value={applicationMemberType} />
      </div>
    </div>
  );
}
