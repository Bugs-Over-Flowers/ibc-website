"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { ArrowLeft, Camera, CheckCircle2, Save, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CameraCapture from "@/app/admin/events/_components/PaymentProof/CameraCapture";
import PaymentProofReviewItem from "@/app/admin/events/_components/PaymentProof/PaymentProofReviewItem";
import { usePaymentProofEditor } from "@/app/admin/events/_hooks/usePaymentProofEditor";
import type { SignedProof } from "@/app/admin/events/_hooks/usePaymentProofSignedUrlAction";
import { Button } from "@/components/ui/button";

interface PaymentProofEditPanelProps {
  registrationId: string;
  initialProofs: SignedProof[];
  onClose: () => void;
  onProofsSaved: () => void;
  onApproveAfterSave: () => Promise<void>;
}

function revokeBlobUrls(proofs: Array<{ isNew: boolean; signedUrl?: string }>) {
  for (const proof of proofs) {
    if (proof.isNew && proof.signedUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(proof.signedUrl);
    }
  }
}

export default function PaymentProofEditPanel({
  registrationId,
  initialProofs,
  onClose,
  onProofsSaved,
  onApproveAfterSave,
}: PaymentProofEditPanelProps) {
  const [mode, setMode] = useState<"edit" | "camera">("edit");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = usePaymentProofEditor({
    registrationId,
    initialProofs,
    onSaved: onClose,
    onDiscarded: onClose,
    onProofsSaved,
  });

  const proofsRef = useRef(editor.proofs);

  useEffect(() => {
    proofsRef.current = editor.proofs;
  }, [editor.proofs]);

  useEffect(() => {
    return () => {
      revokeBlobUrls(proofsRef.current);
    };
  }, []);

  const addFiles = (files: File[], source: "camera" | "file") => {
    for (const file of files) {
      const url = URL.createObjectURL(file);
      editor.addProof(file, url, source);
    }
    setMode("edit");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      addFiles(files, "file");
    }
    event.target.value = "";
  };

  const handleCapture = (file: File) => {
    addFiles([file], "camera");
  };

  const handleBulkUpdateOnly = async () => {
    const result = await editor.saveAll(false);
    if (!result.success) return;

    onClose();
  };

  const handleBulkUpdateAndApprove = async () => {
    const result = await editor.saveAll(true);
    if (!result.success) return;

    await onApproveAfterSave();
    onClose();
  };

  const isAnyActionPending = editor.isSaving;

  return (
    <div className="space-y-4">
      {mode === "camera" ? (
        <CameraCapture
          disabled={isAnyActionPending}
          onCapture={handleCapture}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isAnyActionPending}
              onClick={() => setMode("camera")}
              variant="outline"
            >
              <Camera className="size-3.5" />
              Add with camera
            </Button>
            <Button
              disabled={isAnyActionPending}
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="size-3.5" />
              Add with file
            </Button>
            <input
              accept="image/*"
              className="hidden"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>

          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Edit Proofs ({editor.proofs.length})
          </p>

          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled || !isSortableOperation(event.operation)) {
                return;
              }

              const source = event.operation.source;
              if (!source) return;
              const { initialIndex, index } = source;

              if (initialIndex !== index) {
                editor.moveProof(initialIndex, index);
              }
            }}
          >
            <div className="space-y-2">
              {editor.proofs.map((proof, index) => (
                <PaymentProofReviewItem
                  index={index}
                  key={proof.tempId}
                  onRemove={editor.removeProof}
                  originalIndex={proof.originalIndex}
                  proof={proof}
                />
              ))}
            </div>
          </DragDropProvider>
        </div>
      )}

      <div className="mt-1 flex flex-wrap justify-between gap-2 border-t pt-4 max-sm:*:w-full">
        <Button onClick={() => editor.discardAll()} variant="outline">
          Cancel
        </Button>
        <div className="flex gap-2">
          {mode === "camera" ? (
            <>
              <Button
                disabled={isAnyActionPending}
                onClick={() =>
                  editor.proofs.length > 0 ? setMode("edit") : onClose()
                }
                variant="outline"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                disabled={isAnyActionPending}
                onClick={() => setMode("edit")}
                variant="outline"
              >
                <X className="size-3.5" />
                Cancel camera
              </Button>
            </>
          ) : (
            <>
              <Button
                disabled={isAnyActionPending || !editor.isDirty}
                onClick={handleBulkUpdateOnly}
                variant="outline"
              >
                <Save className="size-3.5" />
                Bulk update only
              </Button>
              <Button
                disabled={isAnyActionPending || !editor.isDirty}
                onClick={handleBulkUpdateAndApprove}
              >
                <CheckCircle2 className="size-3.5" />
                Bulk update and approve
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
