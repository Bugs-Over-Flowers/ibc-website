import { endOfDay, format, startOfDay } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";

interface FormDateTimePickerProps {
  label?: string;
  description?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: (date: Date) => boolean;
  startMonth?: Date;
  endMonth?: Date;
}

const FormDateTimePicker: React.FC<FormDateTimePickerProps> = ({
  label,
  description,
  className,
  minDate,
  maxDate,
  disabled,
  startMonth,
  endMonth,
}) => {
  const field = useFieldContext<string | undefined>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [open, setOpen] = React.useState(false);

  const computedStartMonth = startMonth ?? minDate ?? new Date(1900, 0);
  const computedEndMonth = endMonth ?? maxDate ?? new Date(2100, 11);

  // Parse the string value "YYYY-MM-DDTHH:mm"
  const value = field.state.value;

  let dateValue: Date | undefined;
  let timeValue = "00:00";

  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      dateValue = d;
      const parts = value.split("T");
      if (parts.length > 1) {
        // Take HH:mm from the string
        timeValue = parts[1].substring(0, 5);
      }
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      field.handleChange(undefined);
      setOpen(false);
      return;
    }
    const dateStr = format(date, "yyyy-MM-dd");
    field.handleChange(`${dateStr}T${timeValue}`);
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!dateValue) {
      const today = new Date();
      const dateStr = format(today, "yyyy-MM-dd");
      field.handleChange(`${dateStr}T${newTime}`);
    } else {
      const dateStr = format(dateValue, "yyyy-MM-dd");
      field.handleChange(`${dateStr}T${newTime}`);
    }
  };

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <Label className="mb-2 block">{label}</Label>}

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label className="px-1 font-normal text-muted-foreground text-xs">
            Date
          </Label>
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
              render={
                <Button
                  className={cn(
                    "w-full justify-between px-3 font-normal",
                    !dateValue && "text-muted-foreground",
                  )}
                  variant="outline"
                >
                  {dateValue ? format(dateValue, "PPP") : "Select date"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              }
            />

            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                captionLayout="dropdown"
                disabled={(date) => {
                  if (typeof disabled === "function") return disabled(date);
                  if (minDate && date < startOfDay(minDate)) return true;
                  if (maxDate && date > endOfDay(maxDate)) return true;
                  return date < new Date("1900-01-01");
                }}
                endMonth={computedEndMonth}
                fromYear={1900}
                initialFocus
                mode="single"
                onSelect={handleDateSelect}
                selected={dateValue}
                startMonth={computedStartMonth}
                toYear={2100}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex w-32 flex-col gap-2">
          <Label className="px-1 font-normal text-muted-foreground text-xs">
            Time
          </Label>
          <Input
            className="w-full appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={handleTimeChange}
            type="time"
            value={timeValue}
          />
        </div>
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDateTimePicker;
