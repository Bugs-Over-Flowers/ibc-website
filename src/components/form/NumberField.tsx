import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { FieldInfo } from "./FieldInfo";

interface NumberFieldProps {
  label?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
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
    <div className={cn("grid gap-2", className)}>
      {label && <Label htmlFor={field.name}>{label}</Label>}
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
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <FieldInfo />
    </div>
  );
}
