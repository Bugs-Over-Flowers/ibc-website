import { CalendarDays, Edit, History } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MemberDetailsByBusinessMemberId } from "@/server/members/queries/getMemberDetailsByBusinessMemberId";
import ExportMemberPDFButton from "./ExportMemberPDFButton";

function formatDate(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getMembershipStatusClass(status: string | null): string {
  if (status === "paid") {
    return "bg-status-green/90";
  }

  if (status === "unpaid") {
    return "bg-status-orange/90";
  }

  if (status === "cancelled") {
    return "bg-status-red/90";
  }

  return "bg-muted";
}

interface MemberDetailsHeaderProps {
  member: MemberDetailsByBusinessMemberId;
}

export function MemberDetailsHeader({ member }: MemberDetailsHeaderProps) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex items-center gap-4">
            {member.logoImageURL ? (
              <Image
                alt={`${member.businessName} logo`}
                className="h-20 w-20 rounded-xl border border-border/60 bg-muted/20 object-contain p-1"
                height={80}
                src={member.logoImageURL}
                unoptimized
                width={80}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border/60 bg-muted/20 font-bold text-3xl text-muted-foreground">
                {member.businessName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-2">
              <h1 className="font-bold text-3xl text-foreground">
                {member.businessName}
              </h1>
              <div className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-muted-foreground text-xs">
                Member ID
                <span className="font-semibold text-foreground">
                  {member.identifier}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExportMemberPDFButton member={member} />
            <Link
              href={`/admin/members/${member.businessMemberId}/edit` as Route}
            >
              <Button size="sm" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Member
              </Button>
            </Link>
            <Link
              href={
                `/admin/members/${member.businessMemberId}/history` as Route
              }
            >
              <Button size="sm" variant="outline">
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Membership Status
            </p>
            <Badge
              className={`${getMembershipStatusClass(member.membershipStatus)} mt-2 uppercase`}
            >
              {(member.membershipStatus ?? "unknown").toUpperCase()}
            </Badge>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Joined Date
            </p>
            <p className="mt-2 font-semibold text-foreground text-sm">
              {formatDate(member.joinDate)}
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Expiry Date
            </p>
            <p className="mt-2 flex items-center font-semibold text-foreground text-sm">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              {formatDate(member.membershipExpiryDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
