"use client";

import { toPng } from "html-to-image";
import { Download, FileImage, FileText, QrCode } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateQRDataUrl } from "@/lib/qr/generateQRCode";

interface EvaluationQRDownloaderProps {
  eventId: string;
  eventTitle: string;
  triggerClassName?: string;
}

export function EvaluationQRDownloader({
  eventId,
  eventTitle,
  triggerClassName,
}: EvaluationQRDownloaderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [as, setAs] = useState<"image" | "pdf">("image");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const evaluationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/evaluation?eventId=${eventId}`
      : `/evaluation?eventId=${eventId}`;

  useEffect(() => {
    async function generateQR() {
      setIsLoading(true);
      try {
        const dataUrl = await generateQRDataUrl(evaluationUrl);
        setQrDataUrl(dataUrl);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`Failed to generate QR code: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    generateQR();
  }, [evaluationUrl]);

  const print = useReactToPrint({
    contentRef: ref,
    documentTitle: `evaluation-qr-${eventId}.pdf`,
  });

  const handleDownload = async () => {
    if (ref.current === null) {
      return;
    }

    try {
      if (as === "image") {
        const url = await toPng(ref.current, { pixelRatio: 3 });
        const link = document.createElement("a");
        link.download = `evaluation-qr-${eventId}.png`;
        link.href = url;
        link.click();
        toast.success("QR code downloaded successfully!");
      } else {
        print();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to download QR code: ${errorMessage}`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className={triggerClassName} variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Evaluation QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Evaluation Form QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* QR Card for Download */}
          <Card className="w-full max-w-xs bg-white" ref={ref}>
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="text-center">
                <p className="font-semibold text-neutral-900 text-sm">
                  Event Evaluation
                </p>
                <p className="mt-1 line-clamp-2 text-neutral-600 text-xs">
                  {eventTitle}
                </p>
              </div>

              {isLoading ? (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-neutral-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary" />
                </div>
              ) : qrDataUrl ? (
                <Image
                  alt="Evaluation QR Code"
                  className="rounded-lg"
                  height={192}
                  src={qrDataUrl}
                  width={192}
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-neutral-100">
                  <p className="text-neutral-500 text-sm">
                    Failed to generate QR
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-[10px] text-neutral-500">
                  Scan to submit feedback
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Download Controls */}
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">Format:</span>
              <Select
                onValueChange={(val) => setAs(val as "image" | "pdf")}
                value={as}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      <span>PNG</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>PDF</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              disabled={!qrDataUrl || isLoading}
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>

          {/* URL Preview */}
          <div className="w-full rounded-md bg-muted p-3">
            <p className="mb-1 text-muted-foreground text-xs">
              Evaluation URL:
            </p>
            <p className="break-all font-mono text-foreground text-xs">
              {evaluationUrl}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
