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
}

const FilePreview = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
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
    <div className="relative group">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-background">
        {preview ? (
          <ImageZoom className="h-full w-full">
            <Image
              src={preview}
              alt={file.name}
              fill
              unoptimized
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </ImageZoom>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <UploadCloud className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100 z-10"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <p className="mt-1 truncate text-xs text-muted-foreground px-1">
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
        onDrop={handleDrop}
        accept={accept}
        maxFiles={maxFiles}
        maxSize={maxSize}
        src={files}
        className="w-full bg-background border-dashed hover:bg-muted/50 transition-colors"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="rounded-full bg-muted p-4">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm font-medium">
              Drag & drop files here or click to upload
            </span>
            <span className="text-xs text-muted-foreground">
              {multiple
                ? "You can upload multiple files"
                : "Single file upload"}
            </span>
          </div>
        </div>
      </Dropzone>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-4">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
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
