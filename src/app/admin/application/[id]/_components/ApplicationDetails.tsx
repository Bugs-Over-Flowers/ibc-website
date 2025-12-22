import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getApplicationById } from "@/server/applications/queries/getApplications";
import { ApplicationHeader } from "./ApplicationHeader";
import { CompanyInfoCard } from "./CompanyInfoCard";
import { ContactInfoCard } from "./ContactInfoCard";
import { PaymentInfoCard } from "./PaymentInfoCard";
import { ProofImagesCard } from "./ProofImagesCard";
import { RepresentativesCard } from "./RepresentativesCard";

interface ApplicationDetailsProps {
  applicationId: string;
}

export async function ApplicationDetails({
  applicationId,
}: ApplicationDetailsProps) {
  const cookieStore = await cookies();

  try {
    const application = await getApplicationById(
      applicationId,
      cookieStore.getAll(),
    );

    return (
      <>
        <Link href="/admin/application">
          <Button
            className="mb-4 border border-border"
            size="sm"
            variant="ghost"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Applications
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
  } catch {
    notFound();
  }
}
