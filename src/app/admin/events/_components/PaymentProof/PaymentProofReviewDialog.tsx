"use client";

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
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  registrationId: string;
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

function getStatusClassName(status: PaymentProofStatus): string {
  switch (status) {
    case "accepted":
      return "border-green-200 bg-green-50 text-green-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }
}

export default function PaymentProofReviewDialog({
  open,
  onOpenChange,
  registrationId,
  initialPaymentProofStatus,
  trigger,
  onAcceptAction,
  onRejectAction,
  onReplaceAction,
  onStatusChange,
  onProofPathChange,
}: PaymentProofReviewDialogProps) {
  // UI state: mode, preview file, dialog open/close reset
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

  // Fetch signed URL when dialog opens
  const {
    signedUrl,
    isSignedUrlImageError,
    setIsSignedUrlImageError,
    isFetchingSignedUrl,
  } = usePaymentProofSignedUrlAction({ open, registrationId });

  // Accept / Reject actions
  const { acceptProof, rejectProof, isAccepting, isRejecting } =
    usePaymentProofDecisionActions({
      registrationId,
      onAcceptAction,
      onRejectAction,
      onStatusChange,
      onStatusResolved: setPaymentProofStatus,
    });

  // Replace proof + accept action
  const { isReplacing, handleReplaceAndAccept } = useReplacePaymentProofAction({
    registrationId,
    onReplaceAction,
    onStatusChange,
    onProofPathChange,
    onStatusResolved: setPaymentProofStatus,
    onCompleted: () => {
      resetToView();
      onOpenChange?.(false);
    },
  });

  // Derived flags

  // check if any action is pending
  const isAnyActionPending =
    isFetchingSignedUrl || isAccepting || isRejecting || isReplacing;

  // check if decision is locked (the status has already been resolved by the admin)
  const isDecisionLocked = paymentProofStatus !== "pending";

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className="flex w-[95vw] flex-col p-4 sm:max-w-3xl sm:p-6"
        outsideScroll
      >
        <div className="space-y-3 pr-8">
          <DialogTitle>{dialogTitle}</DialogTitle>

          <div className="space-y-3">
            <Badge
              className={cn(
                "w-fit capitalize",
                getStatusClassName(paymentProofStatus),
              )}
              variant="outline"
            >
              {paymentProofStatus}
            </Badge>
            <div className="text-muted-foreground text-sm">
              {getStatusMessage(paymentProofStatus)}
            </div>
          </div>
        </div>

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

        <DialogFooter className="mt-1 flex-wrap border-t pt-4 max-sm:*:w-full">
          {/* Camera or Upload mode Buttons */}
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
                Use Camera
              </Button>

              {mode === "upload" && (
                <Button
                  disabled={isAnyActionPending}
                  onClick={() => uploadSubmitRef.current?.()}
                >
                  Review Selected File
                </Button>
              )}
            </>
          )}

          {/* Preview Mode Buttons */}
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
                {previewSource === "upload" ? "Pick Another File" : "Retake"}
              </Button>
              <Button
                disabled={isAnyActionPending || !selectedFile}
                onClick={() => handleReplaceAndAccept(selectedFile)}
              >
                {isReplacing ? "Saving..." : "Save and Accept"}
              </Button>
            </>
          )}

          {/* View Proof of Payment Buttons */}
          {mode === "view" && (
            <>
              <Button
                disabled={isAnyActionPending}
                onClick={() => handleOpenChange(false)}
                variant="outline"
              >
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
                Upload File
              </Button>

              <Button
                disabled={isAnyActionPending || isDecisionLocked}
                onClick={() => rejectProof()}
                variant="outline"
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>

              <Button
                disabled={isAnyActionPending || isDecisionLocked}
                onClick={() => acceptProof()}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
