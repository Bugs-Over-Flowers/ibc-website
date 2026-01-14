import { useState } from "react";
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

interface ComboBoxItem {
  label: string;
  value: string;
}

interface ComboBoxFieldProps {
  label?: string;
  description?: string;
  className?: string;
  options: ComboBoxItem[];
  placeholder?: string;
}
export default function SingleComboBoxField({
  label,
  description,
  className,
  options,
  placeholder,
}: ComboBoxFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const getLabel = (value: string) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : "";
  };

  const [query, setQuery] = useState(getLabel(field.state.value));
  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Combobox
        items={options}
        onValueChange={(value) => {
          field.handleChange(value || "");
          setQuery(getLabel(value || ""));
        }}
        value={field.state.value}
      >
        <ComboboxInput
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          showClear
          value={query}
        />
        <ComboboxContent className={"w-full"}>
          <ComboboxList>
            {(option: ComboBoxItem) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}
