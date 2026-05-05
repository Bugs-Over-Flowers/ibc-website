"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { Camera, FileImage, GripVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { EditorProof } from "@/app/admin/events/_hooks/usePaymentProofEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { cn } from "@/lib/utils";
import PaymentProofDeleteConfirmDialog from "./PaymentProofDeleteConfirmDialog";

interface PaymentProofReviewItemProps {
  proof: EditorProof;
  index: number;
  originalIndex: number;
  onRemove: (tempId: string) => void;
}

const sourceConfig = {
  existing: {
    label: "Saved",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: FileImage,
  },
  camera: {
    label: "Camera",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    icon: Camera,
  },
  file: {
    label: "File",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    icon: FileImage,
  },
} as const;

export default function PaymentProofReviewItem({
  proof,
  index,
  originalIndex,
  onRemove,
}: PaymentProofReviewItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { ref, handleRef, isDragSource } = useSortable({
    id: proof.tempId,
    index,
    group: "proofs",
  });

  const source = sourceConfig[proof.source];
  const SourceIcon = source.icon;

  const handleDelete = () => {
    if (proof.isNew) {
      setDeleteOpen(true);
      return;
    }

    onRemove(proof.tempId);
  };

  return (
    <>
      <div
        className={cn(
          "relative flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3",
          isDragSource && "opacity-50",
          proof.isDeleted && "border-dashed bg-muted/20 opacity-70",
        )}
        ref={ref}
      >
        <button
          className="mt-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
          ref={handleRef}
          type="button"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              className={cn("gap-1.5", source.className)}
              variant="outline"
            >
              <SourceIcon className="size-3" />
              {source.label}
            </Badge>
            {proof.isDeleted && (
              <Badge variant="outline">Marked for delete</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {proof.signedUrl ? (
              <ImageZoom className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border/40 bg-muted/10">
                <Image
                  alt={`Proof ${originalIndex + 1}`}
                  className="object-contain"
                  fill
                  src={proof.signedUrl}
                />
              </ImageZoom>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/10 text-[10px] text-muted-foreground">
                NEW
              </div>
            )}

            <div className="min-w-0">
              <div className="truncate font-medium text-sm">
                Proof {originalIndex + 1}
              </div>
              <div className="truncate text-muted-foreground text-xs">
                {proof.file?.name ?? proof.path ?? "Pending proof"}
              </div>
            </div>
          </div>
        </div>

        <Button
          className="mt-1 shrink-0"
          onClick={handleDelete}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <PaymentProofDeleteConfirmDialog
        onConfirm={() => {
          onRemove(proof.tempId);
          setDeleteOpen(false);
        }}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        proofLabel={`Proof ${originalIndex + 1}`}
      />
    </>
  );
}
