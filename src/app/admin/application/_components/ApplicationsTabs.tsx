"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";
import { useSelectedApplications } from "../_context/SelectedApplicationsContext";
import { useTabSelections } from "../_hooks/useTabSelections";
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
  const { selectedApplicationIds, clearSelection, selectAll } =
    useSelectedApplications();

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
      <AnimatePresence mode="popLayout">
        {activeTab === "new" ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-stretch gap-6 lg:flex-row"
            exit={{ opacity: 1 }}
            initial={{ opacity: 1 }}
            key="new"
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-2 flex-col"
              exit={{ x: -800, opacity: 1 }}
              initial={{ x: -800, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MeetingScheduler />
            </motion.div>

            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col"
              exit={{ opacity: 1 }}
              initial={{ opacity: 1 }}
              layoutId="stats-container"
              transition={{ duration: 0.5 }}
            >
              {stats}
            </motion.div>
          </motion.div>
        ) : activeTab === "pending" ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-stretch gap-6 lg:flex-row"
            exit={{ opacity: 1 }}
            initial={{ opacity: 1 }}
            key="pending"
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-1 flex-col"
              exit={{ x: -500, opacity: 1 }}
              initial={{ x: -500, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BulkActions />
            </motion.div>

            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-2 flex-col"
              exit={{ opacity: 1 }}
              initial={{ opacity: 1 }}
              layoutId="stats-container"
              transition={{ duration: 0.5 }}
            >
              {stats}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-stretch"
            exit={{ opacity: 1 }}
            initial={{ opacity: 1 }}
            key="finished"
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ opacity: 1 }}
              className="flex w-full flex-col"
              exit={{ opacity: 1 }}
              initial={{ opacity: 1 }}
              layoutId="stats-container"
              transition={{ duration: 0.5 }}
            >
              {stats}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        <div className="relative">
          <div className="relative grid grid-cols-3 overflow-hidden rounded-md border border-border bg-background p-1">
            <motion.div
              animate={{
                x:
                  activeTab === "new"
                    ? "0%"
                    : activeTab === "pending"
                      ? "100%"
                      : "200%",
              }}
              className="absolute rounded-md bg-primary/20"
              layout
              style={{
                width: "calc(100% / 3)",
                height: "calc(100% - 8px)",
                top: "4px",
                left: "4px",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            />

            {tabs.map((tab) => (
              <button
                className={`relative z-10 py-1 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "font-medium text-muted-foreground hover:text-foreground"
                    : "text-primary"
                }
                `}
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                type="button"
              >
                {tab.label}
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
