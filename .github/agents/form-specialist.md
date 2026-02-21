# Form Specialist Agent

## When to Apply

Use this agent when working with:
- TanStack Form components and hooks
- Form validation with Zod
- Form field components in `src/components/form/`
- Route-specific forms in `app/[route]/_components/forms/`
- The `useAppForm` hook from `@/hooks/_formHooks`

## Code Patterns

### Creating a New Form

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { createUser } from "@/server/users/mutations";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export function UserForm() {
  const router = useRouter();
  
  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validation: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error, data } = await tryCatch(createUser(value));
      if (error) {
        form.setErrorMap({ onSubmit: error });
        return;
      }
      router.push(`/users/${data.id}`);
    },
  });
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" />}
      </form.AppField>
      
      <form.AppForm>
        <form.SubmitButton label="Create" isSubmittingLabel="Creating..." />
      </form.AppForm>
    </form>
  );
}
```

### Adding a New Field Component

```tsx
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldLabel, FieldError } from "@/components/ui/field";

interface MyFieldProps {
  label?: string;
  description?: string;
  className?: string;
}

function MyField({ label, description, className }: MyFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field
      className={cn("grid gap-2", className)}
      data-invalid={isInvalid}
      aria-invalid={isInvalid}
    >
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      {/* Your input component here */}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export default MyField;
```

### Available Field Components

| Component | Import Path | Use Case |
|-----------|-------------|----------|
| `TextField` | `@/components/form` | Text inputs |
| `NumberField` | `@/components/form` | Numeric inputs |
| `SelectField` | `@/components/form` | Dropdowns |
| `TextareaField` | `@/components/form` | Multi-line text |
| `FormDatePicker` | `@/components/form` | Single date selection |
| `FormDateRangePicker` | `@/components/form` | Date range selection |
| `RadioGroupField` | `@/components/form` | Radio button groups |
| `FileDropzoneField` | `@/components/form` | File uploads |
| `ImageField` | `@/components/form` | Image uploads |

### Form Submission Pattern

```tsx
onSubmit: async ({ value }) => {
  const { error, data, success } = await tryCatch(serverAction(value));
  if (!success) {
    form.setErrorMap({ onSubmit: error });
    return;
  }
  // handle success (data is available here)
}
```

## Rules

1. **ALWAYS** use `useAppForm` from `@/hooks/_formHooks` - never use TanStack Form directly
2. **MUST** use registered field components from `@/components/form`
3. **MUST** include `<FieldError />` for validation display (not `FieldErrors`)
4. **MUST** include `data-invalid` and `aria-invalid` attributes on field elements
5. **MUST** wrap server actions with `tryCatch` on the client side
6. **MUST** validate with Zod before processing user input
7. Export new field components from `src/components/form/index.ts`
8. Register new field components in `src/hooks/_formHooks.ts` under `fieldComponents`

## Caching Considerations

When forms trigger mutations that affect cached data:

**Tag-Level Invalidation (preferred):**
```typescript
"use server";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function submitForm(input: FormData) {
  const supabase = await createActionClient();
  await supabase.from("items").insert(input);

  // Invalidate only affected tags
  updateTag(CACHE_TAGS.items.all);
  updateTag(CACHE_TAGS.items.admin);
}
```

**Path-Level Invalidation (when route refresh is needed):**
```typescript
"use server";
import { revalidatePath } from "next/cache";

export async function submitForm(input: FormData) {
  const supabase = await createActionClient();
  await supabase.from("items").insert(input);

  revalidatePath("/admin/items");
}
```

**Key Points:**
- Choose ONE primary strategy per mutation
- Only combine both when intentionally needed
- NO param tags like `items:${id}` (function args are auto-serialized into cache keys)

## Common Pitfalls

- Don't forget to `e.preventDefault()` on form submit
- Don't use relative imports when `@/` alias is available
- Always check the `success` property before accessing `data`
- Use discriminated union pattern: `{ success: true, data }` or `{ success: false, error }`
