import { Suspense } from "react";
import { MembersDetails } from "./_components/MembersDetails";
import { DetailsSkeleton } from "./loading";

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
