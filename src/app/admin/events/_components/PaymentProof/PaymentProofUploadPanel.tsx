"use client";

import type { RefObject } from "react";
import { usePaymentProofUploadForm } from "@/app/admin/events/_hooks/usePaymentProofUploadForm";
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_MAX_SIZE } from "@/lib/fileUpload";

interface PaymentProofUploadPanelProps {
  submitRef: RefObject<(() => void) | null>;
  onFileSelect: (file: File) => void;
}

export default function PaymentProofUploadPanel({
  submitRef,
  onFileSelect,
}: PaymentProofUploadPanelProps) {
  const form = usePaymentProofUploadForm({ onFileSelect, submitRef });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="proofFiles">
        {(field) => (
          <field.FileDropzoneField
            accept={IMAGE_UPLOAD_ACCEPT}
            description="Upload one proof-of-payment image. Accepted files are PNG, JPG, or JPEG up to 5 MB. After review, the new image will replace the current stored proof."
            label="Proof of Payment"
            layout="banner"
            maxFiles={1}
            maxSize={IMAGE_UPLOAD_MAX_SIZE}
          />
        )}
      </form.AppField>
    </form>
  );
}
