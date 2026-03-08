import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import { toPascalCaseWithSpaces } from "../application/_utils/formatters";
import { ApplicationHeader } from "../application/[id]/_components/ApplicationHeader";
import { CompanyInfoCard } from "../application/[id]/_components/CompanyInfoCard";
import { ContactInfoCard } from "../application/[id]/_components/ContactInfoCard";
import { PaymentInfoCard } from "../application/[id]/_components/PaymentInfoCard";
import { RepresentativesCard } from "../application/[id]/_components/RepresentativesCard";

interface ApplicationDetailsProps {
  applicationId: string;
  source: "applications" | "members" | "history";
  memberId?: string;
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
      <Link href={backLink.href}>
        <Button
          className="mb-4 border border-border active:scale-95 active:opacity-80"
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {backLink.label}
        </Button>
      </Link>

      <ApplicationHeader application={application} />

      <CompanyInfoCard
        applicationMemberType={toPascalCaseWithSpaces(
          application.applicationMemberType,
        )}
        applicationType={toPascalCaseWithSpaces(application.applicationType)}
        companyAddress={toPascalCaseWithSpaces(application.companyAddress)}
        companyName={application.companyName}
        sectorName={
          application.Sector?.sectorName
            ? toPascalCaseWithSpaces(application.Sector.sectorName)
            : undefined
        }
        websiteURL={application.websiteURL}
      />

      <ContactInfoCard
        emailAddress={application.emailAddress}
        landline={application.landline}
        mobileNumber={application.mobileNumber}
      />

      <RepresentativesCard members={application.ApplicationMember} />

      <PaymentInfoCard
        applicationDate={new Date(application.applicationDate)}
        paymentMethod={application.paymentMethod}
        paymentProofStatus={toPascalCaseWithSpaces(
          application.paymentProofStatus,
        )}
      />
    </>
  );
}
