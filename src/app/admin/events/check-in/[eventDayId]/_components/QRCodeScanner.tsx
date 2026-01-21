"use client";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationIdentifier } from "@/lib/validation/qr/standard";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useScanQR } from "../_hooks/useScanQR";

export default function QRCodeScanner() {
  const { eventDayId } = useParams<{ eventDayId: string }>();

  const { execute: scanQRData, isPending: scanPending } = useScanQR();

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

    await scanQRData(code, eventDayId);
  };
  return (
    <div className="justify-baseline flex w-full flex-col items-center p-5 md:flex-row md:items-start">
      <Card>
        <CardContent className="flex h-full w-full flex-col items-center gap-4">
          <div className="aspect-square w-100">
            <Scanner
              components={{
                finder: false,
                onOff: true,
              }}
              formats={["qr_code"]}
              onScan={handleScan}
              paused={isCameraPaused}
            />
          </div>
          {scanPending && <p>Scanning...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
