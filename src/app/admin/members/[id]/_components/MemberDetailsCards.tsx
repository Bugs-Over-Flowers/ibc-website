import { Building2, MapPin, User } from "lucide-react";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MemberDetailsByBusinessMemberId } from "@/server/members/queries/getMemberDetailsByBusinessMemberId";

function toLabel(value?: string | null): string {
  if (!value) {
    return "N/A";
  }

  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface MemberDetailsCardsProps {
  member: MemberDetailsByBusinessMemberId;
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

function formatBirthdate(value?: string | null): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MemberDetailsCards({ member }: MemberDetailsCardsProps) {
  const latestApplication = member.latestApplication;
  const principalRepresentative = latestApplication?.members.find(
    (applicationMember) => applicationMember.companyMemberType === "principal",
  );
  const alternateRepresentatives = latestApplication?.members.filter(
    (applicationMember) => applicationMember.companyMemberType === "alternate",
  );

  return (
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
            <DetailRow
              label="Company Name"
              value={member.businessName}
              valueClassName="text-lg"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Industry Sector"
                value={member.sectorName ?? "N/A"}
              />
              <DetailRow
                label="Website"
                value={
                  <span
                    className="block max-w-[220px] truncate"
                    title={member.websiteURL || "N/A"}
                  >
                    {member.websiteURL || "N/A"}
                  </span>
                }
              />
            </div>

            <DetailRow
              label="Company Address"
              value={latestApplication?.companyAddress || "N/A"}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DetailRow
                label="Application Status"
                value={toLabel(latestApplication?.applicationStatus ?? null)}
              />
              <DetailRow
                label="Payment Proof Status"
                value={toLabel(latestApplication?.paymentProofStatus ?? null)}
              />
              <DetailRow
                label="Submitted"
                value={
                  latestApplication
                    ? new Date(
                        latestApplication.applicationDate,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"
                }
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
              value={latestApplication?.emailAddress || "N/A"}
              valueClassName="break-all"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Mobile"
                value={latestApplication?.mobileNumber || "N/A"}
              />
              <DetailRow
                label="Landline"
                value={latestApplication?.landline || "N/A"}
              />
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

          {latestApplication ? (
            <div className="grid gap-3">
              {principalRepresentative ? (
                <div className="rounded-xl border border-primary/60 bg-primary/5 p-4 shadow-primary/10 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
                        {`${principalRepresentative.firstName?.[0] ?? ""}${principalRepresentative.lastName?.[0] ?? ""}` ||
                          "--"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-sm leading-tight">
                          {principalRepresentative.firstName || "N/A"}{" "}
                          {principalRepresentative.lastName || ""}
                        </p>
                        <p className="mt-0.5 text-muted-foreground text-xs">
                          Principal Member
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="border-primary/50 bg-primary/10 font-semibold text-primary"
                      variant="outline"
                    >
                      Principal
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RepresentativeField
                      label="Email Address"
                      value={principalRepresentative.emailAddress || "N/A"}
                      valueClassName="break-all"
                    />
                    <RepresentativeField
                      label="Mobile Number"
                      value={principalRepresentative.mobileNumber || "N/A"}
                    />
                    <RepresentativeField
                      label="Landline"
                      value={principalRepresentative.landline || "N/A"}
                    />
                    <RepresentativeField
                      label="Birthdate"
                      value={formatBirthdate(principalRepresentative.birthdate)}
                    />
                    <RepresentativeField
                      label="Sex"
                      value={toLabel(principalRepresentative.sex)}
                    />
                    <RepresentativeField
                      label="Nationality"
                      value={principalRepresentative.nationality || "N/A"}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RepresentativeField
                      label="Position / Designation"
                      value={
                        principalRepresentative.companyDesignation || "N/A"
                      }
                    />
                    <RepresentativeField
                      label="Mailing Address"
                      value={principalRepresentative.mailingAddress || "N/A"}
                    />
                  </div>
                </div>
              ) : null}

              {alternateRepresentatives?.map((representative) => (
                <div
                  className="rounded-xl border border-border/50 bg-background p-4 shadow-sm"
                  key={representative.applicationMemberId}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-center font-bold text-primary text-sm leading-10">
                        {`${representative.firstName?.[0] ?? ""}${representative.lastName?.[0] ?? ""}` ||
                          "--"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-sm leading-tight">
                          {representative.firstName || "N/A"}{" "}
                          {representative.lastName || ""}
                        </p>
                        <p className="mt-0.5 text-muted-foreground text-xs">
                          Alternate Member
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="border-border text-muted-foreground"
                      variant="outline"
                    >
                      Alternate
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
                      value={toLabel(representative.sex)}
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
              ))}

              {principalRepresentative == null &&
              (!alternateRepresentatives ||
                alternateRepresentatives.length === 0) ? (
                <p className="text-muted-foreground text-sm">
                  No representative records found.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No linked application found for this member.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
