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
      </form.AppField>
    </form>
  );
}
