"use client";

import { type ReactNode, useState } from "react";
import { useTabSelections } from "../_hooks/useTabSelections";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import BulkActions from "./ApplicationBulkActions";
import ApplicationsStats from "./ApplicationsStats";
import MeetingScheduler from "./MeetingScheduler";

export type ApplicationTab = "new" | "pending" | "finished";

interface ApplicationsTabsProps {
  newApplications: ReactNode;
  pendingApplications: ReactNode;
  finishedApplications: ReactNode;
  counts: {
    new: number;
    pending: number;
    finished: number;
  };
}

export default function ApplicationsTabs({
  newApplications,
  pendingApplications,
  finishedApplications,
  counts,
}: ApplicationsTabsProps) {
  const [activeTab, setActiveTab] = useState<ApplicationTab>("new");
  const { selectedApplicationIds, clearSelection, selectAll } =
    useSelectedApplicationsStore();

  const { handleTabChange: handleTabSelectionChange } = useTabSelections({
    activeTab,
    selectedApplicationIds: Array.from(selectedApplicationIds),
    clearSelection,
    selectAll,
  });

  const handleTabChange = (newTab: ApplicationTab) => {
    handleTabSelectionChange(newTab);
    setActiveTab(newTab);
  };

  return (
    <>
      {activeTab === "new" ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col">
            <ApplicationsStats
              activeTab={activeTab}
              counts={counts}
              onTabChange={handleTabChange}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <MeetingScheduler />
          </div>
        </div>
      ) : activeTab === "pending" ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col">
            <ApplicationsStats
              activeTab={activeTab}
              counts={counts}
              onTabChange={handleTabChange}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <BulkActions />
          </div>
        </div>
      ) : (
        <ApplicationsStats
          activeTab={activeTab}
          counts={counts}
          onTabChange={handleTabChange}
        />
      )}

      <div className="mt-4 w-full">
        {activeTab === "new" && (
          <div className="space-y-4">{newApplications}</div>
        )}
        {activeTab === "pending" && (
          <div className="space-y-4">{pendingApplications}</div>
        )}
        {activeTab === "finished" && (
          <div className="space-y-4">{finishedApplications}</div>
        )}
      </div>
    </>
  );
}
