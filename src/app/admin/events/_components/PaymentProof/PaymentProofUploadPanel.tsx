"use client";

import type { RefObject } from "react";
import { usePaymentProofUploadForm } from "@/app/admin/events/_hooks/usePaymentProofUploadForm";

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
            accept={{ "image/*": [] }}
            description="Upload one proof-of-payment image. Accepted files are any image type up to 10 MB. After review, the new image will replace the current stored proof."
            label="Proof of Payment"
            layout="banner"
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
          />
        )}
      </form.AppField>
    </form>
  );
}
