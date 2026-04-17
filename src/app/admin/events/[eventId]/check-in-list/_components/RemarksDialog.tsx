"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RemarksDialogProps {
  remarks: string;
  participantName: string;
}

export default function RemarksDialog({
  remarks,
  participantName,
}: RemarksDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="h-7 gap-1.5 px-2.5 text-xs"
            size="sm"
            variant="outline"
          />
        }
      >
        <MessageSquare />
        View
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-medium text-base">
            Remarks - {participantName}
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-foreground text-sm leading-relaxed">
          {remarks}
        </div>
      </DialogContent>
    </Dialog>
  );
}
