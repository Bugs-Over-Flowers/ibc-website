"use client";

import {
  ArrowDownAZ,
  ArrowUpZA,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortedState = "asc" | "desc" | false;

interface AdminTableSortHeaderProps {
  label: string;
  onSort: () => void;
  sorted: SortedState;
}

export function AdminTableSortHeader({
  label,
  onSort,
  sorted,
}: AdminTableSortHeaderProps) {
  return (
    <Button
      className="h-auto p-0 font-medium text-[11px] text-muted-foreground uppercase tracking-wider hover:bg-transparent hover:text-foreground"
      onClick={onSort}
      type="button"
      variant="ghost"
    >
      {label}
      {sorted === "asc" ? (
        <ArrowDownAZ className="ml-1 size-3" />
      ) : sorted === "desc" ? (
        <ArrowUpZA className="ml-1 size-3" />
      ) : null}
    </Button>
  );
}

export function AdminTableDateSortHeader({
  label,
  onSort,
  sorted,
}: AdminTableSortHeaderProps) {
  return (
    <Button
      className="h-auto p-0 font-medium text-[11px] text-muted-foreground uppercase tracking-wider hover:bg-transparent hover:text-foreground"
      onClick={onSort}
      type="button"
      variant="ghost"
    >
      {label}
      {sorted === "asc" ? (
        <CalendarArrowDown className="ml-1 size-3" />
      ) : sorted === "desc" ? (
        <CalendarArrowUp className="ml-1 size-3" />
      ) : null}
    </Button>
  );
}

const PAYMENT_STATUS_BADGE_STYLES = {
  accepted:
    "border-[#97C459] bg-[#EAF3DE] text-[#27500A] dark:border-[#3B6D11] dark:bg-[#173404] dark:text-[#C0DD97]",
  pending:
    "border-[#EF9F27] bg-[#FAEEDA] text-[#633806] dark:border-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775]",
  rejected:
    "border-[#F09595] bg-[#FCEBEB] text-[#791F1F] dark:border-[#A32D2D] dark:bg-[#501313] dark:text-[#F7C1C1]",
} as const;

interface PaymentStatusBadgeProps {
  status: keyof typeof PAYMENT_STATUS_BADGE_STYLES | string;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
  const normalizedStatus =
    status in PAYMENT_STATUS_BADGE_STYLES
      ? (status as keyof typeof PAYMENT_STATUS_BADGE_STYLES)
      : "pending";

  return (
    <Badge
      className={cn(PAYMENT_STATUS_BADGE_STYLES[normalizedStatus], className)}
    >
      {status}
    </Badge>
  );
}
