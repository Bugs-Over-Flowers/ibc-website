"use client";

import { AlertTriangle, CircleCheckBig, XCircle } from "lucide-react";
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

const PERSONAL_REGISTRATION_FEE = 5000;
const CORPORATE_REGISTRATION_FEE = 10000;

export function PaymentProofModal({
  proofImagePath,
  paymentProofStatus,
  membershipTypeLabel,
  expectedRegistrationFee,
  isUpdatingStatus,
  isDecisionLocked,
  onDecision,
}: PaymentProofModalProps) {
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);

  const getStatusIcon = (status: Enums<"PaymentProofStatus">) => {
    switch (status) {
      case "accepted":
        return CircleCheckBig;
      case "rejected":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusClasses = (status: Enums<"PaymentProofStatus">) => {
    switch (status) {
      case "accepted":
        return "text-status-green";
      case "rejected":
        return "text-status-red";
      default:
        return "text-status-orange";
    }
  };

  const StatusIcon = getStatusIcon(paymentProofStatus);

  return (
    <div className="flex flex-col gap-2">
      <Dialog onOpenChange={setIsProofDialogOpen} open={isProofDialogOpen}>
        <DialogTrigger
          render={
            <button
              className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border-2 bg-muted/30 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              type="button"
            />
          }
        >
          <Image
            alt="Payment proof"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            fill
            src={proofImagePath}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-background/85"
          />
          <span
            className={cn(
              "absolute inset-0 flex -translate-y-4 items-center justify-center",
              getStatusClasses(paymentProofStatus),
            )}
          >
            <span className="rounded-full p-1.5 shadow-lg">
              <StatusIcon className="h-10 w-10" />
            </span>
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1 text-foreground text-sm">
            Payment Proof
          </span>
        </DialogTrigger>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verify Payment Proof</DialogTitle>
            <DialogDescription>
              Review the payment proof and mark it as accepted or rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="grid items-stretch gap-0 overflow-hidden rounded-lg border md:grid-cols-2">
            <div className="flex h-full flex-col gap-4 bg-muted/20 p-4">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-muted-foreground text-xs uppercase">
                  Member Type
                </span>
                <Badge className="w-fit bg-primary text-sm" variant="default">
                  {membershipTypeLabel}
                </Badge>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Applicant is being evaluated under this membership category.
                </p>
              </div>
              <div className="flex flex-col gap-2 border-t pt-3">
                <span className="font-semibold text-muted-foreground text-xs uppercase">
                  Registration Fee
                </span>
                <p className="font-bold text-2xl text-primary">
                  P{expectedRegistrationFee.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs">
                  Expected payment amount for{" "}
                  {membershipTypeLabel.toLowerCase()}.
                </p>
              </div>
              <div className="grid gap-2 rounded-md border bg-background/60 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Personal fee</span>
                  <span className="font-semibold text-foreground">
                    P{PERSONAL_REGISTRATION_FEE.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Corporate fee</span>
                  <span className="font-semibold text-foreground">
                    P{CORPORATE_REGISTRATION_FEE.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t bg-muted/20 p-4 md:border-t-0 md:border-l">
              <ImageZoom className="h-[280px] w-full overflow-hidden rounded-md bg-background sm:h-[340px] md:h-full md:min-h-[380px]">
                <Image
                  alt="Payment proof"
                  className="h-full w-full object-contain"
                  fill
                  src={proofImagePath}
                />
              </ImageZoom>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isUpdatingStatus || isDecisionLocked}
              onClick={() => onDecision("rejected")}
              variant="outline"
            >
              {isUpdatingStatus ? "Saving..." : "Reject"}
            </Button>
            <Button
              disabled={isUpdatingStatus || isDecisionLocked}
              onClick={() => onDecision("accepted")}
            >
              {isUpdatingStatus ? "Saving..." : "Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
