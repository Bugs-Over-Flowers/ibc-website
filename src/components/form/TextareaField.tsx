import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface TextareaFieldProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  rows?: number;
}

function TextareaField({
  label,
  description,
  className,
  placeholder,
  rows,
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} className={cn("grid gap-2", className)}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        data-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
export default TextareaField;
