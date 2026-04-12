"use client";

import { useCallback, useEffect, useMemo } from "react";
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
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import { ApplicationsTableRow } from "./ApplicationsTableRow";
import ExportPDFButton from "./ExportPDFButton";

interface ApplicationsTableProps {
  applications: Awaited<ReturnType<typeof getApplications>>;
  status: "new" | "pending" | "finished";
  title?: string;
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
  const showContactColumn = status === "finished";

  const {
    selectAll,
    clearSelection,
    selectedApplicationIds,
    removeApplication,
  } = useSelectedApplicationsStore();

  const isSelectable = useCallback(
    (application: ApplicationsTableProps["applications"][number]) =>
      application.paymentMethod !== "BPI" ||
      (application.paymentProofStatus ?? "pending") !== "pending",
    [],
  );

  const selectableApplicationIds = useMemo(
    () => applications.filter(isSelectable).map((app) => app.applicationId),
    [applications, isSelectable],
  );

  const selectedSelectableCount = useMemo(
    () =>
      selectableApplicationIds.filter((id) => selectedApplicationIds.has(id))
        .length,
    [selectableApplicationIds, selectedApplicationIds],
  );

  const allSelected =
    selectableApplicationIds.length > 0 &&
    selectedSelectableCount === selectableApplicationIds.length;
  const someSelected =
    selectedSelectableCount > 0 &&
    selectedSelectableCount < selectableApplicationIds.length;

  useEffect(() => {
    const selectableSet = new Set(selectableApplicationIds);
    selectedApplicationIds.forEach((id) => {
      if (!selectableSet.has(id)) {
        removeApplication(id);
      }
    });
  }, [removeApplication, selectableApplicationIds, selectedApplicationIds]);

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(selectableApplicationIds);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            {getTitle(status)}
            <span className="ml-2 font-normal text-muted-foreground text-sm">
              ({applications.length})
            </span>
          </CardTitle>
          {applications.length > 0 && (
            <ExportPDFButton application={applications[0]} />
          )}
        </div>
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
              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Company Name
              </TableHead>
              <TableHead className="w-[24%] font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Sector
              </TableHead>
              <TableHead className="w-[14%] font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Application Type
              </TableHead>
              {showContactColumn && (
                <TableHead className="w-[20%] font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Contact
                </TableHead>
              )}
              <TableHead
                className={`${showContactColumn ? "w-[10%]" : "w-[14%]"} font-semibold text-muted-foreground text-xs uppercase tracking-wide`}
              >
                Date Applied
              </TableHead>
              <TableHead
                className={`${showContactColumn ? "w-[10%]" : "w-[12%]"} font-semibold text-muted-foreground text-xs uppercase tracking-wide`}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <ApplicationsTableRow
                application={app}
                key={app.applicationId}
                showContact={showContactColumn}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
