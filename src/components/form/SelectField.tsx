import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface SelectFieldProps {
  label?: string;
  description?: string;
  className?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

function SelectField({
  label,
  description,
  className,
  options,
  placeholder,
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Select
        onValueChange={(value) => field.handleChange(value || "Select an item")}
        value={field.state.value ?? ""}
      >
        <SelectTrigger id={field.name}>
          <SelectValue data-placeholder={placeholder}>
            {(val) => options.find((option) => option.value === val)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.label} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export default SelectField;
