"use client";
import {
  AlertTriangle,
  CheckIcon,
  CircleCheckBig,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

interface PaymentProofModalProps {
  proofImagePath: string;
  paymentProofStatus: Enums<"PaymentProofStatus">;
  membershipTypeLabel: string;
  expectedRegistrationFee: number;
  isUpdatingStatus: boolean;
  isDecisionLocked: boolean;
  onDecision: (status: "accepted" | "rejected") => void;
}

const PERSONAL_FEE = 5000;
const CORPORATE_FEE = 10000;

const STATUS_CONFIG = {
  accepted: {
    chip: "bg-[#EAF3DE] text-[#27500A] border-[#97C459] dark:bg-[#27500A] dark:text-[#C0DD97] dark:border-[#3B6D11]",
    notice:
      "bg-[#EAF3DE] text-[#27500A] border-[#97C459] dark:bg-[#173404] dark:text-[#C0DD97] dark:border-[#3B6D11]",
    label: "Payment accepted",
    Icon: CircleCheckBig,
  },
  rejected: {
    chip: "bg-[#FCEBEB] text-[#791F1F] border-[#F09595] dark:bg-[#791F1F] dark:text-[#F7C1C1] dark:border-[#A32D2D]",
    notice:
      "bg-[#FCEBEB] text-[#791F1F] border-[#F09595] dark:bg-[#501313] dark:text-[#F7C1C1] dark:border-[#A32D2D]",
    label: "Payment rejected",
    Icon: XCircle,
  },
  pending: {
    chip: "bg-[#FAEEDA] text-[#633806] border-[#EF9F27] dark:bg-[#412402] dark:text-[#FAC775] dark:border-[#854F0B]",
    notice:
      "bg-[#FAEEDA] text-[#633806] border-[#EF9F27] dark:bg-[#412402] dark:text-[#FAC775] dark:border-[#854F0B]",
    label: "Awaiting review",
    Icon: AlertTriangle,
  },
} as const;

export function PaymentProofModal({
  proofImagePath,
  paymentProofStatus,
  membershipTypeLabel,
  expectedRegistrationFee,
  isUpdatingStatus,
  isDecisionLocked,
  onDecision,
}: PaymentProofModalProps) {
  const [open, setOpen] = useState(false);
  const status = STATUS_CONFIG[paymentProofStatus] ?? STATUS_CONFIG.pending;
  const { Icon } = status;
  const isPersonal = expectedRegistrationFee === PERSONAL_FEE;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {/* Trigger */}
      <DialogTrigger>
        <button
          className="group relative flex h-[88px] w-[88px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-border bg-muted/40 transition-colors hover:border-border/80 hover:bg-muted/60"
          type="button"
        >
          <Image
            alt="Payment proof thumbnail"
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
            fill
            src={proofImagePath}
          />
          <svg
            className="relative size-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <title>Payment proof icon</title>
            <rect height="18" rx="2" width="18" x="3" y="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="relative text-[11px] text-muted-foreground">
            View proof
          </span>
          {/* Status chip */}
          <span
            className={cn(
              "absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 font-medium text-[10px]",
              status.chip,
            )}
          >
            {paymentProofStatus === "pending"
              ? "Pending"
              : paymentProofStatus === "accepted"
                ? "Accepted"
                : "Rejected"}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-y-auto p-0 sm:w-auto sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="font-medium text-base">
            Verify payment proof
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review the submitted receipt and accept or reject it.
          </DialogDescription>
        </DialogHeader>

        {/* Body: 2-col grid */}
        <div className="grid md:grid-cols-2">
          {/* Left: info panel */}
          <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 md:border-r md:border-b-0">
            {/* Membership type */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                Membership type
              </span>
              <Badge className="w-fit rounded-full border border-[#85B7EB] bg-[#E6F1FB] text-[#0C447C] dark:border-[#185FA5] dark:bg-[#0C447C] dark:text-[#B5D4F4]">
                {membershipTypeLabel}
              </Badge>
            </div>

            {/* Expected fee */}
            <div className="flex flex-col gap-1">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                Expected amount
              </span>
              <span className="font-medium text-2xl text-foreground">
                ₱{expectedRegistrationFee.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-xs">
                Required for {membershipTypeLabel.toLowerCase()} membership
              </span>
            </div>

            {/* Fee reference table */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                Fee reference
              </span>
              <div className="overflow-hidden rounded-lg border bg-background">
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs",
                    isPersonal && "bg-[#E6F1FB] dark:bg-[#042C53]",
                  )}
                >
                  <span
                    className={cn(
                      "text-muted-foreground",
                      isPersonal &&
                        "font-medium text-[#0C447C] dark:text-[#B5D4F4]",
                    )}
                  >
                    Personal
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      isPersonal && "text-[#185FA5] dark:text-[#85B7EB]",
                    )}
                  >
                    ₱{PERSONAL_FEE.toLocaleString()}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between border-t px-3 py-2 text-xs",
                    !isPersonal && "bg-[#E6F1FB] dark:bg-[#042C53]",
                  )}
                >
                  <span
                    className={cn(
                      "text-muted-foreground",
                      !isPersonal &&
                        "font-medium text-[#0C447C] dark:text-[#B5D4F4]",
                    )}
                  >
                    Corporate
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      !isPersonal && "text-[#185FA5] dark:text-[#85B7EB]",
                    )}
                  >
                    ₱{CORPORATE_FEE.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Current status */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                Current status
              </span>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 font-medium text-xs",
                  status.notice,
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                {status.label}
              </div>
            </div>
          </div>

          {/* Right: image */}
          <div className="flex items-stretch p-5">
            <ImageZoom className="min-h-[240px] w-full overflow-hidden rounded-lg border bg-muted/30 md:min-h-[320px]">
              <Image
                alt="Payment proof"
                className="h-full w-full object-contain"
                fill
                src={proofImagePath}
              />
            </ImageZoom>
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {isDecisionLocked
                ? "Decision has been recorded and locked."
                : `Verify the amount matches ₱${expectedRegistrationFee.toLocaleString()} before deciding.`}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                className="gap-1.5 border-[#F09595] text-[#791F1F] hover:bg-[#FCEBEB] dark:border-[#A32D2D] dark:text-[#F7C1C1] dark:hover:bg-[#501313]"
                disabled={isUpdatingStatus || isDecisionLocked}
                onClick={() => onDecision("rejected")}
                size="sm"
                variant="outline"
              >
                <XCircle className="size-3.5" />
                {isUpdatingStatus ? "Saving…" : "Reject"}
              </Button>
              <Button
                className="gap-1.5 border border-[#97C459] bg-[#EAF3DE] text-[#27500A] hover:bg-[#C0DD97] dark:border-[#3B6D11] dark:bg-[#27500A] dark:text-[#C0DD97] dark:hover:bg-[#3B6D11]"
                disabled={isUpdatingStatus || isDecisionLocked}
                onClick={() => onDecision("accepted")}
                size="sm"
              >
                <CheckIcon className="size-3.5" />
                {isUpdatingStatus ? "Saving…" : "Accept"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
