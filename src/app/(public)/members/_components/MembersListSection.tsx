import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getAllMembers, getAllSectors } from "@/server/members/queries";
import MembersList from "./MembersList";

export default async function MembersListSection() {
  console.log("[MembersListSection] Fetching members and sectors...");
  const { error: membersError, data: members } = await tryCatch(
    getAllMembers((await cookies()).getAll()),
  );
  console.log("[MembersListSection] Members fetched:", members);
  const { error: sectorsError, data: sectors } = await tryCatch(
    getAllSectors((await cookies()).getAll()),
  );
  console.log("[MembersListSection] Sectors fetched:", sectors);

  const error = membersError || sectorsError;

  if (error) {
    console.log("[MembersListSection] Error fetching members/sectors:", error);
  }
  if (error || !members || !sectors) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No members found.
      </div>
    );
  }

  type Sector = {
    sectorId: number;
    sectorName: string;
  };

  type Member = {
    businessMemberId: string;
    businessName: string;
    sectorId: number;
    logoImageURL?: string | null;
    websiteURL?: string;
  };

  const validSectors = Array.isArray(sectors)
    ? sectors.filter(
        (s): s is Sector =>
          typeof s === "object" &&
          s !== null &&
          "sectorId" in s &&
          "sectorName" in s,
      )
    : [];

  const sectorIdToName = Object.fromEntries(
    validSectors.map((s) => [s.sectorId, s.sectorName]),
  );

  const memberList = members.map((m: Member) => ({
    id: Number(m.businessMemberId),
    businessName: m.businessName,
    sector: sectorIdToName[m.sectorId],
    logoImageURL: m.logoImageURL ?? undefined,
    websiteURL: m.websiteURL ?? undefined,
  }));

  const sectorList = validSectors.map((s) => s.sectorName);

  return <MembersList members={memberList} sectors={sectorList} />;
}
