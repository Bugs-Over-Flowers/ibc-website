# Copilot Instructions for IBC Website

Next.js 15 + React 19 website for the Iloilo Business Club. Uses Turbopack, Tailwind CSS v4, shadcn/ui, Supabase backend, and bun.

## Quick Reference

```bash
bun run dev          # Dev server (Turbopack)
bun run build        # Production build
bun run check-code   # Biome lint + format
bun run cy:open      # Cypress interactive
bun run gen:types    # Generate Supabase types
```

## Architecture Overview

```
src/
├── app/
│   ├── (public)/       # Public routes (home, about, events, members, network, contact)
│   ├── admin/          # Admin dashboard routes
│   ├── layout.tsx      # Root layout with Toaster
│   └── globals.css     # Tailwind v4 + oklch design tokens
├── components/
│   ├── ui/             # shadcn/ui primitives (Radix-based)
│   └── form/           # TanStack Form field wrappers
├── hooks/
│   ├── _formHooks.ts   # TanStack Form context setup
│   └── useAction.ts    # Server action hook for buttons
├─── lib/
│   ├── server/         # Server Function types, tryCatch utility
│   ├── supabase/       # Supabase library
│   └── validation/     # Zod schemas with reusable helpers
└── server/
    ├── members/        # Member feature related business logic
    │   ├── queries.ts
    │   └── actions.ts
    ├── events/         # Event feature related business logic
    │   ├── queries.ts
    │   └── actions.ts
    └── registration/   # Registration feature related business logic
        ├── queries.ts
        ├── actions.ts
        └── utils.ts    # Utility functions for queries and actions
```

Component placement:

- Route-specific components → `app/[route]/components/`
- Reusable components → `src/components/`

---

## Code Conventions

### Imports & Styling

- Always use `@/` path alias (maps to `./src/`)
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Use `cva()` from `class-variance-authority` for component variants
- Design tokens in `globals.css` use oklch colors as CSS variables

### Components

- Server Components by default; add `"use client"` only when needed
- shadcn/ui components use `data-slot` attributes and Radix primitives
- Add UI components: `bunx --bun shadcn@latest add <component>`

---

## Form System (TanStack Form)

Use `useAppForm` from `@/hooks/_formHooks` with registered field components.

### Available Field Components

| Component             | Import from         | Use case              |
| --------------------- | ------------------- | --------------------- |
| `TextField`           | `@/components/form` | Text inputs           |
| `NumberField`         | `@/components/form` | Numeric inputs        |
| `SelectField`         | `@/components/form` | Dropdowns             |
| `TextareaField`       | `@/components/form` | Multi-line text       |
| `FormDatePicker`      | `@/components/form` | Single date selection |
| `FormDateRangePicker` | `@/components/form` | Date range selection  |

### Basic Form Example

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";
import { createItem } from "@/app/items/actions";
import { z } from "zod";

const CreateItemFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().min(5).max(100),
});

export function CreateItemForm() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validation: {
      onSubmit: CreateItemFormSchema,
    },
    onSubmit: async ({ value }) => {
      const [error, data] = await createItem(value);

      if (error) {
        form.setErrorMap({ onSubmit: error });
        return;
      }

      router.push(`/items/${data.id}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" placeholder="Enter name" />}
      </form.AppField>

      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" />}
      </form.AppField>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

### Adding New Field Types

1. Create component in `src/components/form/` using `useFieldContext<T>()`
2. Include `<FieldErrors />` for validation display
3. Export from `src/components/form/index.ts`
4. Register in `src/hooks/_formHooks.ts` under `fieldComponents`

**Field component template:**

```tsx
import { useFieldContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { FieldErrors } from "./FieldErrors";

interface MyFieldProps {
  label?: string;
  description?: string;
  className?: string;
}

function MyField({ label, description, className }: MyFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Field className={cn("grid gap-2", className)}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      {/* Your input component here */}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldErrors />
    </Field>
  );
}

export default MyField;
```

---

## Server Functions

### Types

All server functions return a tuple `[error, data]` using these types from `@/lib/server/types`:

```ts
type ServerFunctionResult<T, E = string> =
  | readonly [error: E, data: null] // Error case
  | readonly [error: null, data: T]; // Success case

type ServerFunction<TArgs extends unknown[], TResult, TError = string> = (
  ...args: TArgs
) => Promise<ServerFunctionResult<TResult, TError>>;
```

### Writing Server Functions

**Use `"use server"` for mutations:**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ServerFunction } from "@/lib/server/types";

const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type CreateItemInput = z.infer<typeof createItemSchema>;
type CreateItemOutput = { id: string };

export const createItem: ServerFunction<
  [CreateItemInput],
  CreateItemOutput
> = async (input) => {
  // 1. Validate input
  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return [parsed.error.issues[0].message, null];
  }

  // 2. Perform mutation
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return [error.message, null];
  }

  // 3. Revalidate and return
  revalidatePath("/items");
  return [null, { id: data.id }];
};
```

**Use `import "server-only"` for data fetching:**

```ts
import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ServerFunctionResult } from "@/lib/server/types";

type Item = { id: string; name: string };

export async function getItems(): Promise<ServerFunctionResult<Item[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("*");

  if (error) {
    return [error.message, null];
  }

  return [null, data];
}
```

### Alternative Function Syntax

If you prefer `function` declarations over `const`:

```ts
export async function createItem(
  input: CreateItemInput,
): Promise<ServerFunctionResult<CreateItemOutput>> {
  // same body
}
```

---

## Client-Side Action Handling

### `useAction` Hook

For button-triggered mutations (not form submissions):

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/useAction";
import { deleteItem } from "@/app/items/actions";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const { execute, isPending, error } = useAction(deleteItem, {
    onSuccess: () => router.push("/items"),
    onError: (err) => console.error(err),
  });

  return (
    <button onClick={() => execute(id)} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

**`useAction` returns:**

| Property    | Type                      | Description                     |
| ----------- | ------------------------- | ------------------------------- |
| `execute`   | `(input: TInput) => void` | Triggers the action             |
| `isPending` | `boolean`                 | Loading state via useTransition |
| `data`      | `TOutput \| null`         | Success result                  |
| `error`     | `string \| null`          | Error message                   |
| `reset`     | `() => void`              | Clears data and error           |

### `tryCatch` Utility

Wraps any promise into the `[error, data]` tuple format:

```ts
// Inside a function
const [error, response] = await tryCatch(someServerAction(someParam));

if (error) {
  // Handle error
}
// Handle response

// `response` is typed correctly here
```

---

## Supabase

### Server Client

Always use the server client from `@/lib/supabase/server`:

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data, error } = await supabase.from("table").select("*");
```

**Rules:**

- ✅ Use in Server Components, Server Actions, Route Handlers
- ❌ Never import in `"use client"` components
- The client is already typed with your `Database` types from `db.types.ts`

### Client Client

Always use the client client from `@/lib/supabase/client`:

```ts
import { createClient } from "@/lib/supabase/client";

const supabase = await createClient();
const { data, error } = await supabase.from("table").select("*");
```

**Rules:**

- ✅ Use in Client Components, React Hooks, and other client-side files
- ❌ Never import in `"use server"` components
- The client is already typed with your `Database` types from `db.types.ts`

### Generated Types

Database types are in `@/lib/supabase/db.types.ts`. Regenerate with:

```bash
npx supabase gen types typescript --project-id <id> > src/lib/supabase/db.types.ts
```

or

```bash
bun run gen:types
```

---

## Validation

### Zod Schemas

Always use zod schemas for forms integrated with Tanstack Forms.

Import from `@/lib/validation/utils`:

```ts
import {
  phoneSchema, // Philippine phone: +639XXXXXXXXX or 09XXXXXXXXX
  emailSchema, // Standard email validation
} from "@/lib/validation/utils";

const contactSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
});
```

---

## Environment Variables

**Required:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

## Common Patterns

### Loading States in Server Components

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ItemsSkeleton />}>
      <ItemsList />
    </Suspense>
  );
}

async function ItemsList() {
  const [error, items] = await getItems();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return items.map((item) => <ItemCard key={item.id} item={item} />);
}
```

you may also opt to use `loading.tsx`

### Error Boundaries

For client component errors, wrap in error boundaries. For server function errors, handle the `[error, data]` tuple explicitly.

### Toast Notifications

Toasts use `sonner`. The `<Toaster />` is in the root layout.

```tsx
import { toast } from "sonner";

// Manual usage (usually prefer useAction's toast options)
toast.success("Saved!");
toast.error("Something went wrong");
toast.loading("Saving...");
```
