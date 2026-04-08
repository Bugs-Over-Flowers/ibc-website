"use client";

import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTabSelections } from "../_hooks/useTabSelections";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import BulkActions from "./ApplicationBulkActions";
import MeetingScheduler from "./MeetingScheduler";

interface ApplicationsTabsProps {
  newApplications: ReactNode;
  pendingApplications: ReactNode;
  finishedApplications: ReactNode;
  stats: ReactNode;
}

export default function ApplicationsTabs({
  newApplications,
  pendingApplications,
  finishedApplications,
  stats,
}: ApplicationsTabsProps) {
  const [activeTab, setActiveTab] = useState<"new" | "pending" | "finished">(
    "new",
  );
  const [indicatorStyle, setIndicatorStyle] = useState({ x: 0, width: 0 });
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { selectedApplicationIds, clearSelection, selectAll } =
    useSelectedApplicationsStore();

  // Update indicator on tab change and initial mount
  useLayoutEffect(() => {
    const activeButton = buttonRefs.current[activeTab];
    if (activeButton) {
      setIndicatorStyle({
        x: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  // Handle window resize to recalculate indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = buttonRefs.current[activeTab];
      if (activeButton) {
        setIndicatorStyle({
          x: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  const { handleTabChange: handleTabSelectionChange } = useTabSelections({
    activeTab,
    selectedApplicationIds: Array.from(selectedApplicationIds),
    clearSelection,
    selectAll,
  });

  const handleTabChange = (newTab: "new" | "pending" | "finished") => {
    handleTabSelectionChange(newTab);
    setActiveTab(newTab);
  };

  const tabs = [
    { id: "new", label: "New Applications" },
    { id: "pending", label: "Pending Interviews" },
    { id: "finished", label: "Finished" },
  ] as const;

  return (
    <>
      {activeTab === "new" ? (
        <div className="flex flex-col items-stretch" key="new">
          <div className="flex w-full flex-col">{stats}</div>
        </div>
      ) : activeTab === "pending" ? (
        <div
          className="flex flex-col items-stretch gap-6 lg:flex-row"
          key="pending"
        >
          <div className="flex flex-1 flex-col">
            <BulkActions />
          </div>

          <div className="flex flex-2 flex-col">{stats}</div>
        </div>
      ) : (
        <div className="flex flex-col items-stretch" key="finished">
          <div className="flex w-full flex-col">{stats}</div>
        </div>
      )}

      <div className="w-full">
        <div className="relative">
          <div className="relative grid grid-cols-3 gap-0.5 overflow-hidden rounded-md border border-border bg-background p-1 sm:gap-0">
            {indicatorStyle.width > 0 && (
              <div
                className="absolute rounded-md bg-primary/20 transition-all duration-200"
                style={{
                  top: "4px",
                  left: `${indicatorStyle.x}px`,
                  width: `${indicatorStyle.width}px`,
                  height: "calc(100% - 8px)",
                }}
              />
            )}

            {tabs.map((tab) => (
              <button
                className={`relative z-10 whitespace-nowrap px-0.5 py-2 font-medium text-xs transition-colors duration-200 sm:text-sm ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
                `}
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                ref={(el) => {
                  buttonRefs.current[tab.id] = el;
                  // Update indicator when active tab's ref is set
                  if (el && tab.id === activeTab) {
                    setIndicatorStyle({
                      x: el.offsetLeft,
                      width: el.offsetWidth,
                    });
                  }
                }}
                title={tab.label}
                type="button"
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">
                  {tab.id === "new"
                    ? "New"
                    : tab.id === "pending"
                      ? "Pending"
                      : "Finished"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "new" && (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex flex-1 flex-col">
                <MeetingScheduler />
              </div>
              <div className="flex flex-2 flex-col">{newApplications}</div>
            </div>
          )}
          {activeTab === "pending" && (
            <div className="space-y-4">{pendingApplications}</div>
          )}
          {activeTab === "finished" && (
            <div className="space-y-4">{finishedApplications}</div>
          )}
        </div>
      </div>
    </>
  );
}
