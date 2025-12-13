import type * as React from "react";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface TextFieldProps {
  label?: React.ReactNode;
  description?: string;
  className?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
}

function TextField({
  label,
  description,
  className,
  placeholder,
  type = "text",
  disabled,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        autoCapitalize="on"
        autoComplete="off"
        data-invalid={isInvalid}
        disabled={disabled}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        value={field.state.value ?? ""}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export default TextField;
