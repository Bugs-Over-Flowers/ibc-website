import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";

export const { useFormContext, useFieldContext, formContext, fieldContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    SelectField,
    TextareaField,
  },
  formComponents: {},
});
