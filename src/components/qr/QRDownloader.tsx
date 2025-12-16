"use client";

import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QRDownloaderProps {
  registrationIdentifier: string;
  children: React.ReactNode;
  affiliation: string;
  email: string;
}

export default function QRDownloader({
  registrationIdentifier,
  affiliation,
  email,
  children,
}: QRDownloaderProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [as, setAs] = useState<"image" | "pdf">("image");

  const print = useReactToPrint({
    contentRef: ref,
    documentTitle: `${registrationIdentifier}.pdf`,
  });

  const downloadImage = async () => {
    if (ref.current === null) {
      return;
    }

    if (as === "image") {
      const url = await toPng(ref.current);
      const link = document.createElement("a");
      link.download = `${registrationIdentifier}.png`;
      link.href = url;
      link.click();
      return;
    } else {
      // generatePDF(ref, { filename: `${registrationId}.pdf` });
      print();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="flex w-max flex-col items-center">
        <Card className="w-2xs bg-white text-center" ref={ref}>
          <CardContent className="flex flex-col items-center gap-3">
            {children}
            <div className="">
              <pre className="text-[8px]">{registrationIdentifier}</pre>
              <div className="flex flex-col items-center">
                <div className="pt-2 font-semibold text-lg capitalize">
                  {affiliation}
                </div>
                <div>{email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col items-center space-y-3 pt-4">
          <div className="flex flex-col">
            <Button onClick={downloadImage}>Download QR Code</Button>
          </div>
          <div className="flex items-center gap-4">
            <div>as</div>
            <Select
              onValueChange={(val) => setAs(val as "image" | "pdf")}
              value={as as "image" | "pdf"}
            >
              <SelectTrigger>
                <SelectValue placeholder="hello world" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">image</SelectItem>
                <SelectItem value="pdf">pdf</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
