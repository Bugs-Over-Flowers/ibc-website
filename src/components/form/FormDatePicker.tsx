import { format } from "date-fns";
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
    <Field className={className} data-invalid={isInvalid}>
      {label && <Label>{label}</Label>}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            captionLayout="dropdown"
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            mode="single"
            onSelect={(date) => {
              field.handleChange(date);
              setOpen(false);
            }}
            selected={field.state.value}
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export default FormDatePicker;
