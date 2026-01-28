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
      className={cn("space-y-1.5 sm:space-y-2", className)}
      data-invalid={isInvalid}
    >
      <FieldLabel
        className="font-medium text-foreground text-xs sm:text-sm md:text-base"
        id="rating-label"
      >
        {label}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}

      <fieldset aria-labelledby="rating-label" className="border-0 p-0">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-3">
          {RATING_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                className={cn(
                  "group flex h-14 w-14 flex-col items-center justify-center gap-0 rounded-lg border-0 transition-all duration-150 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20",
                  "cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 sm:focus-within:ring-offset-2",
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
                    "h-4 w-4 transition-transform duration-150 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8",
                    isSelected
                      ? cn(option.color, "scale-110")
                      : cn(option.colorMuted, "group-hover:scale-105"),
                  )}
                />
                <span
                  className={cn(
                    "text-center font-medium text-[7px] leading-tight sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px]",
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
