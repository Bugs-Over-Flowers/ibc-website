import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  FormDatePicker,
  FormDateRangePicker,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import SubmitButton from "@/components/form/SubmitButton";

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
    FormDatePicker,
    FormDateRangePicker,
  },
  formComponents: {
    SubmitButton,
  },
});
