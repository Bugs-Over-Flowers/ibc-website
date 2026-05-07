"use client";

import type { Route } from "next";
import BackButton from "@/app/admin/_components/BackButton";

type EditEventTopBarProps = {
  eventId: string;
};

export default function EditEventTopBar({ eventId }: EditEventTopBarProps) {
  return (
    <div className="sticky top-0 z-30 border-border bg-transparent">
      <div className="mx-auto flex max-w-7xl justify-between px-2">
        <div className="flex items-center gap-3">
          <BackButton
            href={`/admin/events/${eventId}` as Route}
            label="Back to Event"
          />
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="font-semibold text-foreground text-sm">
            Edit Event
          </span>
        </div>
      </div>
    </div>
  );
}
