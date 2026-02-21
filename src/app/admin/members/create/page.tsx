import { cookies } from "next/headers";
import { getAllSectors } from "@/server/members/queries/getAllSectors";
import { CreateManualMemberFormWrapper } from "./_components/forms/CreateManualMemberFormWrapper";

export default async function CreateMemberPage() {
  const cookieStore = await cookies();
  const sectors = await getAllSectors(cookieStore.getAll());

  return <CreateManualMemberFormWrapper sectors={sectors} />;
}
