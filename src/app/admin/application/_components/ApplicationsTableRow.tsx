"use client";

import { AlertTriangle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { getApplications } from "@/server/applications/queries/getApplications";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import { toPascalCaseWithSpaces } from "../_utils/formatters";

interface ApplicationsTableRowProps {
  application: Awaited<ReturnType<typeof getApplications>>[number];
}

function getApplicationTypeColor(type: string): {
  borderColor: string;
  textColor: string;
} {
  switch (type) {
    case "newMember":
      return {
        borderColor: "border-status-green",
        textColor: "text-status-green",
      };
    case "updating":
      return {
        borderColor: "border-status-yellow",
        textColor: "text-status-yellow",
      };
    case "renewal":
      return {
        borderColor: "border-status-blue",
        textColor: "text-status-blue",
      };
    default:
      return {
        borderColor: "border-muted",
        textColor: "text-muted-foreground",
      };
  }
}

export function ApplicationsTableRow({
  application,
}: ApplicationsTableRowProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure Zustand store state is only used after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isSelected = useSelectedApplicationsStore((state) =>
    state.isSelected(application.applicationId),
  );
  const toggleSelection = useSelectedApplicationsStore(
    (state) => state.toggleSelection,
  );
  const { borderColor, textColor } = getApplicationTypeColor(
    application.applicationType,
  );
  const paymentProofStatus = application.paymentProofStatus ?? "pending";
  const isPaymentProofPending =
    application.paymentMethod === "BPI" && paymentProofStatus === "pending";
  const isSelectionDisabled = isPaymentProofPending;

  return (
    <TableRow
      className={isHydrated && isSelected ? "bg-muted/50" : ""}
      key={application.applicationId}
    >
      <TableCell className="w-12">
        <Checkbox
          aria-label={`Select ${application.companyName}`}
          checked={isSelected}
          disabled={isSelectionDisabled}
          onCheckedChange={() => {
            if (isSelectionDisabled) return;
            toggleSelection(application.applicationId);
          }}
        />
      </TableCell>
      <TableCell className="w-[24%] font-medium">
        <div className="flex items-center gap-2">
          {isPaymentProofPending && (
            <Tooltip>
              <TooltipTrigger
                aria-label="Check payment proof"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-status-red/15 text-status-red"
              >
                <AlertTriangle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Check Payment Proof</TooltipContent>
            </Tooltip>
          )}
          <span>{application.companyName}</span>
        </div>
      </TableCell>
      <TableCell className="w-[34%] max-w-64">
        <div className="line-clamp-2 truncate text-sm">
          {application.Sector?.sectorName}
        </div>
      </TableCell>
      <TableCell className="w-[16%]">
        <Badge className={`${borderColor} ${textColor}`} variant="outline">
          {toPascalCaseWithSpaces(application.applicationType)}
        </Badge>
      </TableCell>
      {/* <TableCell>
        <div className="text-sm">
          <div>{application.emailAddress}</div>
          <div className="text-muted-foreground">
            {application.mobileNumber}
          </div>
        </div>
      </TableCell> */}
      <TableCell className="w-[14%]">
        <div className="space-y-1">
          <div>
            {new Date(application.applicationDate).toLocaleDateString()}
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[12%]">
        <Button
          className="active:scale-95 active:opacity-80 dark:hover:bg-muted"
          size="sm"
          variant="outline"
        >
          <Link
            href={`/admin/application/${application.applicationId}` as Route}
          >
            View Details
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
