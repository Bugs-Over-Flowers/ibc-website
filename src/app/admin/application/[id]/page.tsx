/**
 * Application Detail Page — `/admin/application/[id]`
 *
 * Shows the full details of a single membership application.
 *
 * Search params:
 * - `source` — where the user navigated from ("applications" | "members" | "history").
 *   Controls the back-navigation link in ApplicationDetails.
 *   Defaults to "applications" if missing or invalid.
 * - `memberId` — required when `source=history` so the back link can point to
 *   `/admin/members/[memberId]/history`.
 *
 * Re-exports the shared ApplicationDetails component from `@/app/admin/_components/`.
 */
import { Suspense } from "react";
import { ApplicationDetails } from "./_components/ApplicationDetails";
import { DetailsSkeleton } from "./_components/DetailsSkeleton";

/** Valid values for the `source` search param. */
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

  // Validate the source param against the allowlist; fall back to "applications"
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
