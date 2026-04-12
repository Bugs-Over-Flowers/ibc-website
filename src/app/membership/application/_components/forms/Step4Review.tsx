import { Building2, MapPin, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MembershipApplicationData } from "@/hooks/membershipApplication.store";
import { resolveMemberLogoUrl } from "@/lib/storage/memberLogo";
import { cn } from "@/lib/utils";
import type { Sector } from "@/server/membership/queries/getSectors";

interface StepProps {
  form: ReturnType<typeof useMembershipStep4>["form"];
  applicationData: MembershipApplicationData;
  sectors: Sector[];
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn("font-semibold text-base leading-tight", valueClassName)}
      >
        {value}
      </span>
    </div>
  );
}

function formatEnumValue(value?: string): string {
  if (!value) {
    return "N/A";
  }

  return value
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatBirthdate(value?: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "N/A";
  }

  return value.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value?: string): string {
  if (!value) {
    return "N/A";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function RepresentativeField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn("font-semibold text-sm leading-tight", valueClassName)}
      >
        {value}
      </span>
    </div>
  );
}

function RepresentativeDetailsCard({
  representative,
  memberRole,
  badgeLabel,
}: {
  representative: MembershipApplicationData["step3"]["representatives"][number];
  memberRole: string;
  badgeLabel: string;
}) {
  const initials = `${representative.firstName?.[0] ?? ""}${representative.lastName?.[0] ?? ""}`;
  const isPrincipal = representative.companyMemberType === "principal";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm",
        isPrincipal
          ? "border-primary/60 bg-primary/5 shadow-primary/10"
          : "border-border/50 bg-background",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
            {initials || "--"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-sm leading-tight">
              {representative.firstName || "N/A"}{" "}
              {representative.lastName || ""}
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs">{memberRole}</p>
          </div>
        </div>

        <Badge
          className={cn(
            isPrincipal
              ? "border-primary/50 bg-primary/10 font-semibold text-primary"
              : "border-border text-muted-foreground",
          )}
          variant="outline"
        >
          {badgeLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RepresentativeField
          label="Email Address"
          value={representative.emailAddress || "N/A"}
          valueClassName="break-all"
        />
        <RepresentativeField
          label="Mobile Number"
          value={representative.mobileNumber || "N/A"}
        />
        <RepresentativeField
          label="Landline"
          value={representative.landline || "N/A"}
        />
        <RepresentativeField
          label="Birthdate"
          value={formatBirthdate(representative.birthdate)}
        />
        <RepresentativeField
          label="Sex"
          value={capitalize(representative.sex)}
        />
        <RepresentativeField
          label="Nationality"
          value={representative.nationality || "N/A"}
        />
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RepresentativeField
          label="Position / Designation"
          value={representative.companyDesignation || "N/A"}
        />
        <RepresentativeField
          label="Mailing Address"
          value={representative.mailingAddress || "N/A"}
        />
      </div>
    </div>
  );
}

export function Step4Review({ applicationData, sectors }: StepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const sectorName =
    sectors.find(
      (sector) =>
        String(sector.sectorId) === String(applicationData.step2.sectorId),
    )?.sectorName ?? "N/A";

  useEffect(() => {
    if (applicationData.step2.logoImage instanceof File) {
      const url = URL.createObjectURL(applicationData.step2.logoImage);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setLogoPreview(null);
  }, [applicationData.step2.logoImage]);

  const logoSrc =
    logoPreview || resolveMemberLogoUrl(applicationData.step2.logoImageURL);
  const principalRepresentative = applicationData.step3.representatives.find(
    (rep) => rep.companyMemberType === "principal",
  );
  const alternateRepresentatives = applicationData.step3.representatives.filter(
    (rep) => rep.companyMemberType === "alternate",
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Company Profile */}
        <Card className="rounded-2xl border border-border/50 bg-background">
          <CardContent className="space-y-6 px-7 py-0">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Building2 className="h-5 w-5" />
              <span className="text-base uppercase tracking-wide">
                Company Profile
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-0">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Company Logo
                </span>
                <div className="mt-3 flex items-center gap-4">
                  {logoSrc ? (
                    <Image
                      alt="Company logo"
                      className="h-32 w-32 rounded-lg border border-border/60 bg-muted/20 object-contain p-1"
                      height={128}
                      src={logoSrc}
                      width={128}
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-border/60 border-dashed text-muted-foreground text-xs">
                      No logo
                    </div>
                  )}
                </div>
              </div>

              <DetailRow
                label="Company Name"
                value={applicationData.step2.companyName}
                valueClassName="text-lg"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Application Type"
                  value={formatEnumValue(applicationData.step1.applicationType)}
                />
                <DetailRow label="Industry Sector" value={sectorName} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="rounded-2xl border border-border/50 bg-background">
          <CardContent className="space-y-6 px-7 py-0">
            <div className="flex items-center gap-2 font-bold text-primary">
              <MapPin className="h-5 w-5" />
              <span className="text-base uppercase tracking-wide">
                Contact Information
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <DetailRow
                label="Email Address"
                value={applicationData.step2.emailAddress}
                valueClassName="break-all"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Mobile"
                  value={applicationData.step2.mobileNumber}
                />
                <DetailRow
                  label="Website"
                  value={
                    <span
                      className="block max-w-[220px] truncate"
                      title={applicationData.step2.websiteURL || "N/A"}
                    >
                      {applicationData.step2.websiteURL || "N/A"}
                    </span>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Representatives */}
        <Card className="rounded-2xl border border-border/50 bg-background">
          <CardContent className="space-y-6 px-7 py-0">
            <div className="flex items-center gap-2 font-bold text-primary">
              <User className="h-5 w-5" />
              <span className="text-base uppercase tracking-wide">
                Representatives
              </span>
            </div>

            <div className="grid gap-3">
              {principalRepresentative ? (
                <RepresentativeDetailsCard
                  badgeLabel="Principal"
                  memberRole="Principal Member"
                  representative={principalRepresentative}
                />
              ) : null}

              {alternateRepresentatives.map((representative, index) => (
                <RepresentativeDetailsCard
                  badgeLabel="Alternate"
                  key={`${representative.companyMemberType}-${representative.emailAddress}-${representative.mobileNumber}`}
                  memberRole={`Alternate Member ${index + 1}`}
                  representative={representative}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
