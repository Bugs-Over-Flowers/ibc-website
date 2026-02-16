import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { SponsoredRegistrationTable } from "./_components/SponsoredRegistrationTable";
import SponsoredRegistrationPageSkeleton from "./loading";

export const metadata = {
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
          <Button className="h-12 rounded-xl" size="sm">
            <Link href="/admin/sponsored-registration/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Sponsored Registration
            </Link>
          </Button>
        </div>

        <SponsoredRegistrationTable />
      </Suspense>
    </div>
  );
}
