"use client";

import { Info, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/shadcn-io/dropzone";
import { IMAGE_UPLOAD_ACCEPT, isValidImageUploadFile } from "@/lib/fileUpload";
import { cn } from "@/lib/utils";
import type { useRegistrationStep3 } from "../../../_hooks/useRegistrationStep3";
import PaymentProofGrid from "../PaymentProofGrid";

interface Step3PaymentProofSectionProps {
  form: ReturnType<typeof useRegistrationStep3>;
}

const MAX_PROOFS = 10;

const getFileSignature = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}-${file.type}`;

const mergeUniqueFiles = (currentFiles: File[], nextFiles: File[]) => {
  const seen = new Set(currentFiles.map(getFileSignature));
  const merged = [...currentFiles];

  for (const file of nextFiles) {
    const signature = getFileSignature(file);
    if (seen.has(signature)) continue;
    merged.push(file);
    seen.add(signature);
    if (merged.length >= MAX_PROOFS) break;
  }

  return merged;
};

function PaymentProofsFieldInner({
  field,
}: {
  field: {
    state: {
      value: unknown;
      meta: { errors: Array<{ message?: string } | undefined> };
    };
    handleChange: (value: File[]) => void;
  };
}) {
  const files = (field.state.value as File[]) ?? [];
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => {
      if (f.type?.startsWith("image/")) {
        return URL.createObjectURL(f);
      }
      return "";
    });
    setPreviews(urls);
    return () => {
      for (const u of urls) {
        if (u) URL.revokeObjectURL(u);
      }
    };
  }, [files]);

  const addFiles = useCallback(
    (nextFiles: File[]) => {
      const validFiles = nextFiles.filter(isValidImageUploadFile);
      if (validFiles.length === 0) return;

      field.handleChange(mergeUniqueFiles(files, validFiles));
    },
    [files, field],
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      field.handleChange(next.length > 0 ? next : []);
    },
    [files, field],
  );

  return (
    <div className="space-y-3">
      <Label className="font-semibold text-foreground text-sm">
        Upload Payment Proofs *
      </Label>

      <Alert className="rounded-xl border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle>File requirements</AlertTitle>
        <AlertDescription>
          Max 5MB per file, up to 10 files. Accepted formats: PNG, JPG, JPEG.
        </AlertDescription>
      </Alert>

      {files.length > 0 && (
        <PaymentProofGrid
          files={files}
          onRemove={removeFile}
          previews={previews}
        />
      )}

      {files.length < MAX_PROOFS && (
        <Dropzone
          accept={IMAGE_UPLOAD_ACCEPT}
          className={cn(
            "min-h-24 rounded-xl border-2 border-dashed bg-background p-4 transition-all hover:bg-primary/5",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
          )}
          maxFiles={MAX_PROOFS - files.length}
          multiple
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={() => setDragActive(true)}
          onDrop={(acceptedFiles) => {
            setDragActive(false);
            addFiles(acceptedFiles);
          }}
          src={undefined}
        >
          <div className="flex w-full flex-col items-center justify-center gap-1 text-center">
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground text-sm">
              {files.length === 0
                ? "Upload Proof of Payment"
                : "Add another proof"}
            </span>
            <span className="text-muted-foreground text-xs">
              {files.length} / {MAX_PROOFS} — PNG, JPG, JPEG up to 5MB
            </span>
          </div>
        </Dropzone>
      )}

      <FieldError errors={field.state.meta.errors} reserveSpace />
    </div>
  );
}

export default function Step3PaymentProofSection({
  form,
}: Step3PaymentProofSectionProps) {
  return (
    <form.AppField name="paymentProofs">
      {(field) => <PaymentProofsFieldInner field={field} />}
    </form.AppField>
  );
}
