import { useStore } from "@tanstack/react-form";
import { Building2, MapPin, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import { Card, CardContent } from "@/components/ui/card";
import type { MembershipApplicationData } from "@/hooks/membershipApplication.store";
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

export function Step4Review({ applicationData, sectors }: StepProps) {
  const representativeKeysRef = useRef(new WeakMap<object, string>());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const getRepresentativeKey = (representative: object) => {
    const existingKey = representativeKeysRef.current.get(representative);
    if (existingKey) return existingKey;
    const nextKey = crypto.randomUUID();
    representativeKeysRef.current.set(representative, nextKey);
    return nextKey;
  };

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

  const logoSrc = logoPreview || applicationData.step2.logoImageURL || null;

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
              {applicationData.step3.representatives.map((rep) => {
                const isPrincipal = rep.companyMemberType === "principal";
                return (
                  <div
                    className={cn(
                      "grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border p-4 shadow-sm transition-colors",
                      isPrincipal
                        ? "border-primary/60 bg-primary/5 shadow-primary/10"
                        : "border-border/50 bg-background",
                    )}
                    key={getRepresentativeKey(rep)}
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
                      {rep.firstName?.[0] || ""}
                      {rep.lastName?.[0] || ""}
                    </div>

                    {/* Name + Designation */}
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-tight">
                        {rep.firstName} {rep.lastName}
                      </p>
                      <p className="mt-0.5 truncate text-muted-foreground text-xs">
                        {rep.companyDesignation}
                      </p>
                    </div>

                    {/* Badge */}
                    <span
                      className={cn(
                        "shrink-0 rounded-md border px-2.5 py-1 font-medium text-xs",
                        isPrincipal
                          ? "border-primary/50 bg-primary/10 font-semibold text-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {isPrincipal ? "Principal" : "Alternate"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
