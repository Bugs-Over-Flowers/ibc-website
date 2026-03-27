"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  eventId: string;
}

export default function BackButton({ eventId }: BackButtonProps) {
  return (
    <div className="flex w-full justify-start">
      <Button
        nativeButton={false}
        render={
          <Link href={`/admin/events/${eventId}` as Route}>
            <ChevronLeft className="h-5 w-5" />
            Back to Event
          </Link>
        }
        variant="default"
      />
    </div>
  );
}
