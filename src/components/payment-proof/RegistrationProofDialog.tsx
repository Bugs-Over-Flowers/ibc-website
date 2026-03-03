"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Enums } from "@/lib/supabase/db.types";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";
import PaymentProofReviewDialog from "./PaymentProofReviewDialog";

interface RegistrationProofDialogProps {
  registrationId: string;
  paymentProofStatus: Enums<"PaymentProofStatus">;
  /** Optionally control open state externally. When omitted, manages its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStatusChange?: (status: Enums<"PaymentProofStatus">) => void;
  /** Rendered as the dialog trigger. Defaults to a "View Payment" button. */
  trigger?: React.ReactElement;
}

export default function RegistrationProofDialog({
  registrationId,
  paymentProofStatus,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onStatusChange,
  trigger,
}: RegistrationProofDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setInternalOpen;

  return (
    <PaymentProofReviewDialog
      allowReject={false}
      allowUpload={false}
      enforcePendingDecision={false}
      initialPaymentProofStatus={paymentProofStatus}
      onAcceptAction={async (id) => {
        const result = await verifyPayment(id);
        return {
          message: result,
          status: "accepted" as const,
        };
      }}
      onOpenChange={onOpenChange}
      onReplaceAction={replacePaymentProofAndAccept}
      onStatusChange={onStatusChange}
      open={open}
      registrationId={registrationId}
      trigger={
        !isControlled ? (trigger ?? <Button>View Payment</Button>) : undefined
      }
    />
  );
}
