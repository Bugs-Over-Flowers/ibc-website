"use client";

import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div className="flex w-full flex-col gap-3 overflow-hidden rounded-lg border bg-background p-3 shadow-sm md:flex-row md:items-stretch">
      {/* Clickable area */}
      <button
        className="flex w-full cursor-pointer flex-col gap-3 overflow-hidden text-left md:w-72 md:flex-shrink-0"
        onClick={handleDoubleTap}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        type="button"
      >
        {/* Image with status badge and checkbox */}
        <div className="relative aspect-square h-72 w-full shrink-0">
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
              className="h-full w-full rounded object-cover"
              height={160}
              onError={() => setImageError(true)}
              priority={false}
              sizes="(max-width: 768px) 100vw, 160px"
              src={member.logoImageURL as string}
              unoptimized
              width={160}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded bg-muted font-semibold text-3xl text-muted-foreground">
              {member.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Status badge - top right corner */}
          <div className="absolute top-2 right-2">
            <Badge
              className={
                member.membershipStatus === "cancelled"
                  ? "border border-background bg-status-red text-white capitalize"
                  : member.membershipStatus === "paid"
                    ? "border border-background bg-status-green text-white capitalize"
                    : member.membershipStatus === "unpaid"
                      ? "border border-background bg-status-orange text-white capitalize"
                      : ""
              }
              variant={
                member.membershipStatus === "paid"
                  ? "default"
                  : member.membershipStatus === "cancelled"
                    ? "default"
                    : "default"
              }
            >
              {member.membershipStatus}
            </Badge>
          </div>
        </div>

        {/* Middle content */}
        <div className="relative flex w-full flex-1 flex-col gap-2 md:py-4">
          {/* Company name with website icon on right */}
          <div className="flex items-start justify-between gap-2 pt-4 md:pt-0">
            <h3 className="line-clamp-1 flex-1 font-semibold text-lg md:text-2xl">
              {member.businessName}
            </h3>
            {member.websiteURL && (
              <a
                className="inline-flex flex-shrink-0 text-blue-600 transition-colors hover:text-blue-700"
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
    </div>
  );
}
