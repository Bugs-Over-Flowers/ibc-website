/**
 * Application History Page — `/admin/members/[id]/history`
 *
 * Entry point for viewing all past applications submitted by a business member.
 * The `id` param is the `businessMemberId` from the BusinessMember table.
 *
 * Uses Suspense with skeleton fallback to stream the history content
 * while the cached RPC query resolves.
 */
import { Suspense } from "react";
import { ApplicationHistoryContent } from "./_components/ApplicationHistoryContent";
import ApplicationHistoryPageSkeleton from "./loading";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationHistoryPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Suspense fallback={<ApplicationHistoryPageSkeleton />}>
        <ApplicationHistoryContent memberId={id} />
      </Suspense>
    </div>
  );
}
