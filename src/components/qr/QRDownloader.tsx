"use client";

import { toPng } from "html-to-image";
import { Download, FileImage, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRDownloaderProps {
  registrationIdentifier: string;
  children: React.ReactNode;
  header: string;
  subheader?: string;
  email: string;
}

export default function QRDownloader({
  registrationIdentifier,
  header,
  subheader,
  email,
  children,
}: QRDownloaderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [format, setFormat] = useState<"image" | "pdf">("image");
  const [loading, setLoading] = useState(false);

  const print = useReactToPrint({
    contentRef: ref,
    documentTitle: `${registrationIdentifier}.pdf`,
  });

  const handleDownload = async () => {
    if (!ref.current) return;
    setLoading(true);
    try {
      if (format === "image") {
        const url = await toPng(ref.current, { pixelRatio: 3 });
        const link = document.createElement("a");
        link.download = `${registrationIdentifier}.png`;
        link.href = url;
        link.click();
      } else {
        print();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ── Printable QR card ── */}
      <div
        className="flex w-[240px] flex-col items-center gap-3 rounded-2xl border-2 border-border bg-white pt-5 pb-5 shadow-sm"
        ref={ref}
      >
        {/* QR code slot */}
        <div className="overflow-hidden">{children}</div>

        {/* Identity */}
        <div className="flex w-full flex-col items-center gap-0.5 px-2 text-center">
          <p className="wrap-break-word font-bold text-base text-neutral-900 capitalize leading-tight">
            {header}
          </p>
          {subheader && (
            <p className="wrap-break-word font-bold text-neutral-500 text-xs">
              {subheader}
            </p>
          )}
          <p className="wrap-break-word text-neutral-500 text-xs">{email}</p>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex w-full max-w-[220px] flex-col items-center gap-3">
        {/* Format toggle */}
        <div className="flex w-full gap-1 rounded-xl border border-border bg-background p-1">
          {(["image", "pdf"] as const).map((opt) => (
            <button
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs transition-all duration-150",
                format === opt
                  ? "border border-border bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={opt}
              onClick={() => setFormat(opt)}
              type="button"
            >
              {opt === "image" ? (
                <FileImage className="size-3.5" />
              ) : (
                <FileText className="size-3.5" />
              )}
              {opt === "image" ? "Image" : "PDF"}
            </button>
          ))}
        </div>

        {/* Download button */}
        <Button
          className="w-full gap-2 font-semibold"
          disabled={loading}
          onClick={handleDownload}
        >
          <Download className="size-4" />
          {loading ? "Preparing…" : "Download QR Code"}
        </Button>
      </div>
    </div>
  );
}
