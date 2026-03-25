"use client";

import { useEffect, useRef, useState } from "react";
import type { PaymentProofStatus } from "@/app/admin/events/_hooks/paymentProofReviewHelpers";

export type DialogMode = "view" | "camera" | "upload" | "preview";
export type PreviewSource = "camera" | "upload";

interface UsePaymentProofDialogStateProps {
  initialPaymentProofStatus: PaymentProofStatus;
  onOpenChange?: (open: boolean) => void;
}

export function usePaymentProofDialogState({
  initialPaymentProofStatus,
  onOpenChange,
}: UsePaymentProofDialogStateProps) {
  const uploadSubmitRef = useRef<(() => void) | null>(null);

  const [mode, setMode] = useState<DialogMode>("view");
  const [paymentProofStatus, setPaymentProofStatus] = useState(
    initialPaymentProofStatus,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync status when prop changes (e.g. dialog reopened with new data)
  useEffect(() => {
    setPaymentProofStatus(initialPaymentProofStatus);
  }, [initialPaymentProofStatus]);

  // Revoke object URL on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewSource(null);
  };

  const resetToView = () => {
    clearPreview();
    setMode("view");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) {
      resetToView();
    }
  };

  const handleCapture = (file: File) => {
    clearPreview();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewSource("camera");
    setMode("preview");
  };

  const handleFileSelect = (file: File) => {
    clearPreview();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewSource("upload");
    setMode("preview");
  };

  const dialogTitle =
    mode === "camera"
      ? "Capture New Proof of Payment"
      : mode === "upload"
        ? "Upload New Proof of Payment"
        : mode === "preview"
          ? "Review New Proof of Payment"
          : "Proof of Payment";

  return {
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
  };
}
