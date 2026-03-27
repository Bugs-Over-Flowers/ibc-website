import { UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/shadcn-io/dropzone";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { IMAGE_UPLOAD_ACCEPT, isValidImageUploadFile } from "@/lib/fileUpload";
import { cn } from "@/lib/utils";

type SummaryRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
  tone?: "default" | "success";
};

function SummaryRow({
  label,
  value,
  emphasized = false,
  tone = "default",
}: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        tone === "success" && "text-green-600",
      )}
    >
      <span
        className={cn("text-muted-foreground", emphasized && "text-foreground")}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-medium",
          emphasized && "font-semibold text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export type RegistrationPaymentSummaryProps = {
  participantCount: number;
  baseFee: number;
  sponsorDiscountPerParticipant?: number;
  sponsoredBy?: string | null;
  className?: string;
  title?: string | null;
};

export function RegistrationPaymentSummary({
  participantCount,
  baseFee,
  sponsorDiscountPerParticipant,
  sponsoredBy,
  className,
  title = "Payment Summary",
}: RegistrationPaymentSummaryProps) {
  const subtotal = baseFee * participantCount;
  const sponsorDiscount = sponsorDiscountPerParticipant
    ? sponsorDiscountPerParticipant * participantCount
    : 0;
  const total = subtotal - sponsorDiscount;

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-primary/5 p-5",
        className,
      )}
    >
      {title ? (
        <h3 className="mb-4 font-bold text-primary text-sm uppercase tracking-wider">
          {title}
        </h3>
      ) : null}

      <div className="space-y-3 text-base">
        <SummaryRow
          label="Number of Participants"
          value={`${participantCount}`}
        />
        <SummaryRow
          label="Fee per Participant"
          value={`PHP ${baseFee.toLocaleString()}`}
        />
        <SummaryRow
          label={`Subtotal (${participantCount} x PHP ${baseFee.toLocaleString()})`}
          value={`PHP ${subtotal.toLocaleString()}`}
        />

        {sponsorDiscount > 0 && (
          <SummaryRow
            label={`Sponsor Discount${sponsoredBy ? ` (${sponsoredBy})` : ""}`}
            tone="success"
            value={`-PHP ${sponsorDiscount.toLocaleString()}`}
          />
        )}

        <div className="border-primary/20 border-t pt-3">
          <SummaryRow
            emphasized
            label="Total Amount to Pay"
            value={`PHP ${total.toLocaleString()}`}
          />
        </div>
      </div>
    </div>
  );
}

export type PaymentProofDropzoneProps = {
  value?: File;
  onChange: (file: File | undefined) => void;
  errorMessages?: Array<{ message?: string } | undefined>;
  label?: string;
  description?: string;
};

export function PaymentProofDropzone({
  value,
  onChange,
  errorMessages,
  label = "Upload Proof of Payment *",
  description = "PNG, JPG up to 5MB",
}: PaymentProofDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value?.type.startsWith("image/")) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="space-y-2">
      <Label className="font-semibold text-foreground text-sm">{label}</Label>

      {value ? (
        <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
          {preview ? (
            <ImageZoom className="block w-full">
              <div className="relative mx-auto aspect-4/3 w-full overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                <Image
                  alt="Payment proof preview"
                  className="object-contain"
                  fill
                  src={preview}
                  unoptimized
                />
              </div>
            </ImageZoom>
          ) : null}

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              Proof Uploaded Successfully
            </span>
            <Badge className="max-w-full truncate" variant="outline">
              {value.name}
            </Badge>
          </div>

          <Dropzone
            accept={IMAGE_UPLOAD_ACCEPT}
            className={cn(
              "min-h-24 rounded-xl border-2 border-dashed bg-background p-4 transition-all hover:bg-primary/5",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
            )}
            maxFiles={1}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={() => setDragActive(true)}
            onDrop={(acceptedFiles) => {
              setDragActive(false);
              const nextFile = acceptedFiles[0];
              if (!nextFile || !isValidImageUploadFile(nextFile)) {
                return;
              }

              onChange(nextFile);
            }}
            src={value ? [value] : undefined}
          >
            <div className="flex w-full flex-col items-center justify-center gap-1 text-center">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-sm">
                Replace proof
              </span>
              <span className="text-muted-foreground text-xs">
                Drag and drop or click to choose another file
              </span>
            </div>
          </Dropzone>
        </div>
      ) : (
        <Dropzone
          accept={IMAGE_UPLOAD_ACCEPT}
          className={cn(
            "min-h-40 rounded-xl border-2 border-dashed bg-background p-6 transition-all hover:bg-primary/5",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
          )}
          maxFiles={1}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={() => setDragActive(true)}
          onDrop={(acceptedFiles) => {
            setDragActive(false);
            const nextFile = acceptedFiles[0];
            if (!nextFile || !isValidImageUploadFile(nextFile)) {
              return;
            }

            onChange(nextFile);
          }}
          src={undefined}
        >
          <div className="flex w-full flex-col items-center justify-center gap-2 text-center">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">
              Click to upload or drag and drop
            </span>
            <span className="text-muted-foreground text-xs">{description}</span>
          </div>
        </Dropzone>
      )}

      <FieldError errors={errorMessages} reserveSpace />
    </div>
  );
}
