import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  FileDropzoneField,
  FormDatePicker,
  FormDateRangePicker,
  ImageField,
  NumberField,
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
    FormDatePicker,
    FormDateRangePicker,
    FormCheckBox,
    ImageField,
    FileDropzoneField,
  },
  formComponents: {
    SubmitButton,
  },
});
