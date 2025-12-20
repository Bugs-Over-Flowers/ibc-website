"use client";

import { type ReactNode, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <>
      {activeTab === "new" ? (
        <div className="flex flex-col items-stretch gap-6 lg:flex-row">
          <div className="flex flex-2 flex-col">
            <MeetingScheduler />
          </div>
          <div className="flex flex-1 flex-col">{stats}</div>
        </div>
      ) : activeTab === "pending" ? (
        <div className="flex flex-col items-stretch gap-6 lg:flex-row">
          <div className="flex flex-1 flex-col">
            <BulkActions />
          </div>
          <div className="flex flex-2 flex-col">{stats}</div>
        </div>
      ) : (
        stats
      )}

      <Tabs
        className="w-full"
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-3 border border-border bg-background">
          <TabsTrigger value="new">New Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending Interviews</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="new">
          {newApplications}
        </TabsContent>

        <TabsContent className="space-y-4" value="pending">
          {pendingApplications}
        </TabsContent>

        <TabsContent className="space-y-4" value="finished">
          {finishedApplications}
        </TabsContent>
      </Tabs>
    </>
  );
}
