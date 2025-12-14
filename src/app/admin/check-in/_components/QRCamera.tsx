"use client";

import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationCheckInQRCodeDecodedData } from "@/lib/validation/qr/standard";
import { decryptRegistrationQR } from "@/server/attendance/actions/decryptRegistrationQR";
export default function QRCamera() {
  const { execute: decodeQR } = useAction(tryCatch(decryptRegistrationQR), {
    onError: (error) => {
      console.error(error);
      toast.error("Failed to decode QR code");
    },
  });

  const [data, setData] = useState<RegistrationCheckInQRCodeDecodedData | null>(
    null,
  );

  const [paused, setPaused] = useState(false);

  const handleScan = async (codes: IDetectedBarcode[]) => {
    if (paused) return;
    setPaused(true);
    const { rawValue: data } = codes[0];

    const { data: decodedData } = await decodeQR(data);
    setData(decodedData);
  };

  return (
    <div className="size-96">
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
        paused={paused}
        sound={false}
      />

      {!paused && (
        <Button
          onClick={() => {
            setData(null);
            setPaused(false);
          }}
        >
          <RotateCcw />
        </Button>
      )}
      <div>{data && <pre>{JSON.stringify(data, null, 2)}</pre>}</div>
    </div>
  );
}
