"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getApplications } from "@/server/applications/queries/getApplications";
import { useSelectedApplications } from "../_context/SelectedApplicationsContext";
import { ApplicationsTableRow } from "./ApplicationsTableRow";

interface ApplicationsTableProps {
  applications: Awaited<ReturnType<typeof getApplications>>;
  status: "new" | "pending" | "finished";
}

function getTitle(status: "new" | "pending" | "finished"): string {
  const titles = {
    new: "New Applications",
    pending: "Pending Interviews",
    finished: "Completed Applications",
  };
  return titles[status];
}

export function ApplicationsTable({
  applications,
  status,
}: ApplicationsTableProps) {
  const { selectAll, clearSelection, selectedApplicationIds } =
    useSelectedApplications();

  const allSelected =
    applications.length > 0 &&
    selectedApplicationIds.size === applications.length;
  const someSelected =
    selectedApplicationIds.size > 0 &&
    selectedApplicationIds.size < applications.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(applications.map((app) => app.applicationId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {getTitle(status)}
          <span className="ml-2 font-normal text-muted-foreground text-sm">
            ({applications.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all applications"
                  checked={allSelected}
                  data-indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Application Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <ApplicationsTableRow application={app} key={app.applicationId} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
