import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface RadioGroupFieldProps {
  label?: string;
  description?: string;
  className?: string;
  options: { label: string; value: string }[];
}

function RadioGroupField({
  label,
  description,
  className,
  options,
}: RadioGroupFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <RadioGroup
        className="flex gap-4"
        onValueChange={(value) => field.handleChange(value)}
        value={field.state.value ?? ""}
      >
        {options.map((option) => (
          <div className="flex items-center gap-2" key={option.value}>
            <RadioGroupItem
              className="size-4 rounded-full border border-input"
              id={`${field.name}-${option.value}`}
              value={option.value}
            />
            <Label
              className="cursor-pointer font-normal"
              htmlFor={`${field.name}-${option.value}`}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export default RadioGroupField;
