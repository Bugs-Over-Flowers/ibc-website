import { useFieldContext } from "@/hooks/_formHooks";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel } from "../ui/field";

interface FormCheckBoxProps {
  orientation?: "horizontal" | "vertical" | "responsive";
  label?: string;
}

export default function FormCheckBox({
  label,
  orientation,
}: FormCheckBoxProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} orientation={orientation} className="w-max">
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
        aria-invalid={isInvalid}
      />
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
    </Field>
  );
}
