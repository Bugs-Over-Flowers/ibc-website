import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Dropzone } from "../ui/shadcn-io/dropzone";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";

interface FileDropzoneFieldProps {
  label?: React.ReactNode;
  description?: string;
  className?: string;
  multiple?: boolean;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  layout?: "grid" | "banner";
}

const FilePreview = ({
  file,
  onRemove,
  layout = "grid",
}: {
  file: File;
  onRemove: () => void;
  layout?: "grid" | "banner";
}) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className={cn("group relative", layout === "banner" ? "w-full" : "")}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg border bg-background",
          layout === "banner" ? "h-48" : "aspect-square",
        )}
      >
        {preview ? (
          <ImageZoom className="h-full w-full">
            <Image
              alt={file.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              src={preview}
              unoptimized
            />
          </ImageZoom>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <UploadCloud className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        )}
      </div>
      <Button
        className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onRemove}
        size="icon"
        type="button"
        variant="destructive"
      >
        <X className="h-3 w-3" />
      </Button>
      <p className="mt-1 truncate px-1 text-muted-foreground text-xs">
        {file.name}
      </p>
    </div>
  );
};

function FileDropzoneField({
  label,
  description,
  className,
  multiple = false,
  accept = { "image/*": [] },
  maxFiles,
  maxSize,
  layout = "grid",
}: FileDropzoneFieldProps) {
  const field = useFieldContext<File[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const files = field.state.value || [];

  const handleDrop = (acceptedFiles: File[]) => {
    if (multiple) {
      field.handleChange([...files, ...acceptedFiles]);
    } else {
      field.handleChange(acceptedFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    field.handleChange(newFiles);
  };

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Dropzone
        accept={accept}
        className="w-full border-dashed bg-background transition-colors hover:bg-muted/50"
        maxFiles={maxFiles}
        maxSize={maxSize}
        onDrop={handleDrop}
        src={files}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="rounded-full bg-muted p-4">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-medium text-sm">
              Drag & drop files here or click to upload
            </span>
            <span className="text-muted-foreground text-xs">
              {multiple
                ? "You can upload multiple files"
                : "Single file upload"}
            </span>
          </div>
        </div>
      </Dropzone>

      {files.length > 0 && (
        <div
          className={cn(
            "mt-4 grid gap-4",
            layout === "banner"
              ? "grid-cols-1"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
          )}
        >
          {files.map((file, index) => (
            <FilePreview
              file={file}
              key={`${file.name}-${index}`}
              layout={layout}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export default FileDropzoneField;
