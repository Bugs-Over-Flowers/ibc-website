"use client";

import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  User,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { cn } from "@/lib/utils";
import { checkInParticipants } from "@/server/events/mutations/checkInParticipants";
import { updateCheckInRemarks } from "@/server/events/mutations/updateCheckInRemarks";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import RemarksModal from "./RemarksModal";

interface ParticipantCheckInDialogProps {
  eventId: string;
  eventTitle: string;
}

export default function ParticipantCheckInDialog({
  eventId,
  eventTitle: _eventTitle,
}: ParticipantCheckInDialogProps) {
  const { eventDayId } = useParams<{ eventDayId: string }>();

  const scanType = useAttendanceStore((s) => s.scanType);
  const participantScanData = useAttendanceStore((s) => s.participantScanData);
  const editedRemarks = useAttendanceStore((s) => s.editedRemarks);
  const setCheckInDialogOpen = useAttendanceStore(
    (s) => s.setCheckInDialogOpen,
  );
  const selectedRemarkParticipantId = useAttendanceStore(
    (s) => s.selectedRemarkParticipantId,
  );
  const setSelectedRemarkParticipantId = useAttendanceStore(
    (s) => s.setSelectedRemarkParticipantId,
  );

  const { execute: doCheckIn, isPending: isCheckInPending } = useAction(
    tryCatch(async () => {
      if (!participantScanData) return;

      const participantId = participantScanData.participant.participantId;
      const editedRemark = editedRemarks[participantId];

      if (isCheckedIn) {
        await updateCheckInRemarks({
          eventDayId,
          participants: [{ participantId, remarks: editedRemark ?? null }],
        });
      } else {
        await checkInParticipants({
          eventDayId,
          participants: [{ participantId, remarks: editedRemark || undefined }],
        });
      }
    }),
    {
      onSuccess: () => {
        toast.success(
          `Check-in successful${participantScanData ? ` for ${participantScanData.participant.firstName} ${participantScanData.participant.lastName}` : ""}`,
        );
        setCheckInDialogOpen(false);
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );

  if (scanType !== "participant" || !participantScanData) return null;

  const { participant, registration, checkIn, affiliation } =
    participantScanData;

  const isCheckedIn = checkIn && checkIn.length > 0;
  const checkInRecord = isCheckedIn ? checkIn[0] : null;

  const hasPendingRemark = (() => {
    if (!participantScanData) return false;
    const editedRemark =
      editedRemarks[participantScanData.participant.participantId];
    if (editedRemark === undefined) return false;
    const originalRemark = checkInRecord?.remarks || "";
    return editedRemark !== originalRemark;
  })();

  const statusColor = isCheckedIn
    ? "bg-green-500/15 text-green-700 border-green-200"
    : "bg-gray-500/15 text-gray-700 border-gray-200";

  const paymentStatusColor =
    registration.paymentProofStatus === "accepted"
      ? "bg-green-500/15 text-green-700 border-green-200"
      : registration.paymentProofStatus === "pending"
        ? "bg-yellow-500/15 text-yellow-700 border-yellow-200"
        : "bg-red-500/15 text-red-700 border-red-200";

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setCheckInDialogOpen(false);
        }}
        open={true}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {participant.firstName} {participant.lastName}
            </DialogTitle>
            <DialogDescription>Participant check-in details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Participant Info */}
            <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{affiliation}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{participant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{participant.contactNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <QrCode className="h-3.5 w-3.5 shrink-0" />
                <code className="text-xs">
                  {participant.participantIdentifier}
                </code>
              </div>
              {participant.isPrincipal && (
                <Badge className="mt-1" variant="secondary">
                  Registrant
                </Badge>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn("capitalize", statusColor)}
                variant="outline"
              >
                {isCheckedIn ? "Checked In" : "Not Checked In"}
              </Badge>
              <Badge
                className={cn("capitalize", paymentStatusColor)}
                variant="outline"
              >
                {registration.paymentProofStatus}
              </Badge>
            </div>

            {/* Check-in time */}
            {checkInRecord && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Checked in at{" "}
                  {new Date(checkInRecord.checkInTime).toLocaleTimeString()}
                </span>
              </div>
            )}

            {registration.note && (
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-muted-foreground text-sm">
                <span className="font-medium">Note: </span>
                {registration.note}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Link
                className="inline-flex w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-4 py-2 font-medium text-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                href={
                  `/admin/events/${eventId}/registration-list/registration/${registration.registrationId}` as Route
                }
              >
                <ExternalLink className="h-4 w-4" />
                View Registration Details
              </Link>

              <Button
                className="w-full justify-start gap-2"
                onClick={() =>
                  setSelectedRemarkParticipantId(participant.participantId)
                }
                variant="outline"
              >
                <MessageSquare className="h-4 w-4" />
                {checkInRecord?.remarks ? "Edit Remark" : "Add Remark"}
              </Button>
            </div>

            {/* Check-in Button */}
            <Button
              className="w-full gap-1.5"
              disabled={(isCheckedIn && !hasPendingRemark) || isCheckInPending}
              onClick={() => doCheckIn()}
              size="lg"
            >
              {isCheckInPending ? (
                <>
                  <Spinner className="size-4" />
                  Processing...
                </>
              ) : isCheckedIn && hasPendingRemark ? (
                "Update Check In Remark"
              ) : isCheckedIn ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Already Checked In
                </span>
              ) : hasPendingRemark ? (
                "Save & Check In"
              ) : (
                "Check In"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedRemarkParticipantId === participant.participantId && (
        <RemarksModal />
      )}
    </>
  );
}
