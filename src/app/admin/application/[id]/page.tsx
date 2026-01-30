import { Suspense } from "react";
import { ApplicationDetails } from "./_components/ApplicationDetails";
import { DetailsSkeleton } from "./_components/DetailsSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { source } = await searchParams;

  return (
    <div className="container mx-auto space-y-6 py-8">
      <Suspense fallback={<DetailsSkeleton />}>
        <ApplicationDetails
          applicationId={id}
          source={
            (source === "members" ? "members" : "applications") as
              | "applications"
              | "members"
          }
        />
      </Suspense>
    </div>
  );
}
