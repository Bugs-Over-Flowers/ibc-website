import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { useFieldContext } from "@/hooks/_formHooks";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldDescription, FieldError } from "../ui/field";
import { Label } from "../ui/label";
import { Popover, PopoverTrigger } from "../ui/popover";

interface FormDatePickerProps {
  label?: string;
  description?: string;
  className?: string;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  description,
  className,
}: FormDatePickerProps) => {
  const field = useFieldContext<Date | undefined>();
  const [open, setOpen] = useState(false);
  return (
    <Field>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button>
            {field.state.value
              ? field.state.value.toLocaleDateString()
              : "Select Date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <Calendar
          mode="single"
          captionLayout="dropdown"
          defaultMonth={new Date(Date.now())}
          selected={field.state.value}
          onSelect={(date) => {
            field.handleChange(date);
            setOpen(false);
          }}
          numberOfMonths={2}
          className={className}
        />
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDatePicker;
