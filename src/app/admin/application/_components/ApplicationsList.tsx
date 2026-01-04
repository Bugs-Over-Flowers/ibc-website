import { cookies } from "next/headers";
import { getApplications } from "@/server/applications/queries/getApplications";
import { ApplicationsTable } from "./ApplicationsTable";
import { EmptyApplicationsState } from "./EmptyApplicationsState";

interface ApplicationsListProps {
  status: "new" | "pending" | "finished";
}

function filterApplicationsByStatus(
  applications: Awaited<ReturnType<typeof getApplications>>,
  status: "new" | "pending" | "finished",
) {
  // "new" = applications with status "new" (just submitted)
  // "pending" = applications with status "pending" (interview scheduled)
  // "finished" = applications with status "approved" or "rejected"
  return applications.filter((app) => {
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
  status,
}: ApplicationsListProps) {
  const cookieStore = await cookies();
  const applications = await getApplications(cookieStore.getAll());
  const filteredApplications = filterApplicationsByStatus(applications, status);

  if (filteredApplications.length === 0) {
    return <EmptyApplicationsState status={status} />;
  }

  return (
    <ApplicationsTable applications={filteredApplications} status={status} />
  );
}
