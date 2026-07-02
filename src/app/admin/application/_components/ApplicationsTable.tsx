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
import { getMembershipPaymentRequirement } from "@/lib/membership/paymentRules";
import type { getApplications } from "@/server/applications/queries/getApplications";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import { ApplicationsTableRow } from "./ApplicationsTableRow";

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
  title,
}: ApplicationsTableProps) {
  const showContactColumn = status === "finished";

  const {
    selectAll,
    clearSelection,
    selectedApplicationIds,
    removeApplication,
    isSelectionLocked,
  } = useSelectedApplicationsStore();

  const isSelectable = useCallback(
    (application: ApplicationsTableProps["applications"][number]) => {
      const paymentRequirement = getMembershipPaymentRequirement({
        applicationMemberType: application.applicationMemberType,
        applicationType: application.applicationType,
        previousApplicationMemberType:
          application.previousApplicationMemberType,
      });

      return (
        !paymentRequirement.requiresPayment ||
        application.paymentMethod !== "BPI" ||
        (application.paymentStatus ?? "pending") !== "pending"
      );
    },
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
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            {title ?? getTitle(status)}
            <span className="ml-2 font-normal text-muted-foreground text-sm">
              ({applications.length})
            </span>
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-xs">
          Double-click a row to open
        </p>
      </CardHeader>
      <CardContent className="min-w-0 p-0">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all applications"
                  checked={allSelected}
                  data-indeterminate={someSelected}
                  disabled={isSelectionLocked}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className={`${showContactColumn ? "w-[22%]" : "w-[24%]"} font-semibold text-muted-foreground text-xs uppercase tracking-wide`}
              >
                Company Name
              </TableHead>
              <TableHead
                className={`${showContactColumn ? "w-[24%]" : "w-[34%]"} font-semibold text-muted-foreground text-xs uppercase tracking-wide`}
              >
                Sector
              </TableHead>
              <TableHead
                className={`${showContactColumn ? "w-[14%]" : "w-[16%]"} font-semibold text-muted-foreground text-xs uppercase tracking-wide`}
              >
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
