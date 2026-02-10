"use client";

import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { getMembers } from "@/server/members/queries/getMembers";

interface MembersTableRowProps {
  member: Awaited<ReturnType<typeof getMembers>>[number];
}

export function MembersTableRow({ member }: MembersTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = member.logoImageURL && !imageError;
  const router = useRouter();
  const lastTapRef = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      router.push(
        `/admin/application/${member.primaryApplicationId}?source=members` as Route,
      );
    }

    lastTapRef.current = now;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(
        `/admin/application/${member.primaryApplicationId}?source=members` as Route,
      );
    }
  };

  return (
    <button
      className="flex w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-lg border bg-background p-3 text-left shadow-sm md:flex-row md:items-center md:gap-4"
      onClick={handleDoubleTap}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      type="button"
    >
      {/* Image with status badge */}
      <div className="relative aspect-square h-auto w-full shrink-0 md:aspect-auto md:h-40 md:w-40">
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
        <div className="absolute top-2 left-2">
          <Badge
            className="bg-background text-muted-foreground capitalize"
            variant={
              member.membershipStatus === "paid" ? "default" : "destructive"
            }
          >
            {member.membershipStatus}
          </Badge>
        </div>
      </div>

      {/* Middle content */}
      <div className="relative flex w-full flex-1 flex-col gap-2">
        <div className="absolute top-0 right-0">
          <p className="text-muted-foreground text-xs italic opacity-50">
            {member.identifier}
          </p>
        </div>
        <h3 className="line-clamp-1 pt-4 font-semibold text-lg md:text-2xl">
          {member.businessName}
        </h3>
        <p className="line-clamp-1 text-sm">
          {member.Sector?.sectorName || "—"}
        </p>
        <div className="h-px w-full bg-border" />
        {member.websiteURL && (
          <a
            className="inline-block max-w-fit truncate text-blue-600 text-xs hover:underline md:text-sm"
            href={member.websiteURL}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            {member.websiteURL}
          </a>
        )}
        <p className="text-muted-foreground text-xs">
          Join Date: {new Date(member.joinDate).toLocaleDateString()}
        </p>

        <div className="flex justify-center pt-2">
          <p className="text-muted-foreground text-xs italic opacity-50">
            -- Double click to view details --
          </p>
        </div>
      </div>

      {/* Divider on desktop */}
      <div className="hidden h-full w-px bg-border md:block" />
    </button>
  );
}
