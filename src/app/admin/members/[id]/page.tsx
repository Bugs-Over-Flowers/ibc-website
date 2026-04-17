import type { Metadata } from "next";
import { Suspense } from "react";
import { MembersDetails } from "./_components/MembersDetails";
import { DetailsSkeleton } from "./loading";

export const metadata: Metadata = {
  title: "Member Details | Admin",
  description: "View complete member profile and application history.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Suspense fallback={<DetailsSkeleton />}>
        <MembersDetails memberId={id} />
      </Suspense>
    </div>
  );
}
