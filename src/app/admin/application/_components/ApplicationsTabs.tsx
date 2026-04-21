"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
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

const GROUP_OPTIONS: { value: ApplicationGroup; label: string }[] = [
  { value: "interview", label: "New Member & Renewal" },
  { value: "updating", label: "Update Information" },
];

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
    if (group === activeGroup) return;
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

  const showSidebar = activeTab !== "finished" || activeGroup === "updating";

  const interviewBreakdownByTab =
    activeGroup === "interview" ? counts.interview.typeBreakdown : null;

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
    <div className="flex flex-col gap-5">
      {/* Group switcher */}
      <div className="inline-flex items-center gap-1 self-start rounded-full border border-border/70 bg-muted/50 p-1">
        {GROUP_OPTIONS.map(({ value, label }) => (
          <button
            aria-pressed={activeGroup === value}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              activeGroup === value
                ? "border border-border/70 bg-background font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            key={value}
            onClick={() => handleGroupChange(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stat cards — doubles as tab navigation */}
      <ApplicationsStats
        activeTab={activeTab}
        availableTabs={availableTabs}
        counts={activeCounts}
        group={activeGroup}
        interviewBreakdownByTab={interviewBreakdownByTab}
        onTabChange={handleTabChange}
      />

      {/* Content area */}
      <div className="w-full">
        {showSidebar ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Sidebar: scheduler or bulk actions */}
            <div className="min-w-0">
              {showMeetingScheduler ? <MeetingScheduler /> : <BulkActions />}
            </div>
            {/* Main content */}
            <div className="min-w-0">{activeContent}</div>
          </div>
        ) : (
          <div>{activeContent}</div>
        )}
      </div>
    </div>
  );
}
