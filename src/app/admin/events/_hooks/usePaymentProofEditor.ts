"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { uploadPaymentProof } from "@/lib/storage/uploadPaymentProof";
import { updatePaymentProofSet } from "@/server/registration/mutations/updatePaymentProofSet";

export interface EditorProof {
  tempId: string;
  proofImageId?: string;
  path?: string;
  signedUrl?: string;
  orderIndex: number;
  originalIndex: number;
  source: "existing" | "camera" | "file";
  isNew: boolean;
  isDeleted: boolean;
  file?: File;
}

interface UsePaymentProofEditorProps {
  registrationId: string;
  initialProofs: Array<{
    proofImageId: string;
    path: string;
    signedUrl: string;
    orderIndex: number | null;
  }>;
  onSaved?: () => void;
  onDiscarded?: () => void;
  onProofsSaved?: () => void;
}

export function usePaymentProofEditor({
  registrationId,
  initialProofs,
  onSaved,
  onDiscarded,
  onProofsSaved,
}: UsePaymentProofEditorProps) {
  const [proofs, setProofs] = useState<EditorProof[]>([]);
  const [deletedProofImageIds, setDeletedProofImageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isDirty, setIsDirty] = useState(false);

  const buildProofs = useCallback(() => {
    const sorted = [...initialProofs].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
    return sorted.map((p, i) => ({
      tempId: p.proofImageId,
      proofImageId: p.proofImageId,
      path: p.path,
      signedUrl: p.signedUrl,
      orderIndex: i,
      originalIndex: i,
      source: "existing" as const,
      isNew: false,
      isDeleted: false,
    }));
  }, [initialProofs]);

  useEffect(() => {
    setProofs(buildProofs());
    setDeletedProofImageIds(new Set());
    setIsDirty(false);
  }, [buildProofs]);

  const { execute: saveAll, isPending: isSaving } = useAction(
    tryCatch(async (accept: boolean) => {
      const activeProofs = proofs.filter((proof) => !proof.isDeleted);
      const newUploads = activeProofs.filter(
        (proof) => proof.isNew && proof.file,
      );

      const uploadedPaths: Array<{ tempId: string; path: string }> = [];
      for (const upload of newUploads) {
        const path = await uploadPaymentProof(upload.file as File);
        uploadedPaths.push({ tempId: upload.tempId, path });
      }

      const finalProofs = activeProofs.map((proof) => {
        const uploaded = uploadedPaths.find((u) => u.tempId === proof.tempId);
        return {
          proofImageId: uploaded ? undefined : proof.proofImageId,
          path: uploaded?.path ?? proof.path ?? "",
          orderIndex: proof.orderIndex,
        };
      });

      await updatePaymentProofSet({
        registrationId,
        proofs: finalProofs,
        deletedProofImageIds: Array.from(deletedProofImageIds),
        accept,
      });

      onProofsSaved?.();
    }),
    {
      onSuccess: () => {
        toast.success("Payment proofs updated");
        setIsDirty(false);
        onSaved?.();
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const discardAll = useCallback(() => {
    setProofs(buildProofs());
    setDeletedProofImageIds(new Set());
    setIsDirty(false);
    onDiscarded?.();
  }, [buildProofs, onDiscarded]);

  const addProof = useCallback(
    (file: File, signedUrl: string, source: "camera" | "file") => {
      const tempId = `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setProofs((prev) => {
        const nextIndex = prev.filter((proof) => !proof.isDeleted).length;
        const newProof: EditorProof = {
          tempId,
          path: "",
          signedUrl,
          orderIndex: nextIndex,
          originalIndex: nextIndex,
          source,
          isNew: true,
          isDeleted: false,
          file,
        };

        return [...prev, newProof];
      });
      setIsDirty(true);
    },
    [],
  );

  const removeProof = useCallback((tempId: string) => {
    setProofs((prev) => {
      const target = prev.find((proof) => proof.tempId === tempId);
      if (!target) return prev;

      if (target.isNew) {
        if (target.signedUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(target.signedUrl);
        }

        return prev
          .filter((proof) => proof.tempId !== tempId)
          .map((proof, index) => ({
            ...proof,
            orderIndex: proof.isDeleted ? proof.orderIndex : index,
          }));
      }

      return prev.map((proof) => {
        if (proof.tempId !== tempId) return proof;

        if (proof.proofImageId) {
          setDeletedProofImageIds((prevSet) => {
            const next = new Set(prevSet);
            if (proof.isDeleted) {
              next.delete(proof.proofImageId as string);
            } else {
              next.add(proof.proofImageId as string);
            }
            return next;
          });
        }

        return { ...proof, isDeleted: !proof.isDeleted };
      });
    });
    setIsDirty(true);
  }, []);

  const moveProof = useCallback((fromIndex: number, toIndex: number) => {
    setProofs((prev) => {
      const active = prev.filter((proof) => !proof.isDeleted);

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= active.length ||
        toIndex >= active.length
      ) {
        return prev;
      }

      const reordered = [...active];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      let activeCursor = 0;
      return prev.map((proof) => {
        if (proof.isDeleted) {
          return proof;
        }

        const nextProof = reordered[activeCursor++];
        return {
          ...nextProof,
          orderIndex: activeCursor - 1,
        };
      });
    });
    setIsDirty(true);
  }, []);

  return {
    proofs,
    isDirty,
    isSaving,
    addProof,
    removeProof,
    moveProof,
    saveAll,
    discardAll,
  };
}
