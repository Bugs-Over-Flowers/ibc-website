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
    <Field className="w-max" data-invalid={isInvalid} orientation={orientation}>
      <Checkbox
        aria-invalid={isInvalid}
        checked={field.state.value}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
      />
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
    </Field>
  );
}
