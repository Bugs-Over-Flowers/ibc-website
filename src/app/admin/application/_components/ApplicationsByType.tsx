"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { getApplications } from "@/server/applications/queries/getApplications";
import {
  APPLICATION_TYPE_LABELS,
  APPLICATION_TYPE_ORDER,
  type ApplicationType,
} from "../_utils/applicationTypes";
import { ApplicationsTable } from "./ApplicationsTable";
import { EmptyApplicationsState } from "./EmptyApplicationsState";
import { PendingApplicationsGrouped } from "./PendingApplicationsGrouped";

type ApplicationsByTypeProps = {
  applications: Awaited<ReturnType<typeof getApplications>>;
  status: "new" | "pending" | "finished";
};

type ApplicationTypeFilter = "all" | ApplicationType;

function isApplicationTypeFilter(
  value: string | null,
): value is ApplicationTypeFilter {
  if (value === null) {
    return false;
  }

  return value === "all" || value in APPLICATION_TYPE_LABELS;
}

export function ApplicationsByType({
  applications,
  status,
}: ApplicationsByTypeProps) {
  const [applicationTypeFilter, setApplicationTypeFilter] =
    useState<ApplicationTypeFilter>("all");

  const groupedByType = useMemo(
    () =>
      applications.reduce<
        Record<ApplicationType, ApplicationsByTypeProps["applications"]>
      >(
        (acc, application) => {
          if (application.applicationType in acc) {
            const type = application.applicationType as ApplicationType;
            acc[type].push(application);
          }

          return acc;
        },
        {
          newMember: [],
          updating: [],
          renewal: [],
        },
      ),
    [applications],
  );

  const visibleTypes =
    applicationTypeFilter === "all"
      ? APPLICATION_TYPE_ORDER
      : [applicationTypeFilter];

  const hasVisibleApplications = visibleTypes.some(
    (type) => groupedByType[type].length > 0,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          onValueChange={(value) => {
            if (!isApplicationTypeFilter(value)) {
              return;
            }

            setApplicationTypeFilter(value);
          }}
          value={applicationTypeFilter}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter by application type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {APPLICATION_TYPE_ORDER.map((type) => (
              <SelectItem key={type} value={type}>
                {APPLICATION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasVisibleApplications ? (
        visibleTypes.map((type) => {
          const typeApplications = groupedByType[type];

          if (typeApplications.length === 0) {
            return null;
          }

          const sectionTitle = `${APPLICATION_TYPE_LABELS[type]} Applications`;

          if (status === "pending") {
            return (
              <section className="space-y-4" key={type}>
                <div className="px-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {sectionTitle}
                  </h3>
                </div>
                <PendingApplicationsGrouped applications={typeApplications} />
              </section>
            );
          }

          return (
            <ApplicationsTable
              applications={typeApplications}
              key={type}
              status={status}
              title={sectionTitle}
            />
          );
        })
      ) : (
        <EmptyApplicationsState status={status} />
      )}
    </div>
  );
}
