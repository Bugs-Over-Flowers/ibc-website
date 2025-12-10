import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface ImageFieldProps {
  label?: string;
  description?: string;
  className?: string;
  multiple?: boolean;
}

function ImageField({
  label,
  description,
  className,
  multiple = false,
}: ImageFieldProps) {
  const field = useFieldContext<File[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    field.handleChange(files);
  };

  return (
    <Field data-invalid={isInvalid} className={cn("grid gap-2", className)}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        onBlur={field.handleBlur}
        className="cursor-pointer"
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
      {/* We don't render value directly in file input as it's uncontrolled for security */}
    </Field>
  );
}

export default ImageField;
