"use client";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { getMembers } from "@/server/members/queries/getMembers";

interface MembersTableRowProps {
  member: Awaited<ReturnType<typeof getMembers>>[number];
  isSelected: boolean;
  onSelectedChange: (selected: boolean) => void;
}

export function MembersTableRow({
  member,
  isSelected,
  onSelectedChange,
}: MembersTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = member.logoImageURL && !imageError;
  const router = useRouter();
  const lastTapRef = useRef<number>(0);
  const joinedDate = new Date(member.joinDate);
  const formattedJoinDate = Number.isNaN(joinedDate.getTime())
    ? "N/A"
    : joinedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      router.push(`/admin/members/${member.businessMemberId}` as Route);
    }

    lastTapRef.current = now;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(`/admin/members/${member.businessMemberId}` as Route);
    }
  };

  return (
    <div
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card p-3",
        "transition-all duration-200",
        "hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg",
      )}
    >
      {/* Clickable area */}
      <button
        className="flex w-full flex-1 cursor-pointer flex-col gap-3 overflow-hidden text-left"
        onClick={handleDoubleTap}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        type="button"
      >
        {/* Image with status badge and checkbox */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {/* Checkbox - top left corner */}
          <div className="absolute top-2 left-2 z-10 rounded-sm border border-foreground/30 bg-card p-1 shadow-foreground shadow-lg ring-2 ring-foreground/10">
            <Checkbox
              checked={isSelected}
              className="size-5"
              onCheckedChange={(checked) => onSelectedChange(checked === true)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {showImage ? (
            <Image
              alt={member.businessName}
              className="absolute inset-0 h-full w-full object-cover"
              fill
              onError={() => setImageError(true)}
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              src={member.logoImageURL as string}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-700 font-extrabold text-5xl text-white/90">
              {member.businessName.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          {/* Status badge - top right corner */}
          <div className="absolute top-2 right-2">
            <Badge
              className={cn(
                "border border-white/20 font-semibold text-card capitalize shadow-sm",
                member.membershipStatus === "cancelled" && "bg-status-red",
                member.membershipStatus === "paid" && "bg-status-green",
                member.membershipStatus === "unpaid" && "bg-status-orange",
              )}
              variant="default"
            >
              {member.membershipStatus}
            </Badge>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative flex w-full flex-1 flex-col gap-3 px-2 pb-1">
          {/* Company name with website icon on right */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 flex-1 font-bold text-base leading-snug">
              {member.businessName}
            </h3>
            {member.websiteURL && (
              <a
                className="inline-flex shrink-0 text-muted-foreground transition-colors hover:text-primary"
                href={member.websiteURL}
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                target="_blank"
                title={member.websiteURL}
              >
                <ExternalLink className="mt-1 size-4" />
              </a>
            )}
          </div>

          {/* Sector with fixed 2 line height */}
          <p className="line-clamp-2 min-h-[2.5em] text-muted-foreground text-sm opacity-70">
            {member.Sector?.sectorName || "—"}
          </p>

          <Separator />

          {/* Identifier and date at bottom */}
          <div className="grid gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="font-mono text-muted-foreground">
                {member.identifier || member.businessMemberId}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
              <span className="text-muted-foreground">
                Joined {formattedJoinDate}
              </span>
            </div>
          </div>
        </div>
      </button>

      <div className="mt-3 border-border/50 border-t pt-3">
        <Button
          className="h-9 w-full gap-1.5 rounded-xl font-semibold text-primary text-xs hover:bg-primary/10 hover:text-primary"
          onClick={() =>
            router.push(`/admin/members/${member.businessMemberId}` as Route)
          }
          size="sm"
          type="button"
          variant="ghost"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
