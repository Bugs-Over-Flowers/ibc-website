"use client";

import BackButton from "@/app/admin/_components/BackButton";

export default function CreateEventTopBar() {
  return (
    <div className="sticky top-0 z-30 border-border bg-transparent">
      <div className="items-left mx-auto flex max-w-7xl justify-between px-2">
        <div className="flex items-center gap-3">
          <BackButton href="/admin/events" label="Back to Events" />
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="font-semibold text-foreground text-sm">
            Create New Event
          </span>
        </div>
      </div>
    </div>
  );
}
