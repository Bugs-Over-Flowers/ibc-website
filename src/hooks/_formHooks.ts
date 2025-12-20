import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  FileDropzoneField,
  FormCalendar,
  FormDatePicker,
  FormDateRangePicker,
  ImageField,
  NumberField,
  RadioGroupField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import FormCheckBox from "@/components/form/FormCheckBox";
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
    FormCalendar,
    FormDatePicker,
    FormDateRangePicker,
    FormCheckBox,
    ImageField,
    FileDropzoneField,
    RadioGroupField,
  },
  formComponents: {
    SubmitButton,
  },
});
