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
    <div className="space-y-6">
      <Link
        className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
        href={`/admin/members/${memberId}` as Route}
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Member Details
      </Link>

      <div>
        <h1 className="font-bold text-3xl text-foreground">
          {history.businessName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage all applications for this member
        </p>
      </div>

      <ApplicationHistoryList
        applications={history.applications}
        memberId={memberId}
      />
    </div>
  );
}
