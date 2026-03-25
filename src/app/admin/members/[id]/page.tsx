import { Suspense } from "react";
import { DetailsSkeleton } from "./_components/DetailsSkeleton";
import { MembersDetails } from "./_components/MembersDetails";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<DetailsSkeleton />}>
        <MembersDetails memberId={id} />
      </Suspense>
    </div>
  );
}
