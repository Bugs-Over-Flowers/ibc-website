"use client";

import { useEffect, useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/_formHooks";

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  initialRemark: string;
  onSave: (remark: string) => void;
}

export default function RemarksModal({
  isOpen,
  onClose,
  participantName,
  initialRemark,
  onSave,
}: RemarksModalProps) {
  const [remark, setRemark] = useState(initialRemark);

  const form = useAppForm({
    defaultValues: {
      remark: initialRemark,
    },
    validators: {
      onSubmit: z.object({
        remark: z.string(),
      }),
    },
  });

  // Sync with initialRemark when modal opens
  useEffect(() => {
    if (isOpen) {
      setRemark(initialRemark);
    }
  }, [isOpen, initialRemark]);

  const handleSave = () => {
    onSave(remark.trim());
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent>
        <form>
          <DialogTitle>Remarks - {participantName}</DialogTitle>

          <div className="space-y-4 py-4">
            <form.AppField name="remark">
              {(field) => (
                <field.TextareaField
                  placeholder="Enter remarks here..."
                  rows={4}
                />
              )}
            </form.AppField>
            <div className="text-muted-foreground text-sm">
              {remark.length} characters
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
