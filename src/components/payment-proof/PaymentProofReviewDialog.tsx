"use client";

import { useStore } from "@tanstack/react-form";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { getPaymentProofSignedUrl } from "@/server/registration/mutations/getPaymentProofSignedUrl";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
import { updateRegistrationPaymentProofStatus } from "@/server/registration/mutations/updateRegistrationPaymentProofStatus";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";
import CameraCapture from "./CameraCapture";

type CameraMode = "view" | "camera" | "upload" | "preview";
type PreviewSource = "camera" | "upload";
type PaymentProofStatus = Enums<"PaymentProofStatus">;

interface PaymentProofReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  initialPaymentProofStatus: PaymentProofStatus;
  trigger?: React.ReactElement;
  allowReject?: boolean;
  allowUpload?: boolean;
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

export default function PaymentProofReviewDialog({
  open,
  onOpenChange,
  registrationId,
  initialPaymentProofStatus,
  trigger,
  allowReject = false,
  allowUpload = false,
  enforcePendingDecision = true,
  onAcceptAction,
  onRejectAction,
  onReplaceAction,
  onStatusChange,
  onProofPathChange,
}: PaymentProofReviewDialogProps) {
  const [mode, setMode] = useState<CameraMode>("view");
  const [paymentProofStatus, setPaymentProofStatus] = useState(
    initialPaymentProofStatus,
  );
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isSignedUrlImageError, setIsSignedUrlImageError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const uploadForm = useAppForm({
    defaultValues: {
      proofFiles: [] as File[],
    },
    onSubmit: async () => {},
  });

  const uploadedFiles = useStore(
    uploadForm.store,
    (state) => state.values.proofFiles,
  );
  const selectedUploadFile = uploadedFiles[0] ?? null;

  useEffect(() => {
    setPaymentProofStatus(initialPaymentProofStatus);
  }, [initialPaymentProofStatus]);

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
        toast.error(error);
      },
      persist: true,
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
    uploadForm.setFieldValue("proofFiles", []);
    setMode("view");
  };

  const convertFileToDataUrl = async (file: File) =>
    new Promise<string>((resolve, reject) => {
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

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setSignedUrl(null);
      setIsSignedUrlImageError(false);
      fetchSignedUrl({ registrationId });
      return;
    }

    resetDialogState();
  };

  const runAction = async <T,>(promise: Promise<T>): Promise<T | null> => {
    const result = await tryCatch(promise);

    if (!result.success) {
      toast.error(result.error);
      return null;
    }

    return result.data;
  };

  const syncStatus = (status: PaymentProofStatus) => {
    setPaymentProofStatus(status);
    onStatusChange?.(status);
  };

  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      const result = await runAction(
        onAcceptAction
          ? onAcceptAction(registrationId)
          : updateRegistrationPaymentProofStatus({
              registrationId,
              status: "accepted",
            }),
      );

      if (!result) {
        return;
      }

      const nextStatus = getNextStatus(result, "accepted");
      syncStatus(nextStatus);
      toast.success(getResultMessage(result, "Payment proof accepted"));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);

    try {
      const result = await runAction(
        onRejectAction
          ? onRejectAction(registrationId)
          : updateRegistrationPaymentProofStatus({
              registrationId,
              status: "rejected",
            }),
      );

      if (!result) {
        return;
      }

      const nextStatus = getNextStatus(result, "rejected");
      syncStatus(nextStatus);
      toast.success(getResultMessage(result, "Payment proof rejected"));
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCapture = (file: File) => {
    clearPreview();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewSource("camera");
    setMode("preview");
  };

  const handleReviewUpload = () => {
    if (!selectedUploadFile) {
      toast.error("Select an image first");
      return;
    }

    clearPreview();
    setSelectedFile(selectedUploadFile);
    setPreviewUrl(URL.createObjectURL(selectedUploadFile));
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
      const result = await runAction(
        onReplaceAction
          ? onReplaceAction({
              registrationId,
              imageDataUrl,
            })
          : replacePaymentProofAndAccept({
              registrationId,
              imageDataUrl,
            }),
      );

      if (!result) {
        return;
      }

      const nextStatus = getNextStatus(result, "accepted");
      syncStatus(nextStatus);

      const path = getResultPath(result);
      if (path) {
        onProofPathChange?.(path);
      }

      toast.success(getResultMessage(result, "Payment proof replaced"));
      resetDialogState();
      onOpenChange(false);
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
  const canAccept = isDecisionLocked
    ? false
    : paymentProofStatus !== "accepted";
  const canReject =
    allowReject &&
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <uploadForm.AppField name="proofFiles">
              {(field) => (
                <field.FileDropzoneField
                  accept={{
                    "image/jpeg": [],
                    "image/jpg": [],
                    "image/png": [],
                  }}
                  description="Upload JPG or PNG proof of payment."
                  label="Proof of Payment"
                  layout="banner"
                  maxFiles={1}
                />
              )}
            </uploadForm.AppField>
          </form>
        )}

        {mode === "preview" &&
          (previewUrl ? (
            <ImageZoom className="h-[420px] w-full">
              <Image
                alt="Selected proof of payment"
                className="h-full w-full object-contain"
                fill
                src={previewUrl}
              />
            </ImageZoom>
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
              No preview available.
            </div>
          ))}

        {mode === "view" &&
          (isFetchingSignedUrl ? (
            <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
              Loading payment proof...
            </div>
          ) : signedUrl && !isSignedUrlImageError ? (
            <ImageZoom className="h-[420px] w-full">
              <Image
                alt="Proof of Payment"
                className="h-full w-full object-contain"
                fill
                onError={() => {
                  setIsSignedUrlImageError(true);
                }}
                src={signedUrl}
              />
            </ImageZoom>
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
              Unable to load payment proof.
            </div>
          ))}

        <DialogFooter className="mt-1 flex-wrap border-t pt-4">
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

              {allowUpload && mode === "camera" && (
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
              )}

              {allowUpload && mode === "upload" && (
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
              )}

              {mode === "upload" && (
                <Button
                  disabled={isAnyActionPending || !selectedUploadFile}
                  onClick={handleReviewUpload}
                >
                  Review Selected File
                </Button>
              )}
            </>
          )}

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

              {allowUpload && (
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
              )}

              {allowReject && (
                <Button
                  disabled={isAnyActionPending || !canReject}
                  onClick={handleReject}
                  variant="outline"
                >
                  {isRejecting ? "Rejecting..." : "Reject"}
                </Button>
              )}

              <Button
                disabled={isAnyActionPending || !canAccept}
                onClick={handleAccept}
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
