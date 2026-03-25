import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import FiltersWrapper from "./_components/FiltersWrapper";
import MembersList from "./_components/MembersList";
import MembersLoading from "./loading";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    sectorName?: string;
    search?: string;
  }>;
}

export default function MembersPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<MembersLoading />}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl text-foreground">
              Members Directory
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage active members
            </p>
          </div>

          <Link
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground text-sm shadow-sm transition-colors hover:bg-primary/90"
            href="/admin/members/create"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Link>
        </div>

        <Suspense fallback={<MembersLoading />}>
          <FiltersWrapper />
        </Suspense>
        <MembersList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
