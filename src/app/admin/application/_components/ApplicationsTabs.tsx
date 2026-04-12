"use client";

import { type ReactNode, useState } from "react";
import { useTabSelections } from "../_hooks/useTabSelections";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import BulkActions from "./ApplicationBulkActions";
import ApplicationsStats from "./ApplicationsStats";
import MeetingScheduler from "./MeetingScheduler";

export type ApplicationTab = "new" | "pending" | "finished";
export type ApplicationGroup = "interview" | "updating";

type InterviewTypeBreakdown = {
  new: { newMember: number; renewal: number };
  pending: { newMember: number; renewal: number };
  finished: { newMember: number; renewal: number };
};

interface ApplicationsTabsProps {
  interviewApplications: {
    new: ReactNode;
    pending: ReactNode;
    finished: ReactNode;
  };
  updateInfoApplications: {
    new: ReactNode;
    finished: ReactNode;
  };
  counts: {
    interview: {
      new: number;
      pending: number;
      finished: number;
      typeBreakdown: InterviewTypeBreakdown;
    };
    updating: { new: number; finished: number };
  };
}

export default function ApplicationsTabs({
  interviewApplications,
  updateInfoApplications,
  counts,
}: ApplicationsTabsProps) {
  const [activeGroup, setActiveGroup] = useState<ApplicationGroup>("interview");
  const [activeTab, setActiveTab] = useState<ApplicationTab>("new");
  const { selectedApplicationIds, clearSelection, selectAll } =
    useSelectedApplicationsStore();

  const { handleTabChange: handleTabSelectionChange } = useTabSelections({
    activeGroup,
    activeTab,
    selectedApplicationIds: Array.from(selectedApplicationIds),
    clearSelection,
    selectAll,
  });

  const handleTabChange = (newTab: ApplicationTab) => {
    handleTabSelectionChange(newTab);
    setActiveTab(newTab);
  };

  const handleGroupChange = (group: ApplicationGroup) => {
    if (group === activeGroup) {
      return;
    }

    clearSelection();
    setActiveGroup(group);
    setActiveTab("new");
  };

  const availableTabs: ApplicationTab[] =
    activeGroup === "interview"
      ? ["new", "pending", "finished"]
      : ["new", "finished"];

  const activeCounts =
    activeGroup === "interview"
      ? counts.interview
      : { new: counts.updating.new, finished: counts.updating.finished };

  const showMeetingScheduler =
    activeGroup === "interview" && activeTab === "new";

  const activeInterviewBreakdown:
    | InterviewTypeBreakdown[keyof InterviewTypeBreakdown]
    | null =
    activeGroup === "interview"
      ? counts.interview.typeBreakdown[activeTab]
      : null;

  const activeContent =
    activeGroup === "interview"
      ? activeTab === "new"
        ? interviewApplications.new
        : activeTab === "pending"
          ? interviewApplications.pending
          : interviewApplications.finished
      : activeTab === "new"
        ? updateInfoApplications.new
        : updateInfoApplications.finished;

  return (
    <>
      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
        <button
          aria-pressed={activeGroup === "interview"}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            activeGroup === "interview"
              ? "bg-background font-medium text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => handleGroupChange("interview")}
          type="button"
        >
          New Member & Renewal
        </button>
        <button
          aria-pressed={activeGroup === "updating"}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            activeGroup === "updating"
              ? "bg-background font-medium text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => handleGroupChange("updating")}
          type="button"
        >
          Update Info
        </button>
      </div>

      <ApplicationsStats
        activeTab={activeTab}
        availableTabs={availableTabs}
        counts={activeCounts}
        group={activeGroup}
        interviewBreakdown={activeInterviewBreakdown}
        onTabChange={handleTabChange}
      />

      <div className="mt-6 w-full">
        {activeTab === "finished" ? (
          <div className="flex flex-col gap-4">{activeContent}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <div className="min-w-0">
              {showMeetingScheduler ? <MeetingScheduler /> : <BulkActions />}
            </div>
            <div className="min-w-0">{activeContent}</div>
          </div>
        )}
      </div>
    </>
  );
}
