"use client";

import { Frown, Laugh, Meh, Smile, SmilePlus } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";

const RATING_OPTIONS = [
  {
    value: "poor",
    label: "Poor",
    Icon: Frown,
    color: "text-red-500",
    colorMuted: "text-red-300 dark:text-red-700",
    bgActive: "bg-red-100 dark:bg-red-950",
  },
  {
    value: "fair",
    label: "Fair",
    Icon: Meh,
    color: "text-orange-500",
    colorMuted: "text-orange-300 dark:text-orange-700",
    bgActive: "bg-orange-100 dark:bg-orange-950",
  },
  {
    value: "good",
    label: "Good",
    Icon: Smile,
    color: "text-yellow-500",
    colorMuted: "text-yellow-300 dark:text-yellow-600",
    bgActive: "bg-yellow-100 dark:bg-yellow-950",
  },
  {
    value: "veryGood",
    label: "Very Good",
    Icon: SmilePlus,
    color: "text-lime-500",
    colorMuted: "text-lime-300 dark:text-lime-700",
    bgActive: "bg-lime-100 dark:bg-lime-950",
  },
  {
    value: "excellent",
    label: "Excellent",
    Icon: Laugh,
    color: "text-green-500",
    colorMuted: "text-green-300 dark:text-green-700",
    bgActive: "bg-green-100 dark:bg-green-950",
  },
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
      className={cn("space-y-2", className)}
      data-invalid={isInvalid}
    >
      <FieldLabel
        className="font-medium text-base text-foreground sm:text-lg"
        id="rating-label"
      >
        {label}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}

      <fieldset aria-labelledby="rating-label" className="border-0 p-0">
        <div className="flex items-center justify-start gap-1 sm:gap-2">
          {RATING_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                className={cn(
                  "group flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-0 transition-all duration-150",
                  "cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                  isSelected
                    ? cn(option.bgActive, "shadow-md")
                    : "hover:bg-accent/60",
                )}
                key={option.value}
              >
                <input
                  checked={isSelected}
                  className="sr-only"
                  onChange={() => handleRatingClick(option.value)}
                  type="radio"
                  value={option.value}
                />
                <option.Icon
                  className={cn(
                    "h-7 w-7 transition-transform duration-150 sm:h-8 sm:w-8",
                    isSelected
                      ? cn(option.color, "scale-110")
                      : cn(option.colorMuted, "group-hover:scale-105"),
                  )}
                />
                <span
                  className={cn(
                    "text-center font-medium text-[9px] leading-tight sm:text-[10px]",
                    isSelected ? option.color : "text-muted-foreground",
                  )}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
