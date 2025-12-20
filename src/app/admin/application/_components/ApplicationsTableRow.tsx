"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import type { getApplications } from "@/server/applications/queries/getApplications";
import { useSelectedApplications } from "../_context/SelectedApplicationsContext";
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
  const { isSelected, toggleSelection } = useSelectedApplications();
  const selected = isSelected(application.applicationId);
  const { borderColor, textColor } = getApplicationTypeColor(
    application.applicationType,
  );

  return (
    <TableRow
      className={selected ? "bg-muted/50" : ""}
      key={application.applicationId}
    >
      <TableCell className="w-12">
        <Checkbox
          aria-label={`Select ${application.companyName}`}
          checked={selected}
          onCheckedChange={() => toggleSelection(application.applicationId)}
        />
      </TableCell>
      <TableCell className="font-medium">{application.companyName}</TableCell>
      <TableCell>{application.Sector?.sectorName}</TableCell>
      <TableCell>
        <Badge className={`${borderColor} ${textColor}`} variant="outline">
          {toPascalCaseWithSpaces(application.applicationType)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{application.emailAddress}</div>
          <div className="text-muted-foreground">
            {application.mobileNumber}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div>
            {new Date(application.applicationDate).toLocaleDateString()}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Button size="sm" variant="outline">
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
