"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";

interface FormCalendarProps {
  label?: string;
  description?: string;
  className?: string;
}

export default function FormCalendar({
  label,
  description,
  className,
}: FormCalendarProps) {
  const field = useFieldContext<Date | undefined>();
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      field.handleChange(undefined);
      return;
    }
    // Preserve time if exists in current value
    const currentValue = field.state.value;
    const newDate = new Date(date);

    if (currentValue) {
      newDate.setHours(currentValue.getHours());
      newDate.setMinutes(currentValue.getMinutes());
    }
    field.handleChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (!time) return;
    const [hours, minutes] = time.split(":").map(Number);

    const newDate = field.state.value
      ? new Date(field.state.value)
      : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    field.handleChange(newDate);
  };

  return (
    <Field
      aria-invalid={isInvalid}
      className={cn("grid gap-2", className)}
      data-invalid={isInvalid}
    >
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Popover onOpenChange={setIsOpen} open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !field.state.value && "text-muted-foreground",
            )}
            variant={"outline"}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.state.value ? (
              format(field.state.value, "PPP HH:mm")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="space-y-4 rounded-md border bg-background p-4">
            <Calendar
              className="rounded-md border"
              mode="single"
              onSelect={handleDateSelect}
              selected={field.state.value}
              timeZone={timeZone}
            />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                className="flex-1"
                onChange={handleTimeChange}
                type="time"
                value={
                  field.state.value ? format(field.state.value, "HH:mm") : ""
                }
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
