"use client";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { RotateCcw, SquareCenterlineDashedHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ParticipantIdentifier,
  RegistrationIdentifier,
} from "@/lib/validation/utils";
import useAttendanceStore from "../../_hooks/useAttendanceStore";
import { useScanQR } from "../../_hooks/useScanQR";

interface QRCodeScannerProps {
  eventId: string;
}

export default function QRCodeScanner({ eventId }: QRCodeScannerProps) {
  const { eventDayId } = useParams<{ eventDayId: string }>();
  const [mirrored, setMirrored] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  const { execute: scanQRData, isPending: scanPending } = useScanQR({
    eventId,
  });

  const scanType = useAttendanceStore((state) => state.scanType);
  const scannedData = useAttendanceStore((state) => state.scannedData);
  const participantScanData = useAttendanceStore(
    (state) => state.participantScanData,
  );
  const resetScanSession = useAttendanceStore(
    (state) => state.resetScanSession,
  );

  const isCameraPaused =
    scanPending || scannedData !== null || participantScanData !== null;

  const handleResetCamera = () => {
    resetScanSession();
    setScannerKey((k) => k + 1);
  };

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (scanPending || detectedCodes.length === 0) return;

    const code = detectedCodes[0].rawValue;

    const isReg = RegistrationIdentifier.safeParse(code).success;
    const isPar = ParticipantIdentifier.safeParse(code).success;

    if (!isReg && !isPar) {
      toast.error(
        "Invalid QR code — not a valid registration or participant identifier.",
      );
      return;
    }

    await scanQRData(code, eventDayId);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="relative aspect-square w-full bg-black">
        <Scanner
          components={{ finder: false, onOff: true }}
          formats={["qr_code"]}
          key={scannerKey}
          onScan={handleScan}
          paused={isCameraPaused}
          styles={{
            container: { width: "100%", height: "100%" },
            video: {
              objectFit: "cover",
              ...(mirrored && { transform: "scaleX(-1)" }),
            },
          }}
        />
        <button
          aria-label={mirrored ? "Unmirror camera" : "Mirror camera"}
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
          onClick={() => setMirrored((p) => !p)}
          type="button"
        >
          <SquareCenterlineDashedHorizontal size={16} />
        </button>
        <button
          aria-label="Reset camera"
          className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-white/80 text-xs backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
          onClick={handleResetCamera}
          type="button"
        >
          <RotateCcw size={14} />
          Reset Camera
        </button>
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium text-xs backdrop-blur-sm ${
              isCameraPaused
                ? "border-amber-500/40 bg-amber-900/60 text-amber-200"
                : "border-emerald-500/40 bg-emerald-900/60 text-emerald-200"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isCameraPaused ? "bg-amber-400" : "animate-pulse bg-emerald-400"
              }`}
            />
            {isCameraPaused
              ? scanPending
                ? "Processing..."
                : "Paused"
              : "Ready to scan"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2.5">
        <span className="font-medium text-foreground text-xs">
          QR code scanner
        </span>
        <span className="text-muted-foreground text-xs">
          {mirrored
            ? scanType === "participant"
              ? "Participant QR detected"
              : "Mirrored — point camera at QR code"
            : scanType === "participant"
              ? "Participant QR detected"
              : "Point camera at QR code"}
        </span>
      </div>
    </div>
  );
}
