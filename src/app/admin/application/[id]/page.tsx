import { Suspense } from "react";
import { ApplicationDetails } from "./_components/ApplicationDetails";
import { DetailsSkeleton } from "./_components/DetailsSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto space-y-6 py-8">
      <Suspense fallback={<DetailsSkeleton />}>
        <ApplicationDetails applicationId={id} />
      </Suspense>
    </div>
  );
}
