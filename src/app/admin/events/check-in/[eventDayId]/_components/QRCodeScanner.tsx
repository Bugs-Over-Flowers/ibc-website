"use client";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationIdentifier } from "@/lib/validation/utils";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useScanQR } from "../_hooks/useScanQR";

interface QRCodeScannerProps {
  eventId: string;
}

export default function QRCodeScanner({ eventId }: QRCodeScannerProps) {
  const { eventDayId } = useParams<{ eventDayId: string }>();

  const { execute: scanQRData, isPending: scanPending } = useScanQR({
    eventId,
  });

  const scannedData = useAttendanceStore((state) => state.scannedData);

  const isCameraPaused = scanPending || scannedData !== null;

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (scanPending || detectedCodes.length === 0) return;

    const code = detectedCodes[0].rawValue;
    console.log("Scanned code:", code);

    // check the qr if valid
    const parsedIdentifier = RegistrationIdentifier.safeParse(code);
    if (!parsedIdentifier.success) {
      console.error("Invalid QR code scanned. Not an identifier.");
      return;
    }

    const { error, data } = await scanQRData(code, eventDayId);
    if (error) {
      return;
    }

    if (data?.message) {
      toast.warning(data.message);
    }
  };
  return (
    <Card className="h-fit w-full overflow-hidden border-2 border-primary/20 shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square w-full bg-black">
          <Scanner
            components={{
              finder: false,
              onOff: true,
            }}
            formats={["qr_code"]}
            onScan={handleScan}
            paused={isCameraPaused}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { objectFit: "cover" },
            }}
          />

          {/* Status Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-black/80 to-transparent p-4">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-medium text-white text-xs shadow-sm backdrop-blur-md ${
                isCameraPaused ? "bg-yellow-500/80" : "bg-green-500/80"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isCameraPaused
                    ? "bg-yellow-200"
                    : "animate-pulse bg-green-200"
                }`}
              />
              {isCameraPaused
                ? scanPending
                  ? "Processing..."
                  : "Paused"
                : "Ready to Scan"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
