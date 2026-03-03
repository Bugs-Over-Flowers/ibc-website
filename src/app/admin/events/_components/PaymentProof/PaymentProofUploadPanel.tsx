"use client";

import type { RefObject } from "react";
import { useAppForm } from "@/hooks/_formHooks";

interface PaymentProofUploadPanelProps {
  submitRef: RefObject<(() => void) | null>;
  onFileSelect: (file: File) => void;
}

export default function PaymentProofUploadPanel({
  submitRef,
  onFileSelect,
}: PaymentProofUploadPanelProps) {
  const form = useAppForm({
    defaultValues: {
      proofFiles: [] as File[],
    },
    onSubmit: async ({ value }) => {
      const file = value.proofFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
  });

  // Expose handleSubmit to the parent via submitRef so the
  // "Review Selected File" button in the dialog footer can trigger it.
  submitRef.current = form.handleSubmit;

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
