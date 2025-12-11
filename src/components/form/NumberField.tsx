import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface NumberFieldProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

function NumberField({
  label,
  description,
  className,
  placeholder,
  min,
  max,
  step,
}: NumberFieldProps) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        data-invalid={isInvalid}
        id={field.name}
        max={max}
        min={min}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(Number(e.target.value))}
        placeholder={placeholder}
        step={step}
        type="number"
        value={field.state.value ?? ""}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
export default NumberField;
