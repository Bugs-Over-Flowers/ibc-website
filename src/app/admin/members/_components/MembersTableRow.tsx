"use client";

import { Building2, CalendarDays, ExternalLink, Eye } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { getMembers } from "@/server/members/queries/getMembers";

interface MembersTableRowProps {
  member: Awaited<ReturnType<typeof getMembers>>[number];
  isSelected: boolean;
  onFeatureClick: (
    member: Awaited<ReturnType<typeof getMembers>>[number],
  ) => void;
  onSelectedChange: (selected: boolean) => void;
  showCheckbox?: boolean;
}

export function MembersTableRow({
  member,
  isSelected,
  onFeatureClick,
  onSelectedChange,
  showCheckbox = false,
}: MembersTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = member.logoImageURL && !imageError;
  const router = useRouter();
  const todayDate = new Date().toISOString().slice(0, 10);
  const normalizedFeaturedExpirationDate =
    member.featuredExpirationDate && member.featuredExpirationDate >= todayDate
      ? member.featuredExpirationDate
      : null;
  const isCurrentlyFeatured = !!normalizedFeaturedExpirationDate;

  const joinedDate = new Date(member.joinDate);
  const formattedJoinDate = Number.isNaN(joinedDate.getTime())
    ? "N/A"
    : joinedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  const formattedFeaturedUntil = normalizedFeaturedExpirationDate
    ? new Date(
        `${normalizedFeaturedExpirationDate}T00:00:00`,
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleCardClick = () => {
    if (showCheckbox) {
      onSelectedChange(!isSelected);
      return;
    }
    router.push(`/admin/members/${member.businessMemberId}`);
  };

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl",
        showCheckbox && isSelected && "border-primary/50 bg-primary/5",
      )}
    >
      {/* Image — strictly 1:1 */}
      <div
        className="relative w-full overflow-hidden bg-muted/20"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Gradient scrim */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-black/35 via-transparent to-transparent" />

        {showImage ? (
          <Image
            alt={member.businessName}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fill
            onError={() => setImageError(true)}
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            src={member.logoImageURL as string}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-indigo-700 font-extrabold text-5xl text-white/90 dark:from-blue-600 dark:to-indigo-900">
            {member.businessName.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        {/* Checkbox — top left */}
        {showCheckbox && (
          <div className="absolute top-3 left-3 z-20 rounded-md border border-foreground/20 bg-card/90 p-1 shadow-md backdrop-blur-sm">
            <Checkbox
              checked={isSelected}
              className="size-4"
              onCheckedChange={(checked) => onSelectedChange(checked === true)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3 z-20">
          <Badge
            className={cn(
              "border border-white/20 font-semibold text-[10px] text-white capitalize tracking-widest shadow-sm backdrop-blur-md",
              member.membershipStatus === "cancelled" && "bg-status-red/90",
              member.membershipStatus === "paid" && "bg-status-green/90",
              member.membershipStatus === "unpaid" && "bg-status-orange/90",
            )}
            variant="default"
          >
            {member.membershipStatus}
          </Badge>
        </div>

        {/* Invisible click overlay */}
        <button
          aria-label={`Open ${member.businessName} member details`}
          className="absolute inset-0 z-10"
          onClick={handleCardClick}
          type="button"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 flex-1 font-semibold text-[14.5px] text-foreground leading-snug tracking-tight">
            {member.businessName}
          </h3>

          <div className="flex shrink-0 items-center gap-2">
            <button
              className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/members/${member.businessMemberId}`);
              }}
              title="View member details"
              type="button"
            >
              <Eye className="size-4" />
            </button>

            {member.websiteURL && (
              <a
                className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-primary"
                href={member.websiteURL}
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                target="_blank"
                title={member.websiteURL}
              >
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        </div>

        {/* Sector */}
        <p className="line-clamp-2 min-h-[2.5em] text-[12.5px] text-muted-foreground/70 leading-snug">
          {member.Sector?.sectorName || "—"}
        </p>

        {formattedFeaturedUntil ? (
          <Badge
            className="w-fit bg-primary/10 text-[10px] text-primary"
            variant="secondary"
          >
            Featured until {formattedFeaturedUntil}
          </Badge>
        ) : null}

        <Separator className="opacity-50" />

        {/* Meta */}
        <div className="grid gap-1.5 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/50" />
            <span className="truncate font-mono">
              {member.identifier || member.businessMemberId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/50" />
            <span>Joined {formattedJoinDate}</span>
          </div>
        </div>

        <Button
          className="mt-1 h-9 w-full rounded-lg"
          disabled={isCurrentlyFeatured}
          onClick={(e) => {
            e.stopPropagation();
            onFeatureClick(member);
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          {isCurrentlyFeatured ? "Already Featured" : "Feature Member"}
        </Button>
      </div>
    </article>
  );
}
