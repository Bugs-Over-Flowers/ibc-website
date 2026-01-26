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
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <MessageSquare />
        View
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remarks for {participantName}</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border p-4 text-sm">{remarks}</div>
      </DialogContent>
    </Dialog>
  );
}
