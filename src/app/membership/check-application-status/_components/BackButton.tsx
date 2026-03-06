"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackButton() {
  return (
    <div className="absolute top-4 left-4 z-20 md:top-8 md:left-8">
      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "group text-muted-foreground hover:bg-transparent hover:text-primary md:h-10 md:px-4 md:py-2",
        )}
        href="/"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>
    </div>
  );
}
