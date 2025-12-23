"use client";

import { Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useApplicationApproval } from "../_hooks/useApplicationApproval";

interface ApplicationActionsProps {
  applicationId: string;
}

export default function ApplicationActions({
  applicationId,
}: ApplicationActionsProps) {
  const {
    showApproveDialog,
    setShowApproveDialog,
    showRejectDialog,
    setShowRejectDialog,
    isApproving,
    isRejecting,
    handleApprove,
    handleReject,
  } = useApplicationApproval(applicationId);

  return (
    <div className="flex gap-2">
      <Button
        disabled={isApproving || isRejecting}
        onClick={() => setShowApproveDialog(true)}
        size="sm"
      >
        <Check className="mr-2 h-4 w-4" />
        Approve
      </Button>

      <Button
        disabled={isApproving || isRejecting}
        onClick={() => setShowRejectDialog(true)}
        size="sm"
        variant="destructive"
      >
        <X className="mr-2 h-4 w-4" />
        Reject
      </Button>

      {/* Approve Dialog */}
      <AlertDialog onOpenChange={setShowApproveDialog} open={showApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new member record and grant access to member
              benefits. Are you sure you want to approve this application?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isApproving} onClick={handleApprove}>
              {isApproving ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog onOpenChange={setShowRejectDialog} open={showRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this application. This action cannot
              be undone. Are you sure you want to reject this application?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRejecting}
              onClick={handleReject}
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
