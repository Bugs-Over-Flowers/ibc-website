"use client";

import { MessageSquare, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/_formHooks";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { updateCheckInRemark } from "@/server/check-in/mutations/updateCheckInRemark";
import DeleteRemarkDialog from "./DeleteRemarkDialog";

interface ViewRemarkDialogProps {
  checkInId: string;
  remarks: string | null;
  participantName: string;
  editOnOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const REMARK_MAX_LENGTH = 500;

const remarkSchema = z.object({
  remarks: z
    .string()
    .min(1, "Remark is required")
    .max(
      REMARK_MAX_LENGTH,
      `Remark cannot exceed ${REMARK_MAX_LENGTH} characters`,
    ),
});

export default function ViewRemarkDialog({
  checkInId,
  remarks,
  participantName,
  editOnOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ViewRemarkDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isDeleting, setDeleting] = useState(false);
  const [displayRemarks, setDisplayRemarks] = useState(remarks);
  const previousRemarksRef = useRef(remarks);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const { execute: doUpdate, isPending: isUpdatePending } = useAction(
    tryCatch(updateCheckInRemark),
    {
      onSuccess: () => {
        router.refresh();
        toast.success("Remark updated successfully");
      },
      onError: (error) => {
        toast.error(
          typeof error === "string" ? error : "Failed to update remark",
        );
      },
    },
  );

  const hasRemark = displayRemarks !== null && displayRemarks.length > 0;

  const form = useAppForm({
    defaultValues: {
      remarks: displayRemarks ?? "",
    },
    validators: {
      onSubmit: remarkSchema,
    },
    onSubmit: async ({ value }) => {
      const previousRemarks = displayRemarks;
      setDisplayRemarks(value.remarks);

      const result = await doUpdate({ checkInId, remarks: value.remarks });

      if (result.success) {
        setMode("view");
        previousRemarksRef.current = value.remarks;
        form.reset({ remarks: value.remarks });
      } else {
        setDisplayRemarks(previousRemarks);
      }
    },
  });

  useEffect(() => {
    if (remarks !== previousRemarksRef.current) {
      previousRemarksRef.current = remarks;
      setDisplayRemarks(remarks);
      if (mode === "view") {
        form.reset({ remarks: remarks ?? "" });
      }
    }
  }, [remarks, form, mode]);

  useEffect(() => {
    if (!isOpen) {
      setMode("view");
      return;
    }

    if (editOnOpen || !hasRemark) {
      setMode("edit");
    }
  }, [isOpen, editOnOpen, hasRemark]);

  const handleOpenChange = (value: boolean) => {
    if (!value && isUpdatePending) return;
    setOpen(value);
    if (!value) {
      setMode("view");
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        {!isControlled && (
          <DialogTrigger
            render={
              <Button
                className="h-7 gap-1.5 px-2.5 text-xs"
                size="sm"
                variant="outline"
              />
            }
          >
            {hasRemark ? <MessageSquare /> : <Plus />}
            {hasRemark ? "View" : "Add"}
          </DialogTrigger>
        )}
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-medium text-base">
              {mode === "edit"
                ? `${hasRemark ? "Edit" : "Add"} Remark - ${participantName}`
                : hasRemark
                  ? `Remarks - ${participantName}`
                  : `Add Remark - ${participantName}`}
            </DialogTitle>
          </DialogHeader>

          {mode === "view" ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-foreground text-sm leading-relaxed">
                {displayRemarks ?? (
                  <span className="text-muted-foreground/60">
                    No remark added.
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  disabled={isUpdatePending}
                  onClick={() => {
                    setMode("edit");
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Pencil />
                  Edit
                </Button>
                {hasRemark && (
                  <Button
                    disabled={isUpdatePending}
                    onClick={() => {
                      setDeleting(true);
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <form.AppField name="remarks">
                {(field) => (
                  <div className="grid gap-2">
                    <textarea
                      className="w-full resize-none rounded-lg border bg-muted/30 px-4 py-3 text-foreground text-sm leading-relaxed outline-none ring-1 ring-border ring-inset transition focus:bg-background focus:ring-2 focus:ring-ring"
                      maxLength={REMARK_MAX_LENGTH}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter remark..."
                      rows={4}
                      value={field.state.value}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                  </div>
                )}
              </form.AppField>

              <div className="mt-4 flex items-center justify-between gap-2">
                <form.Subscribe selector={(s) => s.values.remarks?.length ?? 0}>
                  {(length) => (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {length}/{REMARK_MAX_LENGTH}
                    </span>
                  )}
                </form.Subscribe>

                <div className="flex items-end gap-2">
                  <Button
                    disabled={isUpdatePending}
                    onClick={() => {
                      if (hasRemark) {
                        form.reset({ remarks: displayRemarks ?? "" });
                        setMode("view");
                        return;
                      }

                      setOpen(false);
                    }}
                    type="button"
                    variant="outline"
                  >
                    <X />
                    Cancel
                  </Button>

                  <form.AppForm>
                    <form.SubmitButton
                      isSubmittingLabel="Saving..."
                      label="Save"
                    />
                  </form.AppForm>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <DeleteRemarkDialog
        checkInId={checkInId}
        onDeleted={() => {
          setDisplayRemarks(null);
          setOpen(false);
        }}
        onOpenChange={setDeleting}
        open={isDeleting}
        participantName={participantName}
      />
    </>
  );
}
