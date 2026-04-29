import { Building2, CreditCard, MapPin, User } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import BackButton from "@/app/admin/_components/BackButton";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMembershipPaymentRequirement } from "@/lib/membership/paymentRules";
import tryCatch from "@/lib/server/tryCatch";
import { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import { toPascalCaseWithSpaces } from "../application/_utils/formatters";
import { ApplicationHeader } from "../application/[id]/_components/ApplicationHeader";

interface ApplicationDetailsProps {
  applicationId: string;
  source: "applications" | "members" | "history";
  memberId?: string;
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

function getPaymentStatusClasses(status?: string): string {
  const normalized = status?.toLowerCase();

  if (normalized === "accepted") {
    return "bg-status-green";
  }

  if (normalized === "rejected") {
    return "bg-status-red";
  }

  return "bg-status-orange";
}

function MemberReviewDetails({
  application,
}: {
  application: Awaited<ReturnType<typeof getApplicationDetailsById>>;
}) {
  const applicationMembers = Array.isArray(application.ApplicationMember)
    ? application.ApplicationMember
    : [];

  const principalRepresentative = applicationMembers.find(
    (member) => member.companyMemberType === "principal",
  );
  const alternateRepresentatives = applicationMembers.filter(
    (member) => member.companyMemberType === "alternate",
  );
  const paymentRequirement = getMembershipPaymentRequirement({
    applicationMemberType: application.applicationMemberType,
    applicationType: application.applicationType,
    previousApplicationMemberType: application.previousApplicationMemberType,
  });

  return (
    <div className="space-y-8">
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
                {application.logoImageURL ? (
                  <Image
                    alt="Company logo"
                    className="h-32 w-32 rounded-lg border border-border/60 bg-muted/20 object-contain p-1"
                    height={128}
                    src={application.logoImageURL}
                    unoptimized
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
              value={application.companyName}
              valueClassName="text-lg"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Application Type"
                value={toPascalCaseWithSpaces(application.applicationType)}
              />
              <DetailRow
                label="Member Type"
                value={toPascalCaseWithSpaces(
                  application.applicationMemberType,
                )}
              />
              {application.applicationType === "updating" && (
                <DetailRow
                  label="Previous Member Type"
                  value={
                    application.previousApplicationMemberType
                      ? toPascalCaseWithSpaces(
                          application.previousApplicationMemberType,
                        )
                      : "N/A"
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Industry Sector"
                value={application.sectorName || "N/A"}
              />
              <DetailRow
                label="Website"
                value={
                  <span
                    className="block max-w-[220px] truncate"
                    title={application.websiteURL || "N/A"}
                  >
                    {application.websiteURL || "N/A"}
                  </span>
                }
              />
            </div>

            <DetailRow
              label="Address"
              value={toPascalCaseWithSpaces(application.companyAddress)}
            />
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
              value={application.emailAddress || "N/A"}
              valueClassName="break-all"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Mobile"
                value={application.mobileNumber || "N/A"}
              />
              <DetailRow
                label="Landline"
                value={application.landline || "N/A"}
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
                    value={
                      principalRepresentative.sex
                        ? toPascalCaseWithSpaces(principalRepresentative.sex)
                        : "N/A"
                    }
                  />
                  <RepresentativeField
                    label="Nationality"
                    value={
                      principalRepresentative.nationality
                        ? toPascalCaseWithSpaces(
                            principalRepresentative.nationality,
                          )
                        : "N/A"
                    }
                  />
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <RepresentativeField
                    label="Position / Designation"
                    value={principalRepresentative.companyDesignation || "N/A"}
                  />
                  <RepresentativeField
                    label="Mailing Address"
                    value={
                      toPascalCaseWithSpaces(
                        principalRepresentative.mailingAddress,
                      ) || "N/A"
                    }
                  />
                </div>
              </div>
            ) : null}

            {alternateRepresentatives.map((representative, index) => (
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
                        Alternate Member {index + 1}
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
                    value={
                      representative.sex
                        ? toPascalCaseWithSpaces(representative.sex)
                        : "N/A"
                    }
                  />
                  <RepresentativeField
                    label="Nationality"
                    value={
                      representative.nationality
                        ? toPascalCaseWithSpaces(representative.nationality)
                        : "N/A"
                    }
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
                    value={toPascalCaseWithSpaces(
                      representative.mailingAddress,
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {paymentRequirement.requiresPayment && (
        <Card className="rounded-2xl border border-border/50 bg-background">
          <CardContent className="space-y-6 px-7 py-0">
            <div className="flex items-center gap-2 font-bold text-primary">
              <CreditCard className="h-5 w-5" />
              <span className="text-base uppercase tracking-wide">
                Payment Information
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Payment Method"
                value={toPascalCaseWithSpaces(
                  application.paymentMethod || "N/A",
                )}
              />
              <DetailRow
                label="Payment Status"
                value={
                  <Badge
                    className={getPaymentStatusClasses(
                      application.paymentProofStatus,
                    )}
                    variant="secondary"
                  >
                    {toPascalCaseWithSpaces(
                      application.paymentProofStatus || "Pending",
                    )}
                  </Badge>
                }
              />
              <DetailRow
                label="Expected Amount"
                value={`P${paymentRequirement.expectedAmount.toLocaleString()}`}
              />
              <DetailRow
                label="Application Date"
                value={new Date(
                  application.applicationDate,
                ).toLocaleDateString()}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getBackLink(
  source: ApplicationDetailsProps["source"],
  memberId?: string,
): { href: Route; label: string } {
  switch (source) {
    case "history":
      return {
        href: `/admin/members/${memberId}/history` as Route,
        label: "Back to Application History",
      };
    case "members":
      return { href: "/admin/members" as Route, label: "Back to Members" };
    default:
      return {
        href: "/admin/application" as Route,
        label: "Back to Applications",
      };
  }
}

export async function ApplicationDetails({
  applicationId,
  source,
  memberId,
}: ApplicationDetailsProps) {
  const cookieStore = await cookies();

  const { data: application, success } = await tryCatch(
    getApplicationDetailsById(applicationId, cookieStore.getAll()),
  );

  if (!success) {
    notFound();
  }

  const backLink = getBackLink(source, memberId);

  return (
    <>
      <BackButton href={backLink.href} label={backLink.label} />

      <ApplicationHeader application={application} />

      <MemberReviewDetails application={application} />
    </>
  );
}
