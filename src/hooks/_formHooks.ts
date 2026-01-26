import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { RatingScale } from "@/app/(public)/evaluation/_components/RatingScale";
import {
  FileDropzoneField,
  FormCalendar,
  FormDatePicker,
  FormDateRangePicker,
  FormDateTimePicker,
  ImageField,
  NumberField,
  RadioGroupField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import FormCheckBox from "@/components/form/FormCheckBox";
import SingleComboBoxField from "@/components/form/SingleComboBoxField";
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
    FormDateTimePicker,
    FormDateRangePicker,
    FormCheckBox,
    ImageField,
    FileDropzoneField,
    RadioGroupField,
    RatingScale,
    SingleComboBoxField,
  },
  formComponents: {
    SubmitButton,
  },
});
