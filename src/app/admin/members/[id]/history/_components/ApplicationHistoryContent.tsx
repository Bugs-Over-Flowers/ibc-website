/**
 * ApplicationHistoryContent — Async Server Component that fetches and renders
 * the full application history for a business member.
 *
 * Flow:
 * 1. Reads cookies for the authenticated Supabase client
 * 2. Calls `getApplicationHistory` (cached RPC query) with the member ID
 * 3. On failure, triggers a 404 (member not found or RPC error)
 * 4. On success, displays the business name heading and delegates rendering
 *    to ApplicationHistoryList (client component) which handles search,
 *    filtering by application type, and date range filtering.
 *
 * Wrapped in <Suspense> by the parent page.tsx for streaming.
 */
import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { getApplicationHistory } from "@/server/applications/queries/getApplicationHistory";
import { ApplicationHistoryList } from "./ApplicationHistoryList";

interface ApplicationHistoryContentProps {
  memberId: string;
}

export async function ApplicationHistoryContent({
  memberId,
}: ApplicationHistoryContentProps) {
  const cookieStore = await cookies();

  const { data: history, success } = await tryCatch(
    getApplicationHistory(memberId, cookieStore.getAll()),
  );

  if (!success) {
    notFound();
  }

  return (
    <>
      <Link href={`/admin/members/${memberId}` as Route}>
        <Button
          className="mb-4 border border-border active:scale-95 active:opacity-80"
          size="sm"
          variant="ghost"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Member
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="font-bold text-3xl">{history.businessName}</h1>
        <h2 className="text-lg text-muted-foreground">Application History</h2>
      </div>

      <ApplicationHistoryList
        applications={history.applications}
        memberId={memberId}
      />
    </>
  );
}
