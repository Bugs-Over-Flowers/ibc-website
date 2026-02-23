"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DetailBackButton() {
  return (
    <div className="flex w-full justify-start">
      <Button
        className="justify-start gap-1 px-0 text-primary transition-colors hover:bg-transparent hover:text-primary/80 focus:bg-transparent active:bg-transparent"
        nativeButton={false}
        render={
          <Link href="/admin/sponsored-registration">
            <ChevronLeft className="h-5 w-5" />
            Back to Sponsored Registrations
          </Link>
        }
        variant="ghost"
      />
    </div>
  );
}
