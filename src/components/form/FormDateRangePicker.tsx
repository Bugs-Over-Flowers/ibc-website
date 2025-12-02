import type { DateRange } from "react-day-picker";
import { useFieldContext } from "@/hooks/_formHooks";
import { Calendar } from "../ui/calendar";
import { Field, FieldDescription } from "../ui/field";
import { Label } from "../ui/label";
import { FieldErrors } from "./FieldErrors";

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
  return (
    <Field>
      {label && <Label>{label}</Label>}
      <Calendar
        mode="range"
        defaultMonth={new Date(Date.now())}
        selected={field.state.value}
        onSelect={(v) => field.handleChange(v)}
        numberOfMonths={2}
        className={className}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldErrors />
    </Field>
  );
};

export default FormDateRangePicker;
