"use client";

import { type RefObject, useEffect } from "react";
import { useAppForm } from "@/hooks/_formHooks";

interface UsePaymentProofUploadFormProps {
  submitRef: RefObject<(() => void) | null>;
  onFileSelect: (file: File) => void;
}

export function usePaymentProofUploadForm({
  submitRef,
  onFileSelect,
}: UsePaymentProofUploadFormProps) {
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

  useEffect(() => {
    submitRef.current = form.handleSubmit;
    return () => {
      submitRef.current = null;
    };
  }, [form.handleSubmit, submitRef]);

  return form;
}
