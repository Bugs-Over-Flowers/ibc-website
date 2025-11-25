import { useFieldContext } from "@/hooks/_formHooks";

export function FieldInfo() {
  const field = useFieldContext();
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-destructive text-sm font-medium">
          {field.state.meta.errors
            .map((err) => (typeof err === "string" ? err : err?.message))
            .join(", ")}
        </p>
      ) : null}
    </>
  );
}
