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
        mode="range"
        defaultMonth={new Date(Date.now())}
        selected={field.state.value}
        onSelect={(v) => field.handleChange(v)}
        numberOfMonths={2}
        className={className}
        data-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDateRangePicker;
