"use client";

import { useEffect, useRef, useState } from "react";
import type { PaymentStatus } from "@/app/admin/events/_hooks/paymentProofReviewHelpers";

export type DialogMode = "view" | "camera" | "upload" | "preview";
export type PreviewSource = "camera" | "upload";

interface UsePaymentProofDialogStateProps {
  initialPaymentStatus: PaymentStatus;
  onOpenChange?: (open: boolean) => void;
}

export function usePaymentProofDialogState({
  initialPaymentStatus,
  onOpenChange,
}: UsePaymentProofDialogStateProps) {
  const uploadSubmitRef = useRef<(() => void) | null>(null);

  const [mode, setMode] = useState<DialogMode>("view");
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSource, setPreviewSource] = useState<PreviewSource | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync status when prop changes (e.g. dialog reopened with new data)
  useEffect(() => {
    setPaymentStatus(initialPaymentStatus);
  }, [initialPaymentStatus]);

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
    paymentStatus,
    setPaymentStatus,
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
