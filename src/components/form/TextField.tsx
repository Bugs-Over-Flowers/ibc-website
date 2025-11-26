import type * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { FieldErrors } from "./FieldErrors";

interface TextFieldProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}

export function TextField({
  label,
  description,
  className,
  placeholder,
  type = "text",
}: TextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label htmlFor={field.name}>{label}</Label>}
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <FieldErrors />
    </div>
  );
}
