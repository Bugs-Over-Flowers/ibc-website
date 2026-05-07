import { Building2, MapPin, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { useCreateManualMemberStep3 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep3";
import { CompanyProfileDisplay } from "@/components/CompanyProfileDisplay";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Step3ReviewProps {
  form: ReturnType<typeof useCreateManualMemberStep3>["form"];
  memberData: ReturnType<typeof useCreateManualMemberStep3>["memberData"];
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
    <DetailRow
      label={label}
      size="sm"
      value={value}
      valueClassName={valueClassName}
    />
  );
}

function RepresentativeDetailsCard({
  representative,
  memberRole,
  badgeLabel,
}: {
  representative: NonNullable<
    ReturnType<typeof useCreateManualMemberStep3>["memberData"]["step2"]
  >["representatives"][number];
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

export function Step3Review({ memberData }: Step3ReviewProps) {
  const step1 = memberData.step1;
  const step2 = memberData.step2;
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    let logoUrl: string | null = null;
    let profileUrl: string | null = null;

    if (step1?.logoImageURL instanceof File) {
      logoUrl = URL.createObjectURL(step1.logoImageURL);
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview(null);
    }

    if (step1?.companyProfileFile instanceof File) {
      profileUrl = URL.createObjectURL(step1.companyProfileFile);
      setProfilePreview(profileUrl);
    } else {
      setProfilePreview(null);
    }

    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      if (profileUrl) URL.revokeObjectURL(profileUrl);
    };
  }, [step1?.logoImageURL, step1?.companyProfileFile]);

  if (!step1 || !step2) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
        <p className="font-semibold">Error: Missing information</p>
        <p className="text-sm">Please go back and complete all steps.</p>
      </div>
    );
  }

  const logoSrc =
    logoPreview ||
    (typeof step1.logoImageURL === "string" ? step1.logoImageURL : null);
  const principalRepresentative = step2.representatives.find(
    (rep) => rep.companyMemberType === "principal",
  );
  const alternateRepresentatives = step2.representatives.filter(
    (rep) => rep.companyMemberType === "alternate",
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6">
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
                value={step1.companyName}
                valueClassName="text-lg"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Member Type"
                  value={step1.applicationMemberType}
                  valueClassName="capitalize"
                />
                <DetailRow
                  label="Initial Status"
                  value={step1.membershipStatus}
                  valueClassName="capitalize"
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
                value={step1.emailAddress}
                valueClassName="break-all"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label="Mobile" value={step1.mobileNumber} />
                <DetailRow label="Landline" value={step1.landline} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow
                  label="Company Profile"
                  value={
                    <CompanyProfileDisplay
                      companyProfileType={
                        step1.companyProfileType === "file" &&
                        step1.companyProfileFile instanceof File
                          ? step1.companyProfileFile.type === "application/pdf"
                            ? "document"
                            : "image"
                          : "website"
                      }
                      fileName={
                        step1.companyProfileFile instanceof File
                          ? step1.companyProfileFile.name
                          : undefined
                      }
                      websiteURL={
                        step1.companyProfileType === "file"
                          ? profilePreview || undefined
                          : step1.websiteURL || undefined
                      }
                    />
                  }
                />
                <DetailRow label="Address" value={step1.companyAddress} />
              </div>
            </div>
          </CardContent>
        </Card>

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
