"use client";

import { Frown, Laugh, Meh, Smile, SmilePlus } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [
  { value: "poor", label: "Terrible", Icon: Frown },
  { value: "fair", label: "Bad", Icon: Meh },
  { value: "good", label: "Okay", Icon: Smile },
  { value: "veryGood", label: "Good", Icon: SmilePlus },
  { value: "excellent", label: "Amazing", Icon: Laugh },
] as const;

interface RatingScaleProps {
  label: string;
  description?: string;
  className?: string;
}

export function RatingScale({
  label,
  description,
  className,
}: RatingScaleProps) {
  const field = useFieldContext<string>();
  const value = field.state.value ?? "";

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleRatingClick = (rating: string) => {
    field.handleChange(rating);
  };

  return (
    <Field
      aria-invalid={isInvalid}
      className={cn("grid gap-3", className)}
      data-invalid={isInvalid}
    >
      <FieldLabel>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}

      <div className="grid grid-cols-5 gap-3 sm:gap-4">
        {RATING_OPTIONS.map((option) => (
          <button
            aria-label={`Rating ${option.label}`}
            aria-pressed={value === option.value}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 px-3 py-4 transition-all",
              value === option.value
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:border-primary/50 hover:bg-accent",
            )}
            key={option.value}
            onClick={() => handleRatingClick(option.value)}
            type="button"
          >
            <option.Icon className="h-8 w-8 sm:h-10 sm:w-10" />
            <span className="text-center font-semibold text-foreground text-xs sm:text-sm">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </Field>
  );
}
