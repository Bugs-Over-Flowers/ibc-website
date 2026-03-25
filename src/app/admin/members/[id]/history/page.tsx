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
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationHistoryContent } from "./_components/ApplicationHistoryContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationHistoryPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 px-2">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        }
      >
        <ApplicationHistoryContent memberId={id} />
      </Suspense>
    </div>
  );
}
