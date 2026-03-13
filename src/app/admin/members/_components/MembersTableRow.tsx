"use client";

import { ExternalLink, Star } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { getMembers } from "@/server/members/queries/getMembers";

interface MembersTableRowProps {
  member: Awaited<ReturnType<typeof getMembers>>[number];
  isSelected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onFeatureClick: (
    member: Awaited<ReturnType<typeof getMembers>>[number],
  ) => void;
}

export function MembersTableRow({
  member,
  isSelected,
  onSelectedChange,
  onFeatureClick,
}: MembersTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = member.logoImageURL && !imageError;
  const router = useRouter();
  const lastTapRef = useRef<number>(0);

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
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-background p-3 shadow-sm">
      {/* Clickable area */}
      <button
        className="flex w-full flex-1 cursor-pointer flex-col gap-3 overflow-hidden text-left"
        onClick={handleDoubleTap}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        type="button"
      >
        {/* Image with status badge and checkbox */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded">
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
            <div className="flex h-full w-full items-center justify-center rounded bg-muted font-semibold text-3xl text-muted-foreground">
              {member.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Status badge - top right corner */}
          <div className="absolute top-2 right-2">
            <Badge
              className={cn(
                "border border-popover font-semibold text-card capitalize",
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
        <div className="relative flex w-full flex-1 flex-col gap-2">
          {/* Company name with website icon on right */}
          <div className="flex h-7 items-start justify-between gap-2">
            <h3 className="line-clamp-1 flex-1 font-semibold text-base">
              {member.businessName}
            </h3>
            {member.websiteURL && (
              <a
                className="inline-flex shrink-0 text-blue-600 transition-colors hover:text-blue-700"
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
          <p className="line-clamp-2 h-[2.8em] text-muted-foreground text-sm opacity-60">
            {member.Sector?.sectorName || "—"}
          </p>
          <div className="h-px w-full bg-border" />

          {/* Identifier and date at bottom */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <p className="text-muted-foreground text-xs opacity-60">
              {member.identifier}
            </p>
            <p className="text-muted-foreground text-xs opacity-60">
              {new Date(member.joinDate).toLocaleDateString()}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <p className="text-muted-foreground text-xs italic opacity-50">
              -- Double click to view details --
            </p>
          </div>
        </div>
      </button>

      <div className="mt-3">
        <Button
          className="w-full"
          onClick={() => onFeatureClick(member)}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Star className="mr-2 h-4 w-4" />
          Feature Member
        </Button>
      </div>
    </div>
  );
}
