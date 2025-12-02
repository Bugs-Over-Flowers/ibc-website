import { useFieldContext } from "@/hooks/_formHooks";
import { FieldError } from "../ui/field";

export function FieldErrors() {
  const field = useFieldContext();

  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <FieldError
          className="text-destructive text-sm font-medium"
          errors={field.state.meta.errors}
        />
      ) : null}
    </>
  );
}
