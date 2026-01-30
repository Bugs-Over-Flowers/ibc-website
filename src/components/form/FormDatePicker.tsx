import { endOfDay, format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldDescription, FieldError } from "../ui/field";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface FormDatePickerProps {
  label?: string;
  description?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: (date: Date) => boolean;
  startMonth?: Date;
  endMonth?: Date;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  description,
  className,
  minDate,
  maxDate,
  disabled,
  startMonth,
  endMonth,
}: FormDatePickerProps) => {
  const field = useFieldContext<Date | undefined>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [open, setOpen] = useState(false);

  const computedStartMonth = startMonth ?? minDate ?? new Date(1900, 0);
  const computedEndMonth = endMonth ?? maxDate ?? new Date(2100, 11);

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <Label>{label}</Label>}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button
              className={cn(
                "w-full justify-between text-left font-normal",
                !field.state.value && "text-muted-foreground",
              )}
              variant={"outline"}
            >
              {field.state.value ? (
                format(field.state.value, "MMMM dd, yyyy")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          }
        />

        <PopoverContent
          align="start"
          className="w-auto p-0"
          collisionPadding={16}
        >
          <Calendar
            captionLayout="dropdown"
            disabled={(date) => {
              if (typeof disabled === "function") return disabled(date);
              if (minDate && date < startOfDay(minDate)) return true;
              if (maxDate && date > endOfDay(maxDate)) return true;
              // If no explicit bounds are provided, default to disallowing
              // future dates and very old dates (legacy behavior).
              if (!minDate && !maxDate) {
                return date > new Date() || date < new Date("1900-01-01");
              }
              // When bounds are provided, only keep the historical lower bound.
              return date < new Date("1900-01-01");
            }}
            endMonth={computedEndMonth}
            mode="single"
            onSelect={(date) => {
              field.handleChange(date);
              setOpen(false);
            }}
            selected={field.state.value}
            startMonth={computedStartMonth}
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDatePicker;
