"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
import { useReplacePaymentProof } from "../../_hooks/useReplacePaymentProof";
import { useVerifyPaymentProof } from "../../_hooks/useVerifyPaymentProof";
import Camera from "./Camera";

interface ProofDialogProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
  proofImagePath: string;
  registrationId: string;
}

type CameraMode = "view" | "camera" | "preview";

export default function ProofDialog({
  paymentProofStatus,
  proofImagePath,
  registrationId,
}: ProofDialogProps) {
  const [mode, setMode] = useState<CameraMode>("view");
  const [isOpen, setIsOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const { execute: replacePaymentProof, isPending: isReplacingPaymentProof } =
    useReplacePaymentProof();

  const isAccepted = optimisticPaymentProofStatus === "accepted";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearCapturedPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setCapturedFile(null);
    setPreviewUrl(null);
  };

  const convertFileToDataUrl = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Failed to read captured image"));
      };

      reader.onerror = () => {
        reject(new Error("Failed to read captured image"));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleCapture = (file: File) => {
    clearCapturedPreview();
    setCapturedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMode("preview");
  };

  const handleRetake = () => {
    clearCapturedPreview();
    setMode("camera");
  };

  const handleAcceptCapturedImage = async () => {
    if (!capturedFile) {
      toast.error("No image captured yet");
      return;
    }

    try {
      const imageDataUrl = await convertFileToDataUrl(capturedFile);

      const result = await replacePaymentProof({
        imageDataUrl,
        registrationId,
      });

      if (result.success) {
        clearCapturedPreview();
        setMode("view");
        setIsOpen(false);
      }
    } catch {
      toast.error("Failed to process captured image");
    }
  };

  const isAnyActionPending =
    isFetchingSignedUrl || isAcceptingPayment || isReplacingPaymentProof;

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open) {
          fetchSignedUrl({
            proofPathHint: proofImagePath,
            registrationId,
          });
        }

        if (!open) {
          clearCapturedPreview();
          setMode("view");
        }
      }}
      open={isOpen}
    >
      <DialogTrigger render={<Button>View Payment</Button>} />
      <DialogContent>
        <DialogTitle>
          {mode === "camera"
            ? "Capture New Proof of Payment"
            : mode === "preview"
              ? "Review Captured Proof"
              : "Proof of Payment"}
        </DialogTitle>

        <ProofRenderBody
          handleCapture={handleCapture}
          isAnyActionPending={isAnyActionPending}
          isFetchingSignedUrl={isFetchingSignedUrl}
          mode={mode}
          previewUrl={previewUrl}
          signedUrl={signedUrl}
        />
        <ProofDialogFooter
          acceptPayment={acceptPayment}
          capturedFile={capturedFile}
          clearCapturedPreview={clearCapturedPreview}
          handleAcceptCapturedImage={handleAcceptCapturedImage}
          handleRetake={handleRetake}
          isAccepted={isAccepted}
          isAcceptingPayment={isAcceptingPayment}
          isAnyActionPending={isAnyActionPending}
          isReplacingPaymentProof={isReplacingPaymentProof}
          mode={mode}
          registrationId={registrationId}
          setMode={setMode}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ProofRenderBodyProps {
  mode: CameraMode;
  signedUrl: string | null;
  previewUrl: string | null;
  isAnyActionPending: boolean;
  isFetchingSignedUrl: boolean;
  handleCapture: (file: File) => void;
}

const ProofRenderBody = ({
  mode,
  signedUrl,
  previewUrl,
  isAnyActionPending,
  handleCapture,
  isFetchingSignedUrl,
}: ProofRenderBodyProps) => {
  if (mode === "camera") {
    return <Camera disabled={isAnyActionPending} onCapture={handleCapture} />;
  }

  if (mode === "preview") {
    return previewUrl ? (
      <ImageZoom className="h-[420px] w-full">
        <Image
          alt="Captured proof of payment"
          className="h-full w-full object-contain"
          fill
          src={previewUrl}
        />
      </ImageZoom>
    ) : (
      <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
        No captured image preview available.
      </div>
    );
  }

  if (isFetchingSignedUrl) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
        Loading payment proof...
      </div>
    );
  }

  if (signedUrl) {
    return (
      <ImageZoom className="h-[420px] w-full">
        <Image
          alt="Proof of Payment"
          className="h-full w-full object-contain"
          fill
          src={signedUrl}
        />
      </ImageZoom>
    );
  }

  return (
    <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
      Unable to load payment proof.
    </div>
  );
};

interface ProofDialogFooterProps {
  mode: CameraMode;
  isAnyActionPending: boolean;
  capturedFile: File | null;
  isReplacingPaymentProof: boolean;
  isAccepted: boolean;
  handleRetake: () => void;
  handleAcceptCapturedImage: () => void;
  acceptPayment: (registrationId: string) => void;
  registrationId: string;
  clearCapturedPreview: () => void;
  setMode: React.Dispatch<React.SetStateAction<CameraMode>>;
  isAcceptingPayment: boolean;
}

function ProofDialogFooter({
  mode,
  setMode,
  isAnyActionPending,
  capturedFile,
  isReplacingPaymentProof,
  isAccepted,
  handleRetake,
  handleAcceptCapturedImage,
  isAcceptingPayment,
  registrationId,
  clearCapturedPreview,
  acceptPayment,
}: ProofDialogFooterProps) {
  if (mode === "camera") {
    return (
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button
          disabled={isAnyActionPending}
          onClick={() => {
            clearCapturedPreview();
            setMode("view");
          }}
          variant="outline"
        >
          Back to Proof
        </Button>
      </DialogFooter>
    );
  }

  if (mode === "preview") {
    return (
      <DialogFooter>
        <Button
          disabled={isAnyActionPending}
          onClick={handleRetake}
          variant="outline"
        >
          Retake
        </Button>
        <Button
          disabled={isAnyActionPending || !capturedFile}
          onClick={handleAcceptCapturedImage}
        >
          {isReplacingPaymentProof ? "Saving..." : "Accept Picture"}
        </Button>
      </DialogFooter>
    );
  }

  return (
    <DialogFooter>
      <DialogClose render={<Button variant="outline">Cancel</Button>} />
      <Button
        disabled={isAnyActionPending || isAccepted}
        onClick={() => {
          clearCapturedPreview();
          setMode("camera");
        }}
        variant="outline"
      >
        Change Proof of Payment
      </Button>
      <Button
        disabled={isAnyActionPending || isAccepted}
        onClick={() => acceptPayment(registrationId)}
      >
        {isAcceptingPayment
          ? "Accepting..."
          : isAccepted
            ? "Accepted"
            : "Accept Payment"}
      </Button>
    </DialogFooter>
  );
}
