import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AdminDashboardPageSkeleton from "@/app/admin/_components/dashboard/AdminDashboardPageSkeleton";
import { DashboardClient } from "@/app/admin/_components/dashboard/DashboardClient";
import { getDashboardData } from "@/server/admin/queries/getDashboardData";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "View core admin statistics and quick actions",
};

async function DashboardContent() {
  const cookieStore = await cookies();
  const data = await getDashboardData(cookieStore.getAll());

  return <DashboardClient data={data} />;
}

export default function AdminPage() {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<AdminDashboardPageSkeleton />}>
        <div>
          <h1 className="font-bold text-3xl text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Core metrics for applications, members, events, sponsored links, and
            evaluations.
          </p>
        </div>

        <DashboardContent />
      </Suspense>
    </div>
  );
}
