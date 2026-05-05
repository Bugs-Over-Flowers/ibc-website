import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import tryCatch from "@/lib/server/tryCatch";
import { getAllSectors } from "@/server/members/queries/getAllSectors";
import { getMemberDetailsByBusinessMemberId } from "@/server/members/queries/getMemberDetailsByBusinessMemberId";
import { EditMemberForm } from "./_components/EditMemberForm";

export const metadata: Metadata = {
  title: "Edit Member | Admin",
  description: "Update member information and business details.",
};

type EditMemberPageProps = PageProps<"/admin/members/[id]/edit">;

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();

  // 1. Fetch latest application details and sectors
  const [{ data: memberDetails, success: memberSuccess }, sectors] =
    await Promise.all([
      tryCatch(getMemberDetailsByBusinessMemberId(id, cookieStore.getAll())),
      getAllSectors(cookieStore.getAll()),
    ]);

  if (!memberSuccess || !memberDetails.latestApplication) {
    notFound();
  }

  const latestApplication = memberDetails.latestApplication;
  const principalRepresentative = latestApplication.members.find(
    (member) => member.companyMemberType === "principal",
  );
  const alternateRepresentative = latestApplication.members.find(
    (member) => member.companyMemberType === "alternate",
  );

  if (!principalRepresentative) {
    notFound();
  }

  // 2. Prepare data for form
  const representatives: Array<{
    applicationMemberId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    mobileNumber: string;
    landline: string;
    mailingAddress: string;
    companyDesignation: string;
    companyMemberType: "principal" | "alternate";
    birthdate: string;
    nationality: string;
    sex: "male" | "female";
  }> = [
    {
      ...principalRepresentative,
      companyMemberType: "principal" as const,
      sex: principalRepresentative.sex as "male" | "female",
      mobileNumber: principalRepresentative.mobileNumber,
    },
  ];

  if (alternateRepresentative) {
    representatives.push({
      ...alternateRepresentative,
      companyMemberType: "alternate" as const,
      sex: alternateRepresentative.sex as "male" | "female",
      mobileNumber: alternateRepresentative.mobileNumber,
    });
  }

  const memberData = {
    memberId: memberDetails.businessMemberId,
    applicationId: latestApplication.applicationId,

    // Business Information
    businessName: memberDetails.businessName,
    websiteURL: memberDetails.websiteURL || "",
    logoImageURL: memberDetails.logoImageURL ?? undefined,
    sectorId: memberDetails.sectorId?.toString() ?? "",
    companyAddress: latestApplication.companyAddress || "",
    companyProfileType: latestApplication.companyProfileType,

    // Contact Information
    emailAddress: latestApplication.emailAddress || "",
    landline: latestApplication.landline || "",
    mobileNumber: latestApplication.mobileNumber,

    // Applicant Representatives
    representatives,

    // Membership Details
    membershipStatus: memberDetails.membershipStatus as
      | "paid"
      | "unpaid"
      | "cancelled"
      | null,
    joinDate: memberDetails.joinDate,
    membershipExpiryDate: memberDetails.membershipExpiryDate
      ? new Date(memberDetails.membershipExpiryDate).toISOString().split("T")[0]
      : "",
  };

  return (
    <div className="container mx-auto py-8">
      <EditMemberForm member={memberData} sectors={sectors} />
    </div>
  );
}
