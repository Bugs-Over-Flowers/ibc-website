import type * as React from "react";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { FieldErrors } from "./FieldErrors";

interface TextFieldProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}

function TextField({
  label,
  description,
  className,
  placeholder,
  type = "text",
}: TextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Field className={cn("grid gap-2", className)}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldErrors />
    </Field>
  );
}

export default TextField;
