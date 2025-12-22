import { cookies } from "next/headers";
import { getSectors } from "@/server/applications/queries/getMembers";
import MemberFilters from "./MemberFilters";

export default async function FiltersWrapper() {
  const cookieStore = await cookies();
  const sectors = await getSectors(cookieStore.getAll());

  return <MemberFilters sectors={sectors} />;
}
