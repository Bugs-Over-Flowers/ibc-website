import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import tryCatch from "@/lib/server/tryCatch";
import { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import { getAllSectors } from "@/server/members/queries/getAllSectors";
import { getMemberById } from "@/server/members/queries/getMemberById";
import { EditMemberForm } from "./_components/EditMemberForm";

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();

  // 1. Get Member Identity (to get primaryApplicationId)
  const { data: memberIdentity, success: memberSuccess } = await tryCatch(
    getMemberById(id, cookieStore.getAll()),
  );

  if (!memberSuccess || !memberIdentity.primaryApplicationId) {
    notFound();
  }

  // 2. Fetch Application Details and Sectors
  const [{ data: application, success: appSuccess }, sectors] =
    await Promise.all([
      tryCatch(
        getApplicationDetailsById(
          memberIdentity.primaryApplicationId,
          cookieStore.getAll(),
        ),
      ),
      getAllSectors(cookieStore.getAll()),
    ]);

  if (!appSuccess || !application.BusinessMember) {
    notFound();
  }

  // 3. Prepare data for form
  const memberData = {
    memberId: application.BusinessMember.businessMemberId,
    applicationId: application.applicationId,

    // Business Information
    businessName: application.BusinessMember.businessName,
    websiteURL: application.BusinessMember.websiteURL || "",
    sectorId: application.BusinessMember.sectorId.toString(),
    companyAddress: application.companyAddress,

    // Contact Information
    emailAddress: application.emailAddress,
    landline: application.landline,
    // faxNumber: application.faxNumber || "",
    mobileNumber: application.mobileNumber || "",

    // Membership Details
    membershipStatus: application.BusinessMember.membershipStatus as
      | "paid"
      | "unpaid"
      | "cancelled"
      | null,
    joinDate: application.BusinessMember.joinDate,
    membershipExpiryDate: application.BusinessMember.membershipExpiryDate
      ? new Date(application.BusinessMember.membershipExpiryDate)
          .toISOString()
          .split("T")[0]
      : "",
  };

  return (
    <div className="container mx-auto py-8">
      <EditMemberForm member={memberData} sectors={sectors} />
    </div>
  );
}
