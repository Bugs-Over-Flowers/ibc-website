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
      <Link
        className="mb-2 inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
        href={`/admin/members/${memberId}` as Route}
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Member
      </Link>

      <div className="space-y-1">
        <h1 className="font-bold text-3xl text-foreground">
          {history.businessName}
        </h1>
        <h2 className="text-base text-muted-foreground">Application History</h2>
      </div>

      <ApplicationHistoryList
        applications={history.applications}
        memberId={memberId}
      />
    </>
  );
}
