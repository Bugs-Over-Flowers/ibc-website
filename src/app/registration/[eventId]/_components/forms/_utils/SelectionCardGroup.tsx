import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type SelectionCardOption<T extends string> = {
  id: string;
  value: T;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  description: string;
};

interface SelectionCardGroupProps<T extends string> {
  value: T;
  options: Array<SelectionCardOption<T>>;
  onValueChange: (value: T) => void;
  className?: string;
}

export default function SelectionCardGroup<T extends string>({
  value,
  options,
  onValueChange,
  className,
}: SelectionCardGroupProps<T>) {
  return (
    <RadioGroup
      className={cn("space-y-0", className)}
      onValueChange={(nextValue) => onValueChange(nextValue as T)}
      value={value}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <div className="flex-1" key={option.id}>
              <Label
                className={cn(
                  "flex min-h-30 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent p-4 text-center transition-all",
                  value === option.value && "border-primary bg-primary/5",
                )}
                htmlFor={option.id}
              >
                <RadioGroupItem
                  className="peer sr-only"
                  id={option.id}
                  value={option.value}
                />
                <span
                  className={cn(
                    "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                    value === option.value &&
                      "border-primary/30 bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-semibold text-lg">{option.title}</span>
                <span className="mt-1 text-muted-foreground text-sm">
                  {option.description}
                </span>
              </Label>
            </div>
          );
        })}
      </div>
    </RadioGroup>
  );
}
