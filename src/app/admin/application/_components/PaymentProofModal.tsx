"use client";
import {
  AlertTriangle,
  CheckIcon,
  CircleCheckBig,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "@/app/admin/events/_components/PaymentProof/CameraCapture";
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
import { useAction } from "@/hooks/useAction";
import {
  IMAGE_UPLOAD_ACCEPT_ATTR,
  isValidImageUploadFile,
} from "@/lib/fileUpload";
import tryCatch from "@/lib/server/tryCatch";
import { uploadPaymentProof } from "@/lib/storage/uploadPaymentProof";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { replaceApplicationPaymentProofAndAccept } from "@/server/applications/mutations/replaceApplicationPaymentProofAndAccept";

interface PaymentProofModalProps {
  applicationId: string;
  proofImagePath: string;
  paymentProofStatus: Enums<"PaymentProofStatus">;
  membershipTypeLabel: string;
  expectedRegistrationFee: number;
  isUpdatingStatus: boolean;
  isDecisionLocked: boolean;
  onDecision: (status: "accepted" | "rejected") => void;
  onProofReplaced?: (input: {
    paymentProofStatus: Enums<"PaymentProofStatus">;
    proofImagePath: string;
  }) => void;
  trigger?: React.ReactElement;
}

const STATUS_CONFIG = {
  accepted: {
    chip: "bg-[#EAF3DE] text-[#27500A] border-[#97C459] dark:bg-[#27500A] dark:text-[#C0DD97] dark:border-[#3B6D11]",
    notice:
      "bg-[#EAF3DE] text-[#27500A] border-[#97C459] dark:bg-[#173404] dark:text-[#C0DD97] dark:border-[#3B6D11]",
    label: "Payment accepted",
    triggerLabel: "Accepted",
    icon: "text-[#27500A] dark:text-[#C0DD97]",
    Icon: CircleCheckBig,
  },
  rejected: {
    chip: "bg-[#FCEBEB] text-[#791F1F] border-[#F09595] dark:bg-[#791F1F] dark:text-[#F7C1C1] dark:border-[#A32D2D]",
    notice:
      "bg-[#FCEBEB] text-[#791F1F] border-[#F09595] dark:bg-[#501313] dark:text-[#F7C1C1] dark:border-[#A32D2D]",
    label: "Payment rejected",
    triggerLabel: "Rejected",
    icon: "text-[#791F1F] dark:text-[#F7C1C1]",
    Icon: XCircle,
  },
  pending: {
    chip: "bg-[#FAEEDA] text-[#633806] border-[#EF9F27] dark:bg-[#412402] dark:text-[#FAC775] dark:border-[#854F0B]",
    notice:
      "bg-[#FAEEDA] text-[#633806] border-[#EF9F27] dark:bg-[#412402] dark:text-[#FAC775] dark:border-[#854F0B]",
    label: "Awaiting review",
    triggerLabel: "Pending",
    icon: "text-[#633806] dark:text-[#FAC775]",
    Icon: AlertTriangle,
  },
} as const;

export function PaymentProofModal({
  applicationId,
  proofImagePath,
  paymentProofStatus,
  membershipTypeLabel,
  expectedRegistrationFee,
  isUpdatingStatus,
  isDecisionLocked,
  onDecision,
  onProofReplaced,
  trigger,
}: PaymentProofModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "camera">("view");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const status = STATUS_CONFIG[paymentProofStatus] ?? STATUS_CONFIG.pending;
  const { Icon } = status;
  const isCorporateUpgrade =
    expectedRegistrationFee === MEMBERSHIP_FEES.corporateUpgrade &&
    membershipTypeLabel.toLowerCase().includes("upgrade");
  const isPersonal =
    !isCorporateUpgrade && expectedRegistrationFee === MEMBERSHIP_FEES.personal;
  const canReplaceProof =
    paymentProofStatus === "rejected" || paymentProofStatus === "accepted";

  const { execute: replaceProof, isPending: isReplacingProof } = useAction(
    tryCatch(replaceApplicationPaymentProofAndAccept),
    {
      onSuccess: (data) => {
        onProofReplaced?.({
          paymentProofStatus: data.paymentProofStatus,
          proofImagePath: data.proofImagePath,
        });
        toast.success("Payment proof updated and accepted.");
        setSelectedFile(null);
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const isProcessing = isUpdatingStatus || isReplacingProof || isUploadingFile;

  const handleReplaceAndAccept = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    if (!isValidImageUploadFile(selectedFile)) {
      toast.error("Invalid file type or size. Only PNG/JPG up to 5MB.");
      return;
    }

    setIsUploadingFile(true);
    try {
      const uploadedPath = await uploadPaymentProof(selectedFile, {
        prefix: "app",
      });
      await replaceProof({ applicationId, uploadedPath });
    } catch {
      toast.error("Failed to upload payment proof.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setMode("view");
          setSelectedFile(null);
        }
      }}
      open={open}
    >
      {/* Trigger */}
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={
            <Button className="group relative flex h-[88px] w-[88px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-border bg-muted/40 transition-colors hover:border-border/80 hover:bg-muted/60">
              <Image
                alt="Payment proof thumbnail"
                className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
                fill
                src={proofImagePath}
              />
              <Icon className={cn("relative size-5", status.icon)} />
              <span
                className={cn(
                  "relative rounded-full border px-2 py-0.5 font-medium text-[10px] leading-none",
                  status.chip,
                )}
              >
                {status.triggerLabel}
              </span>
            </Button>
          }
        />
      )}

      <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-y-auto p-0 sm:w-auto sm:max-w-2xl">
        <DialogHeader
          className={cn("border-b px-5 py-4", mode === "camera" && "hidden")}
        >
          <DialogTitle className="font-medium text-base">
            Verify payment proof
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review the submitted receipt and accept or reject it.
          </DialogDescription>
        </DialogHeader>

        {/* Body: 2-col grid */}
        <div
          className={cn(
            "grid md:grid-cols-2",
            mode === "camera" && "grid-cols-1 md:grid-cols-1",
          )}
        >
          {/* Left: info panel */}
          <div
            className={cn(
              "flex flex-col gap-4 border-b bg-muted/30 p-5 md:border-r md:border-b-0",
              mode === "camera" && "hidden",
            )}
          >
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
                {isCorporateUpgrade
                  ? "Required for personal to corporate upgrade"
                  : `Required for ${membershipTypeLabel.toLowerCase()} membership`}
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
                    ₱{MEMBERSHIP_FEES.personal.toLocaleString()}
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
                    {isCorporateUpgrade ? "Corporate Upgrade" : "Corporate"}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      !isPersonal && "text-[#185FA5] dark:text-[#85B7EB]",
                    )}
                  >
                    ₱
                    {(isCorporateUpgrade
                      ? MEMBERSHIP_FEES.corporateUpgrade
                      : MEMBERSHIP_FEES.corporate
                    ).toLocaleString()}
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
            {mode === "camera" ? (
              <div className="w-full">
                <CameraCapture
                  disabled={isProcessing}
                  facingMode="user"
                  onCapture={(file) => {
                    setSelectedFile(file);
                    setMode("view");
                    toast.success("Photo captured. Click Replace & Accept.");
                  }}
                />
              </div>
            ) : (
              <ImageZoom className="min-h-[240px] w-full overflow-hidden rounded-lg border bg-muted/30 md:min-h-[320px]">
                <Image
                  alt="Payment proof"
                  className="h-full w-full object-contain"
                  fill
                  src={proofImagePath}
                />
              </ImageZoom>
            )}
          </div>
        </div>

        <DialogFooter
          className={cn(
            "flex w-full border-t px-5 py-3",
            mode === "camera" && "pt-2",
          )}
        >
          <div className={"flex w-full items-center justify-end gap-3"}>
            {canReplaceProof ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <input
                  accept={IMAGE_UPLOAD_ACCEPT_ATTR}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                  }}
                  ref={fileInputRef}
                  type="file"
                />

                {mode === "camera" && (
                  <Button
                    disabled={isProcessing}
                    onClick={() => setMode("view")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Back to Proof
                  </Button>
                )}
                {mode !== "camera" && (
                  <>
                    <Button
                      disabled={isProcessing}
                      onClick={() => setMode("camera")}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Use Camera
                    </Button>
                    <Button
                      disabled={isProcessing}
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Upload File
                    </Button>
                    <span className="max-w-[140px] truncate text-muted-foreground text-xs">
                      {selectedFile?.name ?? "No file chosen"}
                    </span>
                    <Button
                      disabled={isProcessing || !selectedFile}
                      onClick={handleReplaceAndAccept}
                      size="sm"
                      type="button"
                    >
                      <RefreshCw
                        className={cn(
                          "size-3.5",
                          isProcessing && "animate-spin",
                        )}
                      />
                      {isProcessing ? "Updating…" : "Replace & Accept"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
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
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
