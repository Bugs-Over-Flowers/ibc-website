"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AddSponsoredRegistrationButton() {
  return (
    <Link
      className={buttonVariants({ className: "h-12 rounded-xl", size: "sm" })}
      href="/admin/sponsored-registration/new"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Sponsored Registration
    </Link>
  );
}
