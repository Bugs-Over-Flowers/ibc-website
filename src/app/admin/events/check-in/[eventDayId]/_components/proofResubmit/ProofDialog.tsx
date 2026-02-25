"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import { getPaymentProofSignedUrl } from "@/server/registration/mutations/getPaymentProofSignedUrl";
import { useVerifyPaymentProof } from "../../_hooks/useVerifyPaymentProof";

interface ProofDialogProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
  registrationId: string;
}

export default function ProofDialog({
  paymentProofStatus,
  registrationId,
}: ProofDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const { execute: fetchSignedUrl, isPending: isFetchingSignedUrl } = useAction(
    tryCatch(getPaymentProofSignedUrl),
    {
      onSuccess: ({ signedUrl }) => {
        setSignedUrl(signedUrl);
      },
      onError: (error) => {
        toast.error(error);
      },
      persist: true,
    },
  );

  const {
    execute: acceptPayment,
    optimistic: optimisticPaymentProofStatus,
    isPending: isAcceptingPayment,
  } = useVerifyPaymentProof({ paymentProofStatus });

  const isAccepted = optimisticPaymentProofStatus === "accepted";

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open && signedUrl === null) {
          fetchSignedUrl(registrationId);
        }
      }}
      open={isOpen}
    >
      <DialogTrigger render={<Button>View Payment</Button>} />
      <DialogContent>
        <DialogTitle>Proof of Payment</DialogTitle>

        {isFetchingSignedUrl ? (
          <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
            Loading payment proof...
          </div>
        ) : signedUrl ? (
          <ImageZoom className="h-[420px] w-full">
            <Image
              alt="Proof of Payment"
              className="h-full w-full object-contain"
              fill
              src={signedUrl}
            />
          </ImageZoom>
        ) : (
          <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
            Unable to load payment proof.
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button disabled variant="outline">
            Change Proof of Payment
          </Button>
          <Button
            disabled={isFetchingSignedUrl || isAcceptingPayment || isAccepted}
            onClick={() => acceptPayment(registrationId)}
          >
            {isAcceptingPayment
              ? "Accepting..."
              : isAccepted
                ? "Accepted"
                : "Accept Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
