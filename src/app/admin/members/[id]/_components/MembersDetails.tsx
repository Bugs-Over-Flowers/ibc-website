import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import tryCatch from "@/lib/server/tryCatch";
import { getMemberDetailsByBusinessMemberId } from "@/server/members/queries/getMemberDetailsByBusinessMemberId";
import { MemberDetailsCards } from "./MemberDetailsCards";
import { MemberDetailsHeader } from "./MemberDetailsHeader";

interface MembersDetailsProps {
  memberId: string;
}

export async function MembersDetails({ memberId }: MembersDetailsProps) {
  const cookieStore = await cookies();

  const { data: member, success } = await tryCatch(
    getMemberDetailsByBusinessMemberId(memberId, cookieStore.getAll()),
  );

  if (!success || !member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
        href={"/admin/members" as Route}
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Members
      </Link>

      <MemberDetailsHeader member={member} />
      <MemberDetailsCards member={member} />
    </div>
  );
}
