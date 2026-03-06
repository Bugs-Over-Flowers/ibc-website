import type { Metadata } from "next";
import { Suspense } from "react";
import { AddSponsoredRegistrationButton } from "./_components/AddSponsoredRegistrationButton";
import { SponsoredRegistrationTable } from "./_components/SponsoredRegistrationTable";
import SponsoredRegistrationPageSkeleton from "./loading";

export const metadata: Metadata = {
  title: "Sponsored Registrations | Admin",
  description: "View and manage all sponsored registrations",
};

export default function SponsoredRegistrationPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<SponsoredRegistrationPageSkeleton />}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl text-foreground">
              Sponsored Registrations
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage all sponsored event registrations across all
              events
            </p>
          </div>
          <AddSponsoredRegistrationButton />
        </div>

        <SponsoredRegistrationTable />
      </Suspense>
    </div>
  );
}
