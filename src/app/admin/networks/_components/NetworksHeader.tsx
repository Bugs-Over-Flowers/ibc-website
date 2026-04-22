import { Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function NetworksHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-bold text-3xl text-foreground">Networks</h1>
        <p className="mt-2 text-muted-foreground">
          Manage network organizations, representatives, and logos.
        </p>
      </div>
      <Link
        className={buttonVariants({ size: "default", variant: "default" })}
        href={"/admin/networks/new" as Route}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Network
      </Link>
    </div>
  );
}
