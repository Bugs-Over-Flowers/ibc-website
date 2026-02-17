import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ApplicationDetails } from "@/app/admin/application/[id]/_components/ApplicationDetails";
import tryCatch from "@/lib/server/tryCatch";
import { getMemberById } from "@/server/members/queries/getMemberById";

interface MembersDetailsProps {
  memberId: string;
}

export async function MembersDetails({ memberId }: MembersDetailsProps) {
  const cookieStore = await cookies();

  const { data: member, success } = await tryCatch(
    getMemberById(memberId, cookieStore.getAll()),
  );

  if (!success || !member.primaryApplicationId) {
    notFound();
  }

  return (
    <ApplicationDetails
      applicationId={member.primaryApplicationId}
      source="members"
    />
  );
}
