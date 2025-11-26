import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { FieldErrors } from "./FieldErrors";

interface TextareaFieldProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  rows?: number;
}

export function TextareaField({
  label,
  description,
  className,
  placeholder,
  rows,
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label htmlFor={field.name}>{label}</Label>}
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <FieldErrors />
    </div>
  );
}
