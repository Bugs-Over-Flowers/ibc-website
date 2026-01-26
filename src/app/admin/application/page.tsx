import { Suspense } from "react";
import ApplicationsList from "./_components/ApplicationsList";
import { ApplicationsListSkeleton } from "./_components/ApplicationsListSkeleton";
import ApplicationsStats from "./_components/ApplicationsStats";
import ApplicationsTabs from "./_components/ApplicationsTabs";

export default async function ApplicationsPage() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      <div>
        <h1 className="font-bold text-3xl">Membership Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Manage membership applications and schedule interviews
        </p>
      </div>

      <ApplicationsTabs
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
        stats={
          <Suspense fallback={<div className="h-full" />}>
            <ApplicationsStats />
          </Suspense>
        }
      />
    </div>
  );
}
