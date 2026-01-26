import { cookies } from "next/headers";
import { getMembers } from "@/server/members/queries/getMembers";
import { EmptyMembersState } from "./EmptyMembersState";
import { MembersTable } from "./MembersTable";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    sectorName?: string;
    search?: string;
  }>;
}

export default async function MembersList({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  const allowedStatuses = ["paid", "unpaid", "cancelled", "all"] as const;
  const status =
    params.status &&
    (allowedStatuses as readonly string[]).includes(params.status)
      ? (params.status as (typeof allowedStatuses)[number])
      : undefined;

  const filters = {
    status,
    sectorName: params.sectorName,
    search: params.search,
  };

  const members = await getMembers(cookieStore.getAll(), filters);

  if (members.length === 0) {
    return <EmptyMembersState />;
  }

  return <MembersTable members={members} />;
}
