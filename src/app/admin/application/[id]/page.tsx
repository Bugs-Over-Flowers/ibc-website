import { Suspense } from "react";
import { ApplicationDetails } from "./_components/ApplicationDetails";
import { DetailsSkeleton } from "./_components/DetailsSkeleton";

type ApplicationSource = "applications" | "members" | "history";

const VALID_SOURCES: ApplicationSource[] = [
  "applications",
  "members",
  "history",
];

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string; memberId?: string }>;
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { source, memberId } = await searchParams;

  const resolvedSource: ApplicationSource = VALID_SOURCES.includes(
    source as ApplicationSource,
  )
    ? (source as ApplicationSource)
    : "applications";

  return (
    <div className="container mx-auto space-y-6 py-8">
      <Suspense fallback={<DetailsSkeleton />}>
        <ApplicationDetails
          applicationId={id}
          memberId={memberId}
          source={resolvedSource}
        />
      </Suspense>
    </div>
  );
}
