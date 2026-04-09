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
      <ApplicationsStats
        activeTab={activeTab}
        counts={counts}
        onTabChange={handleTabChange}
      />

      <div className="mt-6 w-full">
        {activeTab === "finished" ? (
          <div className="flex flex-col gap-4">{finishedApplications}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <div className="min-w-0">
              {activeTab === "new" ? <MeetingScheduler /> : <BulkActions />}
            </div>
            <div className="min-w-0">
              {activeTab === "new" ? newApplications : pendingApplications}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
