import { ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";

type CompanyProfileType = "image" | "document" | "website" | null | undefined;

interface CompanyProfileDisplayProps {
  websiteURL: string | null | undefined;
  companyProfileType: CompanyProfileType;
  fileName?: string;
}

function detectProfileTypeFromURL(url: string): CompanyProfileType {
  if (!url.includes("/storage/v1/object/sign/")) return null;
  const path = url.split("?")[0] ?? url;
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "png" || ext === "jpg" || ext === "jpeg") return "image";
  if (ext === "pdf") return "document";
  return "image";
}

export function CompanyProfileDisplay({
  websiteURL,
  companyProfileType,
  fileName,
}: CompanyProfileDisplayProps) {
  if (!websiteURL) return <span>N/A</span>;

  const resolvedType =
    companyProfileType ?? detectProfileTypeFromURL(websiteURL);

  if (resolvedType === "image") {
    return (
      <ImageZoom className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-opacity hover:opacity-80">
        <Image
          alt="Company profile"
          className="object-contain"
          fill
          sizes="64px"
          src={websiteURL}
          unoptimized
        />
      </ImageZoom>
    );
  }

  if (resolvedType === "document") {
    return (
      <a
        className="inline-flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 font-medium text-sm transition-colors hover:bg-muted"
        href={websiteURL}
        rel="noopener noreferrer"
        target="_blank"
        title={websiteURL}
      >
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <span>Open document</span>
      </a>
    );
  }

  return (
    <a
      className="inline-flex items-start gap-1.5 font-medium text-primary text-sm hover:underline"
      href={websiteURL}
      rel="noopener noreferrer"
      target="_blank"
      title={websiteURL}
    >
      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="break-all">{websiteURL}</span>
    </a>
  );
}
