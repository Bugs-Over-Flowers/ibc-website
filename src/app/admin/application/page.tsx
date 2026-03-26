import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationsList from "./_components/ApplicationsList";
import { ApplicationsListSkeleton } from "./_components/ApplicationsListSkeleton";
import ApplicationsStats from "./_components/ApplicationsStats";
import ApplicationsTabs from "./_components/ApplicationsTabs";

export const metadata: Metadata = {
  title: "Membership Applications | Admin",
  description: "Manage membership applications and schedule interviews",
};

export default async function ApplicationsPage() {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<ApplicationsListSkeleton />}>
        <div>
          <h1 className="font-bold text-3xl text-foreground">
            Membership Applications
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage membership applications and schedule interviews
          </p>
        </div>

        <ApplicationsTabs
          finishedApplications={<ApplicationsList status="finished" />}
          newApplications={<ApplicationsList status="new" />}
          pendingApplications={<ApplicationsList status="pending" />}
          stats={<ApplicationsStats />}
        />
      </Suspense>
    </div>
  );
}
