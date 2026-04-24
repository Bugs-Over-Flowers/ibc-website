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

      const isInterviewType =
        app.applicationType === "newMember" ||
        app.applicationType === "renewal";
      const isUpdatingType = app.applicationType === "updating";

      if (status === "new") {
        if (isInterviewType) {
          acc.interview.new += 1;
          if (app.applicationType === "newMember") {
            acc.interview.typeBreakdown.new.newMember += 1;
          }
          if (app.applicationType === "renewal") {
            acc.interview.typeBreakdown.new.renewal += 1;
          }
        }
        if (isUpdatingType) {
          acc.updating.new += 1;
        }
      } else if (status === "pending") {
        if (isInterviewType) {
          acc.interview.pending += 1;
          if (app.applicationType === "newMember") {
            acc.interview.typeBreakdown.pending.newMember += 1;
          }
          if (app.applicationType === "renewal") {
            acc.interview.typeBreakdown.pending.renewal += 1;
          }
        }
      } else if (status === "approved" || status === "rejected") {
        if (isInterviewType) {
          acc.interview.finished += 1;
          if (app.applicationType === "newMember") {
            acc.interview.typeBreakdown.finished.newMember += 1;
          }
          if (app.applicationType === "renewal") {
            acc.interview.typeBreakdown.finished.renewal += 1;
          }
        }
        if (isUpdatingType) {
          acc.updating.finished += 1;
        }
      }

      return acc;
    },
    {
      interview: {
        new: 0,
        pending: 0,
        finished: 0,
        typeBreakdown: {
          new: { newMember: 0, renewal: 0 },
          pending: { newMember: 0, renewal: 0 },
          finished: { newMember: 0, renewal: 0 },
        },
      },
      updating: { new: 0, finished: 0 },
    },
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
          interviewApplications={{
            finished: (
              <Suspense fallback={<ApplicationsListSkeleton />}>
                <ApplicationsList group="interview" status="finished" />
              </Suspense>
            ),
            new: (
              <Suspense fallback={<ApplicationsListSkeleton />}>
                <ApplicationsList group="interview" status="new" />
              </Suspense>
            ),
            pending: (
              <Suspense fallback={<ApplicationsListSkeleton />}>
                <ApplicationsList group="interview" status="pending" />
              </Suspense>
            ),
          }}
          updateInfoApplications={{
            finished: (
              <Suspense fallback={<ApplicationsListSkeleton />}>
                <ApplicationsList group="updating" status="finished" />
              </Suspense>
            ),
            new: (
              <Suspense fallback={<ApplicationsListSkeleton />}>
                <ApplicationsList group="updating" status="new" />
              </Suspense>
            ),
          }}
        />
      </Suspense>
    </div>
  );
}
