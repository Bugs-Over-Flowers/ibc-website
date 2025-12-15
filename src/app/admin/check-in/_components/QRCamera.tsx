"use client";

import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent } from "@/components/ui/card";

interface QRCameraProps {
  handleScan: (detectedCodes: IDetectedBarcode[]) => void;
  isPaused: boolean;
}

export default function QRCamera({ handleScan, isPaused }: QRCameraProps) {
  return (
    <Card className="size-96">
      <CardContent className="flex h-full w-full flex-col gap-4">
        <Scanner
          allowMultiple={false}
          components={{
            finder: false,
            onOff: true,
          }}
          constraints={{
            aspectRatio: 1,
            noiseSuppression: true,
          }}
          onScan={handleScan}
          paused={isPaused}
          scanDelay={1000}
          sound={false}
        />
      </CardContent>
    </Card>
  );
}
