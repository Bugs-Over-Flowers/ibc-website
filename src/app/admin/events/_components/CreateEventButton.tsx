"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function CreateEventButton() {
  return (
    <Link
      className={buttonVariants({ className: "h-12 rounded-xl", size: "sm" })}
      href="/admin/create-event"
    >
      <Plus className="mr-2 h-4 w-4" />
      Create New Event
    </Link>
  );
}
