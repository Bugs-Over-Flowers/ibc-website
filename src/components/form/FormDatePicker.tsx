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
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [open, setOpen] = useState(false);
  return (
    <Field data-invalid={isInvalid}>
      {label && <Label>{label}</Label>}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button>
            {field.state.value
              ? field.state.value.toLocaleDateString()
              : "Select Date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <Calendar
          captionLayout="dropdown"
          className={className}
          data-invalid={isInvalid}
          defaultMonth={new Date(Date.now())}
          mode="single"
          numberOfMonths={2}
          onSelect={(date) => {
            field.handleChange(date);
            setOpen(false);
          }}
          selected={field.state.value}
        />
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDatePicker;
