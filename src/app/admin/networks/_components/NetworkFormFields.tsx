"use client";

import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IMAGE_UPLOAD_ACCEPT_ATTR,
  isValidImageUploadFile,
} from "@/lib/fileUpload";
import { cn } from "@/lib/utils";
import type { NetworkFormState } from "./networkForm";

interface NetworkFormFieldsProps {
  formState: NetworkFormState;
  isUploading: boolean;
  currentLogo: string | null;
  onFieldChange: (field: keyof NetworkFormState, value: string) => void;
  onLogoUpload: (file: File | undefined) => void;
  onRemoveLogo: () => void;
  invalidFields?: Partial<Record<keyof NetworkFormState, boolean>>;
}

export function NetworkFormFields({
  formState,
  isUploading,
  currentLogo,
  onFieldChange,
  onLogoUpload,
  onRemoveLogo,
  invalidFields,
}: NetworkFormFieldsProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (!isValidImageUploadFile(file)) {
      toast.error("Invalid logo. Use PNG, JPG, or JPEG up to 5MB.");
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    setSelectedFileName(file.name);
    await onLogoUpload(file);
  };

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label
          className={cn(invalidFields?.organization ? "text-destructive" : "")}
          htmlFor="organization"
        >
          Organization *
        </Label>
        <Input
          aria-invalid={invalidFields?.organization ? true : undefined}
          id="organization"
          onChange={(event) =>
            onFieldChange("organization", event.target.value)
          }
          placeholder="Organization name"
          value={formState.organization}
        />
      </div>

      <div className="grid gap-2">
        <Label
          className={cn(invalidFields?.about ? "text-destructive" : "")}
          htmlFor="about"
        >
          About *
        </Label>
        <Textarea
          aria-invalid={invalidFields?.about ? true : undefined}
          id="about"
          onChange={(event) => onFieldChange("about", event.target.value)}
          placeholder="Short description"
          rows={4}
          value={formState.about}
        />
      </div>

      <div className="grid gap-2">
        <Label
          className={cn(invalidFields?.locationType ? "text-destructive" : "")}
          htmlFor="location-type"
        >
          Location/Type *
        </Label>
        <Input
          aria-invalid={invalidFields?.locationType ? true : undefined}
          id="location-type"
          onChange={(event) =>
            onFieldChange("locationType", event.target.value)
          }
          placeholder="Regional Governor, Private Sector Head, etc."
          value={formState.locationType}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label
            className={cn(
              invalidFields?.representativeName ? "text-destructive" : "",
            )}
            htmlFor="representative-name"
          >
            Representative Name *
          </Label>
          <Input
            aria-invalid={invalidFields?.representativeName ? true : undefined}
            id="representative-name"
            onChange={(event) =>
              onFieldChange("representativeName", event.target.value)
            }
            placeholder="Representative Name"
            value={formState.representativeName}
          />
        </div>

        <div className="grid gap-2">
          <Label
            className={cn(
              invalidFields?.representativePosition ? "text-destructive" : "",
            )}
            htmlFor="representative-position"
          >
            Representative Position *
          </Label>
          <Input
            aria-invalid={
              invalidFields?.representativePosition ? true : undefined
            }
            id="representative-position"
            onChange={(event) =>
              onFieldChange("representativePosition", event.target.value)
            }
            placeholder="Representative Position"
            value={formState.representativePosition}
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-lg pt-3">
        <Label htmlFor="network-logo">Logo Upload</Label>

        <p className="text-muted-foreground text-xs">
          Accepted formats: PNG, JPG, JPEG. Maximum file size: 5MB.
        </p>

        <div className="space-y-2">
          <button
            className={cn(
              "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
              currentLogo
                ? "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15"
                : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
              dragActive && !currentLogo ? "border-primary bg-primary/5" : "",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              void handleFileUpload(e.dataTransfer.files?.[0]);
            }}
            type="button"
          >
            <input
              accept={IMAGE_UPLOAD_ACCEPT_ATTR}
              className="absolute inset-0 cursor-pointer opacity-0"
              id="network-logo"
              onChange={(event) => {
                void handleFileUpload(event.target.files?.[0]);
                event.target.value = "";
              }}
              tabIndex={-1}
              type="file"
            />

            {currentLogo ? (
              <>
                <div className="relative mt-3 h-12 w-12 overflow-hidden rounded-md border bg-background">
                  <Image
                    alt="Network logo preview"
                    className="object-contain"
                    fill
                    sizes="48px"
                    src={currentLogo}
                  />
                </div>
                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                  {isUploading
                    ? "Uploading logo..."
                    : "Logo uploaded successfully"}
                </span>
                {selectedFileName ? (
                  <Badge className="mt-2" variant="outline">
                    {selectedFileName}
                  </Badge>
                ) : null}
              </>
            ) : (
              <>
                <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">
                  {isUploading
                    ? "Uploading logo..."
                    : "Click to upload or drag and drop"}
                </span>
                <span className="mt-1 text-muted-foreground text-xs">
                  PNG, JPG, JPEG up to 5MB
                </span>
              </>
            )}
          </button>

          {formState.logoUrl ? (
            <div className="mt-3 flex justify-center">
              <Button
                className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setSelectedFileName(null);
                  onRemoveLogo();
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <X className="mr-1 h-4 w-4" />
                Remove selected logo
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
