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
  allowCustom?: boolean;
}

export default function SingleComboBoxField({
  label,
  description,
  className,
  options,
  placeholder,
  allowCustom = false,
}: ComboBoxFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const getLabel = (value?: string) => {
    if (!value) return "";
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const [query, setQuery] = useState(getLabel(field.state.value));

  const isCustomValue =
    allowCustom &&
    !!field.state.value &&
    !options.find((opt) => opt.value === field.state.value);

  return (
    <Field className={cn("grid gap-2", className)} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Combobox
        data-invalid={isInvalid}
        items={options}
        onValueChange={(value) => {
          if (value === field.state.value) return;
          if (value === null) return;
          field.handleChange(value);
          setQuery(getLabel(value));
        }}
        value={isCustomValue ? null : field.state.value || null}
      >
        <ComboboxInput
          onBlur={(e) => {
            e.preventBaseUIHandler();
            e.preventDefault();
            field.handleBlur();
            if (allowCustom) {
              const trimmed = query.trim();
              if (trimmed) {
                const matchByLabel = options.find(
                  (opt) => opt.label.toLowerCase() === trimmed.toLowerCase(),
                );
                const matchByValue = options.find(
                  (opt) => opt.value === trimmed,
                );
                if (matchByLabel) {
                  field.handleChange(matchByLabel.value);
                  setQuery(matchByLabel.label);
                } else if (matchByValue) {
                  field.handleChange(matchByValue.value);
                  setQuery(matchByValue.label);
                } else {
                  field.handleChange(trimmed);
                  setQuery(trimmed);
                }
              } else {
                setQuery(getLabel(field.state.value));
              }
            } else {
              setQuery(getLabel(field.state.value));
            }
          }}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (allowCustom) {
              const matchByLabel = options.find(
                (opt) => opt.label.toLowerCase() === value.toLowerCase(),
              );
              const matchByValue = options.find((opt) => opt.value === value);
              if (matchByLabel) {
                field.handleChange(matchByLabel.value);
              } else if (matchByValue) {
                field.handleChange(matchByValue.value);
                setQuery(matchByValue.label);
              } else if (value === "") {
                field.handleChange("");
              }
            }
          }}
          onClear={() => {
            setQuery("");
            field.handleChange("");
          }}
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
