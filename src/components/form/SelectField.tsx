import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { FieldInfo } from "./FieldInfo";

interface SelectFieldProps {
  label?: string;
  description?: string;
  className?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  description,
  className,
  options,
  placeholder,
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label htmlFor={field.name}>{label}</Label>}
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger id={field.name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <FieldInfo />
    </div>
  );
}
