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
  return (
    <Field className={cn("grid gap-2", className)}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(Number(e.target.value))}
        placeholder={placeholder}
        type="number"
        min={min}
        max={max}
        step={step}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
export default NumberField;
