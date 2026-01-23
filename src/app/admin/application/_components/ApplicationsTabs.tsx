"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTabSelections } from "../_hooks/useTabSelections";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import BulkActions from "./BulkActions";
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
  const [isMobile, setIsMobile] = useState(false);
  const [indicatorReady, setIndicatorReady] = useState(false);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { selectedApplicationIds, clearSelection, selectAll } =
    useSelectedApplicationsStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ensure indicator is rendered after refs are set
  useEffect(() => {
    if (buttonRefs.current[activeTab]) {
      setIndicatorReady(true);
    }
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

  const activeButtonRef = buttonRefs.current[activeTab];
  const indicatorX = activeButtonRef?.offsetLeft ?? 0;
  const indicatorWidth = activeButtonRef?.offsetWidth ?? 0;

  return (
    <>
      <AnimatePresence mode={isMobile ? "wait" : "popLayout"}>
        {activeTab === "new" ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-stretch gap-6 lg:flex-row"
            exit={{ opacity: isMobile ? 0 : 1 }}
            initial={{ opacity: isMobile ? 0 : 1 }}
            key="new"
            transition={{ duration: isMobile ? 0.2 : 0.5 }}
          >
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-2 flex-col"
              exit={{ x: isMobile ? 0 : -800, opacity: 1 }}
              initial={{ x: isMobile ? 0 : -800, opacity: 1 }}
              transition={{ duration: isMobile ? 0.2 : 0.5 }}
            >
              <MeetingScheduler />
            </motion.div>

            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col"
              exit={{ opacity: 1 }}
              initial={{ opacity: 1 }}
              layoutId={isMobile ? undefined : "stats-container"}
              transition={{ duration: isMobile ? 0.2 : 0.5 }}
            >
              {stats}
            </motion.div>
          </motion.div>
        ) : activeTab === "pending" ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-stretch gap-6 lg:flex-row"
            exit={{ opacity: isMobile ? 0 : 1 }}
            initial={{ opacity: isMobile ? 0 : 1 }}
            key="pending"
            transition={{ duration: isMobile ? 0.2 : 0.5 }}
          >
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-1 flex-col"
              exit={{ x: isMobile ? 0 : -500, opacity: 1 }}
              initial={{ x: isMobile ? 0 : -500, opacity: 1 }}
              transition={{ duration: isMobile ? 0.2 : 0.5 }}
            >
              <BulkActions />
            </motion.div>

            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-2 flex-col"
              exit={{ opacity: 1 }}
              initial={{ opacity: 1 }}
              layoutId={isMobile ? undefined : "stats-container"}
              transition={{ duration: isMobile ? 0.2 : 0.5 }}
            >
              {stats}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-stretch"
            exit={{ opacity: isMobile ? 0 : 1 }}
            initial={{ opacity: isMobile ? 0 : 1 }}
            key="finished"
            transition={{ duration: isMobile ? 0.2 : 0.3 }}
          >
            <motion.div
              animate={{ opacity: 1 }}
              className="flex w-full flex-col"
              exit={{ opacity: 1 }}
              initial={{ opacity: 1 }}
              layoutId={isMobile ? undefined : "stats-container"}
              transition={{ duration: isMobile ? 0.2 : 0.5 }}
            >
              {stats}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        <div className="relative">
          <div className="relative grid grid-cols-3 gap-0.5 overflow-hidden rounded-md border border-border bg-background p-1 sm:gap-0">
            {indicatorReady && (
              <motion.div
                animate={{
                  x: indicatorX,
                  width: indicatorWidth,
                }}
                className="absolute rounded-md bg-primary/20"
                style={{
                  top: "4px",
                  height: "calc(100% - 8px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
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
                  if (el) buttonRefs.current[tab.id] = el;
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
            <div className="space-y-4">{newApplications}</div>
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
