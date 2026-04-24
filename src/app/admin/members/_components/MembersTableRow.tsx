"use client";

import {
  Building2,
  CalendarDays,
  ExternalLink,
  Eye,
  Star,
  StarOff,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { cn } from "@/lib/utils";
import { removeFeaturedMember } from "@/server/members/mutations/removeFeaturedMember";
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

const STATUS_STYLES = {
  paid: "bg-emerald-500/80 text-white border-white/20",
  unpaid: "bg-orange-500/80 text-white border-white/20",
  cancelled: "bg-red-500/80 text-white border-white/20",
} as const;

export function MembersTableRow({
  member,
  isSelected,
  onFeatureClick,
  onSelectedChange,
  showCheckbox = false,
}: MembersTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const showImage = member.logoImageURL && !imageError;
  const router = useRouter();
  const { execute: executeRemoveFeatured, isPending: isRemovingFeatured } =
    useAction(tryCatch(removeFeaturedMember), {
      onSuccess: () => {
        toast.success(`${member.businessName} was removed from featured.`);
        setIsRemoveDialogOpen(false);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error);
      },
    });

  const todayDate = new Date().toISOString().slice(0, 10);
  const normalizedFeaturedDate =
    member.featuredExpirationDate && member.featuredExpirationDate >= todayDate
      ? member.featuredExpirationDate
      : null;
  const isCurrentlyFeatured = !!normalizedFeaturedDate;

  const formattedJoinDate = (() => {
    const d = new Date(member.joinDate);
    return Number.isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  })();

  const formattedFeaturedUntil = normalizedFeaturedDate
    ? new Date(`${normalizedFeaturedDate}T00:00:00`).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )
    : null;

  const statusStyle =
    STATUS_STYLES[member.membershipStatus as keyof typeof STATUS_STYLES] ??
    STATUS_STYLES.unpaid;

  const handleCardClick = () => {
    if (showCheckbox) {
      onSelectedChange(!isSelected);
      return;
    }
    router.push(`/admin/members/${member.businessMemberId}`);
  };

  const handleOpenRemoveFeatured = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveFeatured = async () => {
    await executeRemoveFeatured({ memberId: member.businessMemberId });
  };

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border/80",
        showCheckbox && isSelected
          ? "border-[#378ADD] border-[1.5px]"
          : "border-border/70",
      )}
    >
      {/* Image zone */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/20">
        {showImage ? (
          <Image
            alt={member.businessName}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fill
            onError={() => setImageError(true)}
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            src={member.logoImageURL as string}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#185FA5] font-bold text-5xl text-white/90">
            {member.businessName.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        {/* Top overlay row */}
        <div className="absolute top-2.5 right-2.5 left-2.5 z-20 flex items-start justify-between">
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-[10px] capitalize tracking-wide backdrop-blur-sm",
              statusStyle,
            )}
          >
            {member.membershipStatus}
          </span>

          {/* Checkbox */}
          {showCheckbox && (
            <button
              className="rounded-md border border-white/20 bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:bg-black/60"
              onClick={(e) => e.stopPropagation()}
              type="button"
            >
              <Checkbox
                checked={isSelected}
                className="size-3.5"
                onCheckedChange={(v) => onSelectedChange(v === true)}
              />
            </button>
          )}
        </div>

        {isCurrentlyFeatured && formattedFeaturedUntil && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 px-3 py-2">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300/40 bg-white/65 px-2 py-1 backdrop-blur-sm dark:border-amber-400/25 dark:bg-black/35">
              <Star className="size-2.5 fill-current text-amber-800 dark:text-amber-300" />
              <span className="font-medium text-[11px] text-amber-900 dark:text-amber-200">
                Featured until {formattedFeaturedUntil}
              </span>
            </div>
          </div>
        )}

        {/* Invisible click overlay */}
        <button
          aria-label={`Open ${member.businessName}`}
          className="absolute inset-0 z-10"
          onClick={handleCardClick}
          type="button"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + quick actions */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 overflow-hidden font-medium text-foreground text-sm leading-snug [-webkit-box-orient:vertical] [-webkit-line-clamp:1] [display:-webkit-box]">
            {member.businessName}
          </h3>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/members/${member.businessMemberId}`);
              }}
              title="View member"
              type="button"
            >
              <Eye className="size-3.5" />
            </button>

            {member.websiteURL && (
              <a
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
                href={member.websiteURL}
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                target="_blank"
                title="Visit website"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Sector */}
        <p className="min-h-[2.5em] overflow-hidden text-muted-foreground text-xs [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
          {member.Sector?.sectorName || "—"}
        </p>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Meta */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="size-3 shrink-0 text-muted-foreground/50" />
            <span className="truncate font-mono">
              {member.identifier || member.businessMemberId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3 shrink-0 text-muted-foreground/50" />
            <span>Joined {formattedJoinDate}</span>
          </div>
        </div>

        {/* Feature button */}
        {isCurrentlyFeatured ? (
          <button
            className="mt-auto inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 font-medium text-red-700 text-xs transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
            disabled={isRemovingFeatured}
            onClick={handleOpenRemoveFeatured}
            type="button"
          >
            <StarOff className="size-3" />
            {isRemovingFeatured ? "Removing..." : "Remove Featured Member"}
          </button>
        ) : (
          <button
            className="mt-auto inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-transparent text-foreground text-xs transition-colors hover:bg-muted/40"
            onClick={(e) => {
              e.stopPropagation();
              onFeatureClick(member);
            }}
            type="button"
          >
            <Star className="size-3" />
            Feature Member
          </button>
        )}
      </div>

      <AlertDialog
        onOpenChange={setIsRemoveDialogOpen}
        open={isRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove featured member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the featured status for{" "}
              <span className="font-medium text-foreground">
                {member.businessName}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingFeatured}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemovingFeatured}
              onClick={() => {
                void handleRemoveFeatured();
              }}
            >
              {isRemovingFeatured ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
