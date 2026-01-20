"use client";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

export default function QRCodeScanner() {
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      console.log("Scanned code:", code);
    }
  };
  return (
    <div>
      <Scanner
        components={{
          finder: false,
          onOff: true,
        }}
        onScan={handleScan}
        styles={{
          container: {
            width: 250,
          },
        }}
      />
    </div>
  );
}
