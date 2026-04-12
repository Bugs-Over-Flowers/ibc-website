import { cookies } from "next/headers";
import { getApplications } from "@/server/applications/queries/getApplications";
import { ApplicationsTable } from "./ApplicationsTable";
import { EmptyApplicationsState } from "./EmptyApplicationsState";
import { PendingApplicationsGrouped } from "./PendingApplicationsGrouped";

interface ApplicationsListProps {
  group: "interview" | "updating";
  status: "new" | "pending" | "finished";
}

function filterApplicationsByStatus(
  applications: Awaited<ReturnType<typeof getApplications>>,
  group: "interview" | "updating",
  status: "new" | "pending" | "finished",
) {
  const groupFiltered = applications.filter((app) => {
    if (group === "interview") {
      return (
        app.applicationType === "newMember" || app.applicationType === "renewal"
      );
    }

    return app.applicationType === "updating";
  });

  return groupFiltered.filter((app) => {
    if (status === "new") {
      return app.applicationStatus === "new";
    }
    if (status === "pending") {
      return app.applicationStatus === "pending";
    }
    if (status === "finished") {
      return (
        app.applicationStatus === "approved" ||
        app.applicationStatus === "rejected"
      );
    }
    return false;
  });
}

export default async function ApplicationsList({
  group,
  status,
}: ApplicationsListProps) {
  const cookieStore = await cookies();
  const applications = await getApplications(cookieStore.getAll());
  const filteredApplications = filterApplicationsByStatus(
    applications,
    group,
    status,
  );

  if (filteredApplications.length === 0) {
    return <EmptyApplicationsState status={status} />;
  }

  if (status === "pending") {
    return <PendingApplicationsGrouped applications={filteredApplications} />;
  }

  return (
    <ApplicationsTable applications={filteredApplications} status={status} />
  );
}
