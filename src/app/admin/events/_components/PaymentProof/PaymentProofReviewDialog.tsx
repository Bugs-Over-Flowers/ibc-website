"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  Save,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { usePaymentProofDecisionActions } from "@/app/admin/events/_hooks/usePaymentProofDecisionActions";
import { usePaymentProofDialogState } from "@/app/admin/events/_hooks/usePaymentProofDialogState";
import { usePaymentProofSignedUrlAction } from "@/app/admin/events/_hooks/usePaymentProofSignedUrlAction";
import { useReplacePaymentProofAction } from "@/app/admin/events/_hooks/useReplacePaymentProofAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import CameraCapture from "./CameraCapture";
import PaymentProofPreviewPanel from "./PaymentProofPreviewPanel";
import PaymentProofUploadPanel from "./PaymentProofUploadPanel";
import PaymentProofViewPanel from "./PaymentProofViewPanel";

type PaymentProofStatus = Enums<"PaymentProofStatus">;

interface PaymentProofReviewDialogProps {
  page: "check-in" | "registration-details";
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  registrationData: {
    registrationId: string;
    eventTitle: string;
    registrantName: string;
    registrantEmail: string;
  };
  initialPaymentProofStatus: PaymentProofStatus;
  trigger?: React.ReactElement;
  onAcceptAction?: (registrationId: string) => Promise<unknown>;
  onRejectAction?: (registrationId: string) => Promise<unknown>;
  onReplaceAction?: (input: {
    registrationId: string;
    uploadedPath: string;
  }) => Promise<unknown>;
  onStatusChange?: (status: PaymentProofStatus) => void;
  onProofPathChange?: (path: string) => void;
}

function getStatusMessage(status: PaymentProofStatus): string {
  switch (status) {
    case "accepted":
      return "This payment proof has been accepted.";
    case "rejected":
      return "This payment proof has been rejected.";
    default:
      return "This payment proof is pending review.";
  }
}

function getStatusConfig(status: PaymentProofStatus) {
  switch (status) {
    case "accepted":
      return {
        className: "border-green-200 bg-green-50 text-green-700",
        icon: <CheckCircle2 className="size-3" />,
      };
    case "rejected":
      return {
        className: "border-red-200 bg-red-50 text-red-700",
        icon: <XCircle className="size-3" />,
      };
    default:
      return {
        className: "border-yellow-200 bg-yellow-50 text-yellow-700",
        icon: <Clock className="size-3" />,
      };
  }
}

export default function PaymentProofReviewDialog({
  page,
  open,
  onOpenChange,
  registrationData,
  initialPaymentProofStatus,
  trigger,
  onAcceptAction,
  onRejectAction,
  onReplaceAction,
  onStatusChange,
  onProofPathChange,
}: PaymentProofReviewDialogProps) {
  const {
    uploadSubmitRef,
    mode,
    setMode,
    paymentProofStatus,
    setPaymentProofStatus,
    selectedFile,
    previewSource,
    previewUrl,
    dialogTitle,
    clearPreview,
    resetToView,
    handleOpenChange,
    handleCapture,
    handleFileSelect,
  } = usePaymentProofDialogState({ initialPaymentProofStatus, onOpenChange });

  const {
    signedUrl,
    isSignedUrlImageError,
    setIsSignedUrlImageError,
    isFetchingSignedUrl,
  } = usePaymentProofSignedUrlAction({
    open,
    registrationId: registrationData.registrationId,
  });

  const { acceptProof, rejectProof, isAccepting, isRejecting } =
    usePaymentProofDecisionActions({
      page,
      registrationData,
      onAcceptAction,
      onRejectAction,
      onStatusChange,
      onStatusResolved: setPaymentProofStatus,
    });

  const { isReplacing, handleReplaceAndAccept } = useReplacePaymentProofAction({
    registrationId: registrationData.registrationId,
    onReplaceAction,
    onStatusChange,
    onProofPathChange,
    onStatusResolved: setPaymentProofStatus,
    onCompleted: () => {
      resetToView();
      onOpenChange?.(false);
    },
  });

  const isAnyActionPending =
    isFetchingSignedUrl || isAccepting || isRejecting || isReplacing;
  const isDecisionLocked = paymentProofStatus !== "pending";
  const statusConfig = getStatusConfig(paymentProofStatus);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className="flex w-[95vw] flex-col p-4 sm:max-w-3xl sm:p-6"
        outsideScroll
      >
        {/* Header */}
        <div className="space-y-3 pr-8">
          <DialogTitle className="flex items-center gap-2 font-medium text-base">
            <CreditCard className="size-4 text-muted-foreground" />
            {dialogTitle}
          </DialogTitle>

          <div className="flex flex-col gap-1.5">
            <Badge
              className={cn(
                "flex w-fit items-center gap-1.5 capitalize",
                statusConfig.className,
              )}
              variant="outline"
            >
              {statusConfig.icon}
              {paymentProofStatus}
            </Badge>
            <p className="text-muted-foreground text-sm">
              {getStatusMessage(paymentProofStatus)}
            </p>
          </div>
        </div>

        {/* Content panel */}
        <div className="py-4">
          {mode === "camera" && (
            <CameraCapture
              disabled={isAnyActionPending}
              onCapture={handleCapture}
            />
          )}
          {mode === "upload" && (
            <PaymentProofUploadPanel
              onFileSelect={handleFileSelect}
              submitRef={uploadSubmitRef}
            />
          )}
          {mode === "preview" && (
            <PaymentProofPreviewPanel previewUrl={previewUrl} />
          )}
          {mode === "view" && (
            <PaymentProofViewPanel
              isFetchingSignedUrl={isFetchingSignedUrl}
              isImageError={isSignedUrlImageError}
              onImageError={() => setIsSignedUrlImageError(true)}
              signedUrl={signedUrl}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-1 flex-wrap gap-2 border-t pt-4 max-sm:*:w-full">
          {/* Camera / Upload mode */}
          {(mode === "camera" || mode === "upload") && (
            <>
              <Button
                disabled={isAnyActionPending}
                onClick={() => {
                  clearPreview();
                  setMode("view");
                }}
                variant="outline"
              >
                <ArrowLeft className="size-3.5" />
                Back to Proof
              </Button>
              <Button
                disabled={isAnyActionPending}
                onClick={() => {
                  clearPreview();
                  setMode("upload");
                }}
                variant="outline"
              >
                <Upload className="size-3.5" />
                Use Upload
              </Button>
              <Button
                disabled={isAnyActionPending}
                onClick={() => {
                  clearPreview();
                  setMode("camera");
                }}
                variant="outline"
              >
                <Camera className="size-3.5" />
                Use Camera
              </Button>
              {mode === "upload" && (
                <Button
                  disabled={isAnyActionPending}
                  onClick={() => uploadSubmitRef.current?.()}
                >
                  <Check className="size-3.5" />
                  Review Selected File
                </Button>
              )}
            </>
          )}

          {/* Preview mode */}
          {mode === "preview" && (
            <>
              <Button
                disabled={isAnyActionPending}
                onClick={() => {
                  clearPreview();
                  setMode(previewSource === "upload" ? "upload" : "camera");
                }}
                variant="outline"
              >
                {previewSource === "upload" ? (
                  <>
                    <RefreshCw className="size-3.5" /> Pick Another File
                  </>
                ) : (
                  <>
                    <Camera className="size-3.5" /> Retake
                  </>
                )}
              </Button>
              <Button
                disabled={isAnyActionPending || !selectedFile}
                onClick={() => handleReplaceAndAccept(selectedFile)}
              >
                <Save className="size-3.5" />
                {isReplacing ? "Saving..." : "Save and Accept"}
              </Button>
            </>
          )}

          {/* View mode */}
          {mode === "view" && (
            <>
              <Button
                disabled={isAnyActionPending}
                onClick={() => handleOpenChange(false)}
                variant="outline"
              >
                <X className="size-3.5" />
                Close
              </Button>
              <Button
                disabled={isAnyActionPending}
                onClick={() => {
                  clearPreview();
                  setMode("camera");
                }}
                variant="outline"
              >
                <Camera className="size-3.5" />
                Use Camera
              </Button>
              <Button
                disabled={isAnyActionPending}
                onClick={() => {
                  clearPreview();
                  setMode("upload");
                }}
                variant="outline"
              >
                <Upload className="size-3.5" />
                Upload File
              </Button>
              <Button
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                disabled={isAnyActionPending || isDecisionLocked}
                onClick={() => rejectProof()}
                variant="outline"
              >
                <XCircle className="size-3.5" />
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-800"
                disabled={isAnyActionPending || isDecisionLocked}
                onClick={() => acceptProof()}
              >
                <CheckCircle2 className="size-3.5" />
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
