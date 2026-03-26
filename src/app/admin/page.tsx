import { cookies } from "next/headers";
import { DashboardClient } from "@/app/admin/_components/dashboard/DashboardClient";
import { getDashboardData } from "@/server/admin/queries/getDashboardData";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const data = await getDashboardData(cookieStore.getAll());

  return <DashboardClient data={data} />;
}
