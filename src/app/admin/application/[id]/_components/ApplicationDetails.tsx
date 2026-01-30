import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import { ApplicationHeader } from "./ApplicationHeader";
import { CompanyInfoCard } from "./CompanyInfoCard";
import { ContactInfoCard } from "./ContactInfoCard";
import { PaymentInfoCard } from "./PaymentInfoCard";
import { ProofImagesCard } from "./ProofImagesCard";
import { RepresentativesCard } from "./RepresentativesCard";

interface ApplicationDetailsProps {
  applicationId: string;
  source: "applications" | "members";
}

export async function ApplicationDetails({
  applicationId,
  source,
}: ApplicationDetailsProps) {
  const cookieStore = await cookies();

  const { data: application, success } = await tryCatch(
    getApplicationDetailsById(applicationId, cookieStore.getAll()),
  );

  if (!success) {
    notFound();
  }

  return (
    <>
      <Link
        href={source === "members" ? "/admin/members" : "/admin/application"}
      >
        <Button
          className="mb-4 border border-border active:scale-95 active:opacity-80"
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {source === "members" ? "Back to Members" : "Back to Applications"}
        </Button>
      </Link>

      <ApplicationHeader application={application} />

      <CompanyInfoCard
        applicationMemberType={application.applicationMemberType}
        applicationType={application.applicationType}
        companyAddress={application.companyAddress}
        companyName={application.companyName}
        sectorName={application.Sector?.sectorName}
        websiteURL={application.websiteURL}
      />

      <ContactInfoCard
        emailAddress={application.emailAddress}
        faxNumber={application.faxNumber}
        landline={application.landline}
        mobileNumber={application.mobileNumber}
      />

      <RepresentativesCard members={application.ApplicationMember} />

      <PaymentInfoCard
        applicationDate={new Date(application.applicationDate)}
        paymentMethod={application.paymentMethod}
        paymentStatus={application.paymentStatus}
      />

      <ProofImagesCard proofImages={application.ProofImage} />
    </>
  );
}
