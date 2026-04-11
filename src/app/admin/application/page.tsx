import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getApplications } from "@/server/applications/queries/getApplications";
import ApplicationsList from "./_components/ApplicationsList";
import { ApplicationsListSkeleton } from "./_components/ApplicationsListSkeleton";
import ApplicationsTabs from "./_components/ApplicationsTabs";
import ApplicationsPageLoading from "./loading";

export const metadata: Metadata = {
  title: "Membership Applications | Admin",
  description: "Manage membership applications and schedule interviews",
};

export default async function ApplicationsPage() {
  const cookieStore = await cookies();
  const applications = await getApplications(cookieStore.getAll());

  const counts = applications.reduce(
    (acc, app) => {
      const status = app.applicationStatus as
        | "new"
        | "pending"
        | "approved"
        | "rejected"
        | undefined;

      if (status === "new") {
        acc.new += 1;
      } else if (status === "pending") {
        acc.pending += 1;
      } else if (status === "approved" || status === "rejected") {
        acc.finished += 1;
      }

      return acc;
    },
    { new: 0, pending: 0, finished: 0 },
  );

  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<ApplicationsPageLoading />}>
        <div>
          <h1 className="font-bold text-3xl text-foreground">
            Membership Applications
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage membership applications and schedule interviews
          </p>
        </div>

        <ApplicationsTabs
          counts={counts}
          finishedApplications={
            <Suspense fallback={<ApplicationsListSkeleton />}>
              <ApplicationsList status="finished" />
            </Suspense>
          }
          newApplications={
            <Suspense fallback={<ApplicationsListSkeleton />}>
              <ApplicationsList status="new" />
            </Suspense>
          }
          pendingApplications={
            <Suspense fallback={<ApplicationsListSkeleton />}>
              <ApplicationsList status="pending" />
            </Suspense>
          }
        />
      </Suspense>
    </div>
  );
}
