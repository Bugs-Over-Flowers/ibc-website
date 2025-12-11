import type { DateRange } from "react-day-picker";
import { useFieldContext } from "@/hooks/_formHooks";
import { Calendar } from "../ui/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface FormDateRangePickerProps {
  label?: string;
  description?: string;
  className?: string;
}

const FormDateRangePicker: React.FC<FormDateRangePickerProps> = ({
  label,
  description,
  className,
}: FormDateRangePickerProps) => {
  const field = useFieldContext<DateRange | undefined>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Calendar
        className={className}
        data-invalid={isInvalid}
        defaultMonth={new Date(Date.now())}
        mode="range"
        numberOfMonths={2}
        onSelect={(v) => field.handleChange(v)}
        selected={field.state.value}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDateRangePicker;
