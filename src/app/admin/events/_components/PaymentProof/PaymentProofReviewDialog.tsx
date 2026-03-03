"use client";

import { useEffect, useRef, useState } from "react";
// fetchSignedUrl from useAction is not memoized, so we store it in a ref
// to keep a stable reference and prevent the useEffect from looping.
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { getPaymentProofSignedUrl } from "@/server/registration/mutations/getPaymentProofSignedUrl";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
import { updateRegistrationPaymentProofStatus } from "@/server/registration/mutations/updateRegistrationPaymentProofStatus";
import CameraCapture from "./CameraCapture";
import PaymentProofPreviewPanel from "./PaymentProofPreviewPanel";
import PaymentProofUploadPanel from "./PaymentProofUploadPanel";
import PaymentProofViewPanel from "./PaymentProofViewPanel";

type CameraMode = "view" | "camera" | "upload" | "preview";
type PreviewSource = "camera" | "upload";
type PaymentProofStatus = Enums<"PaymentProofStatus">;

interface PaymentProofReviewDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  registrationId: string;
  initialPaymentProofStatus: PaymentProofStatus;
  trigger?: React.ReactElement;
  enforcePendingDecision?: boolean;
  onAcceptAction?: (registrationId: string) => Promise<unknown>;
  onRejectAction?: (registrationId: string) => Promise<unknown>;
  onReplaceAction?: (input: {
    registrationId: string;
    imageDataUrl: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNextStatus(
  result: unknown,
  fallback: PaymentProofStatus,
): PaymentProofStatus {
  if (isRecord(result) && typeof result.status === "string") {
    if (
      result.status === "pending" ||
      result.status === "accepted" ||
      result.status === "rejected"
    ) {
      return result.status;
    }
  }

  return fallback;
}

function getResultMessage(result: unknown, fallback: string): string {
  if (typeof result === "string" && result.trim()) {
    return result;
  }

  if (isRecord(result) && typeof result.message === "string") {
    return result.message;
  }

  return fallback;
}

function getResultPath(result: unknown): string | null {
  if (isRecord(result) && typeof result.path === "string" && result.path) {
    return result.path;
  }

  return null;
}

function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read image"));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image"));
    };

    reader.readAsDataURL(file);
  });
}

export default function PaymentProofReviewDialog({
  open,
  onOpenChange,
  registrationId,
  initialPaymentProofStatus,
  trigger,
  enforcePendingDecision = true,
  onAcceptAction,
  onRejectAction,
  onReplaceAction,
  onStatusChange,
  onProofPathChange,
}: PaymentProofReviewDialogProps) {
  const uploadSubmitRef = useRef<(() => void) | null>(null);

  // Local UI state: mode, payment proof status, signed URL for viewing, and file preview states.
  const [mode, setMode] = useState<CameraMode>("view");
  const [paymentProofStatus, setPaymentProofStatus] = useState(
    initialPaymentProofStatus,
  );
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isSignedUrlImageError, setIsSignedUrlImageError] = useState(false);

  // File preview states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isReplacing, setIsReplacing] = useState(false);

  // Sync paymentProofStatus with initialPaymentProofStatus prop changes.
  // This ensures the dialog reflects external status updates when reopened.
  useEffect(() => {
    setPaymentProofStatus(initialPaymentProofStatus);
  }, [initialPaymentProofStatus]);

  // Revoke object URL on cleanup to prevent memory leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { execute: fetchSignedUrl, isPending: isFetchingSignedUrl } = useAction(
    tryCatch(getPaymentProofSignedUrl),
    {
      onSuccess: ({ signedUrl: nextSignedUrl }) => {
        setSignedUrl(nextSignedUrl);
        setIsSignedUrlImageError(false);
      },
      onError: (error) => {
        setSignedUrl(null);
        setIsSignedUrlImageError(false);
        toast.error(error);
      },
      persist: true,
    },
  );

  // Store fetchSignedUrl in a ref so the effect below has a stable reference
  // and won't re-run every time useAction recreates the execute function.
  const fetchSignedUrlRef = useRef(fetchSignedUrl);
  useEffect(() => {
    fetchSignedUrlRef.current = fetchSignedUrl;
  });

  // Trigger fetchSignedUrl on the false→true edge of `open`.
  useEffect(() => {
    if (!open) return;

    setSignedUrl(null);
    setIsSignedUrlImageError(false);
    fetchSignedUrlRef.current({ registrationId });
  }, [open, registrationId]);

  // Accept Proof of Payment Action
  const { execute: acceptProof, isPending: isAccepting } = useAction(
    tryCatch(async () =>
      onAcceptAction
        ? onAcceptAction(registrationId)
        : updateRegistrationPaymentProofStatus({
            registrationId,
            status: "accepted",
          }),
    ),
    {
      onSuccess: (result) => {
        const nextStatus = getNextStatus(result, "accepted");
        setPaymentProofStatus(nextStatus);
        onStatusChange?.(nextStatus);
        toast.success(getResultMessage(result, "Payment proof accepted"));
      },
      onError: (error) => toast.error(error),
    },
  );

  // Reject Proof of Payment Action
  const { execute: rejectProof, isPending: isRejecting } = useAction(
    tryCatch(async () =>
      onRejectAction
        ? onRejectAction(registrationId)
        : updateRegistrationPaymentProofStatus({
            registrationId,
            status: "rejected",
          }),
    ),
    {
      onSuccess: (result) => {
        const nextStatus = getNextStatus(result, "rejected");
        setPaymentProofStatus(nextStatus);
        onStatusChange?.(nextStatus);
        toast.success(getResultMessage(result, "Payment proof rejected"));
      },
      onError: (error) => toast.error(error),
    },
  );

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewSource(null);
  };

  const resetDialogState = () => {
    clearPreview();
    setMode("view");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      resetDialogState();
    }
  };

  const handleCapture = (file: File) => {
    clearPreview();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewSource("camera");
    setMode("preview");
  };

  // Called by PaymentProofUploadPanel when "Review Selected File" is clicked.
  const handleFileSelect = (file: File) => {
    clearPreview();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewSource("upload");
    setMode("preview");
  };

  const handleReplaceAndAccept = async () => {
    if (!selectedFile) {
      toast.error("No image selected");
      return;
    }

    setIsReplacing(true);

    try {
      const imageDataUrl = await convertFileToDataUrl(selectedFile);
      const result = await tryCatch(
        onReplaceAction
          ? onReplaceAction({ registrationId, imageDataUrl })
          : replacePaymentProofAndAccept({ registrationId, imageDataUrl }),
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const nextStatus = getNextStatus(result.data, "accepted");
      setPaymentProofStatus(nextStatus);
      onStatusChange?.(nextStatus);

      const path = getResultPath(result.data);
      if (path) {
        onProofPathChange?.(path);
      }

      toast.success(getResultMessage(result.data, "Payment proof replaced"));
      resetDialogState();
      onOpenChange?.(false);
    } catch {
      toast.error("Failed to process selected image");
    } finally {
      setIsReplacing(false);
    }
  };

  const isAnyActionPending =
    isFetchingSignedUrl || isAccepting || isRejecting || isReplacing;
  const isDecisionLocked =
    enforcePendingDecision && paymentProofStatus !== "pending";
  const canAccept = !isDecisionLocked && paymentProofStatus !== "accepted";
  const canReject =
    !isDecisionLocked &&
    paymentProofStatus !== "rejected" &&
    paymentProofStatus !== "accepted";

  const dialogTitle =
    mode === "camera"
      ? "Capture New Proof of Payment"
      : mode === "upload"
        ? "Upload New Proof of Payment"
        : mode === "preview"
          ? "Review New Proof of Payment"
          : "Proof of Payment";

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col sm:max-w-3xl">
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

        <DialogFooter className="mt-1 flex-wrap border-t pt-4">
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
                onClick={handleReplaceAndAccept}
              >
                {isReplacing ? "Saving..." : "Save and Accept"}
              </Button>
            </>
          )}

          {/* View Proof of Payment Buttons*/}
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
                disabled={isAnyActionPending || !canReject}
                onClick={() => rejectProof()}
                variant="outline"
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>

              <Button
                disabled={isAnyActionPending || !canAccept}
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
