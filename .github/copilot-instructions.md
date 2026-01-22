# Copilot Instructions for IBC Website

Next.js 15 + React 19 website for the Iloilo Business Club. Uses Turbopack, Tailwind CSS v4, shadcn/ui, Supabase backend, and bun.

## Commit Message Convention

All commit messages must follow this format: `<type>: <description>`

**Commit Types:**

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation updates
- `style:` formatting (no code change)
- `refactor:` code restructure (no feature/bug fix)
- `test:` add/modify tests
- `chore:` maintenance tasks
- `build:` build system changes
- `perf:` performance improvement

**Examples:**

- `feat: add user authentication`
- `fix: resolve infinite loop in data fetching`
- `docs: update API documentation`
- `refactor: extract validation logic to utility`

## Quick Reference

```bash
bun run dev          # Dev server (Turbopack)
bun run build        # Production build
bun run check-code   # Biome lint + format
supabase start       # Start local Supabase
supabase db reset    # Reset local DB & run migrations
bun run test:local   # Run tests with local Supabase
bun run test:all     # Run all tests
bun run db:gen:types # Generate local types
bun run gen:types    # Generate production types
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
│   ├── ui/             # shadcn/ui primitives (Base-ui-based)
│   └── form/           # TanStack Form field wrappers
├── hooks/
│   ├── _formHooks.ts   # TanStack Form context setup
│   └── useAction.ts    # Server action hook for buttons
├─── lib/
│   ├── qr              # QR code generation functions
│   ├── resend          # Email resend library
│   ├── server/         # Server Function types, tryCatch utility
│   ├── supabase/       # Supabase library
│   ├── types/          # Type definitions for shared data
│   ├── validation/     # Zod schemas for forms and general validation of data types
│   ├── constants.ts    # Constants for shared data
│   ├── utils.ts        # Utility functions for queries and actions
└── server/
    ├── members/        # Member feature related business logic
    │   ├── queries/
    │   └── actions/
    ├── events/         # Event feature related business logic
    │   ├── queries/
    │   └── actions/
    ├── registration/   # Registration feature related business logic
    │   ├── queries/
    │   ├── actions/
    │   ├── utils.ts
    └── [other features / business logic]
```

Component placement:

- Route-specific components → `app/[route]/_components/`
- Include forms under `app/[route]/_components/forms/`
- Route-specific hooks under `app/[route]/_hooks/`
- Keep global / reusable components → `src/components/`

Server logic placement:

- Feature-specific server logic → `src/server/[feature]/`
- mutations (POST, PUT, DELETE) → `src/server/[feature]/mutations/<filename>.ts`
- queries (GET) → `src/server/[feature]/queries/<filename>.ts`
- Shared server logic → `src/server/utils.ts`
- Add utils under feature-specific if needed.

---

## Code Conventions

### Imports & Styling

- Always use `@/` path alias (maps to `./src/`)
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Use `cva()` from `class-variance-authority` for component variants
- Design tokens in `globals.css` use oklch colors as CSS variables

### Components

- Server Components by default; add `"use client"` only when needed
- shadcn/ui components use `data-slot` attributes and Base-ui primitives
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
import tryCatch from "@/lib/server/tryCatch";
import { createItem } from "@/server/items/mutations";
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
      onSubmit: CreateItemFormSchema, // or use zodValidator(CreateItemFormSchema)
    },
    onSubmit: async ({ value }) => {
      const { error, data } = await tryCatch(createItem(value));

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
      <form.AppForm>
        <form.SubmitButton
          label={"Submit"}
          isSubmittingLabel={"Submitting..."}
        />
      </form.AppForm>
    </form>
  );
}
```

### Adding New Field Types

1. Create component in `src/components/form/` using `useFieldContext<T>()`
2. Include `<FieldErrors />` for validation display
3. Export from `src/components/form/index.ts`
4. Include `data-invalid` and `aria-invalid` attributes on necessary elements (see shadcn documentation) [documentation](https://ui.shadcn.com/docs/components)
5. Register in `src/hooks/_formHooks.ts` under `fieldComponents`

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

  const isInvalid = field.state.meta.touched && !field.state.meta.isValid;

  return (
    <Field
      className={cn("grid gap-2", className)}
      data-invalid={isInvalid}
      aria-invalid={isInvalid}
    >
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      {/* Your input component here */}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldErrors errors={field.state.meta.errors} />
    </Field>
  );
}

export default MyField;
```

---

## Server Functions

### Types

`@/lib/server/types`:

```ts
type ServerFunctionSuccess<T> = { success: true; data: T };
type ServerFunctionError<E> = { success: false; error: E };

type ServerFunctionResult<T, E = Error | string> =
  | ServerFunctionError<E>
  | ServerFunctionSuccess<T>;

type ServerFunction<
  TInput extends unknown[],
  TOutput,
  TError = Error | string,
> = (...args: TInput) => Promise<ServerFunctionResult<TOutput, TError>>;
```

These are used for the return type of the `tryCatch` utility function. The result is a discriminated union based on the `success` property:

- `{ success: true, data: T }` - Success case with typed data
- `{ success: false, error: E }` - Error case with error object

### Writing Server Functions

Server actions can **throw errors freely**, or utilize the `ServerFunction` type. Use `tryCatch` on the client to handle server actions that throw errors. Or simply, create a tryCatch boundary where it is called.

**Use `"use server"` for server actions under the `/actions` folders:**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type CreateItemInput = z.infer<typeof createItemSchema>;

export async function createItem(input: CreateItemInput) {
  // 1. Validate input (throws on failure)
  const parsed = createItemSchema.parse(input);

  // 2. Perform mutation
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert(parsed)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // 3. Revalidate and return if needed
  revalidatePath("/items");
  return { id: data.id };
}
```

**Use `import "server-only"` for data fetching under the `/queries` folder:**

```ts
import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type Item = { id: string; name: string };

export async function getItems(): Promise<Item[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());
  const { data, error } = await supabase.from("items").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

---

## Client-Side Action Handling

### `tryCatch` Utility

The `tryCatch` utility from `@/lib/server/tryCatch` converts throwing functions/promises into `[error, data]` tuples. It supports two usage patterns:

**1. Wrap a function** (for use with `useAction`):

```ts
import tryCatch from "@/lib/server/tryCatch";
import { useAction } from "@/hooks/useAction";
import { createItem } from "@/server/items/mutations";

// tryCatch wraps the function, converting thrown errors to tuples
const { execute } = useAction(tryCatch(createItem), {
  onSuccess: (data) => console.log(data),
  onError: (error) => console.error(error),
});

execute({ name: "New Item" });
```

**2. Wrap a promise** (for inline use):

```ts
import tryCatch from "@/lib/server/tryCatch";
import { createItem } from "@/server/items/mutations";

// tryCatch wraps the promise directly
const { error, data, success } = await tryCatch(createItem(input));

if (!success) {
  toast.error(error);
  return;
}

console.log(data);
```

### `useAction` Hook

For button-triggered mutations (not form submissions). Use with `tryCatch` to wrap server actions that throw:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { deleteItem } from "@/server/items/mutations";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const { execute, isPending, error } = useAction(tryCatch(deleteItem), {
    onSuccess: () => router.push("/items"),
    onError: (err) => toast.error(err.message),
  });

  return (
    <button onClick={() => execute(id)} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

**`useAction` returns:**

| Property    | Type                                                                 | Description           |
| ----------- | -------------------------------------------------------------------- | --------------------- |
| `execute`   | `(...args: TInput) => Promise<ServerFunctionResult<TOutput, Error>>` | Triggers the action   |
| `isPending` | `boolean`                                                            | Loading state         |
| `data`      | `TOutput \| null`                                                    | Success result        |
| `error`     | `Error \| null`                                                      | Error object          |
| `reset`     | `() => void`                                                         | Clears data and error |

---

## Supabase

### Server-side Supabase Clients

There are **two** server-side clients in `@/lib/supabase/server`:

#### `createClient(requestCookies)` - For Cached Queries

Use this in `"use cache"` functions or cached Server Components. Requires passing cookies from the page level:

```ts
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// In page.tsx
const cookieStore = await cookies();
const data = await getCachedData(cookieStore.getAll());

// In query file with "use cache"
export async function getCachedData(requestCookies: RequestCookie[]) {
  "use cache";
  const supabase = await createClient(requestCookies);
  const { data, error } = await supabase.from("table").select("*");
  // ...
}
```

If the query requires dynamic fetching, you may opt to get the cookies on the query itself:

```ts
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getDynamicData() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());
  const { data, error } = await supabase.from("table").select("*");
  // ...
}
```

**Rules:**

- ✅ Use in cached queries (`"use cache"`)
- ❌ Cannot set cookies (read-only)
- ❌ Never use for mutations

#### `createActionClient()` - For Server Actions & Mutations

Use this in Server Actions where cookie mutation is needed (e.g., auth token refresh):

```ts
import { createActionClient } from "@/lib/supabase/server";

export async function updateItem(data: FormData) {
  "use server";
  const supabase = await createActionClient();
  const { data, error } = await supabase
    .from("table")
    .update(data)
    .eq("id", id);
  // ...
}
```

**Rules:**

- ✅ Use in Server Actions (`"use server"`)
- ✅ Can set cookies (auth token refresh)
- ❌ Do NOT use inside `"use cache"` functions
- ❌ Never import in `"use client"` components

Both clients are typed with your `Database` types from `db.types.ts`.

### Client-side Supabase Client

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

Database types are in `@/lib/supabase/db.types.ts`.

**For Local Development (after migrations):**
```bash
bun run db:gen:types
```

**For Production (before deployment):**
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

### Loading States in Client Components

```tsx
// page.tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ItemsSkeleton />}>
      <ItemsList />
    </Suspense>
  );
}

// Items.tsx
("use client");
import { getItems } from "@/lib/data";
import { use } from "react";

function ItemsList() {
  const [error, items] = use(getItems);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return items.map((item) => <ItemCard key={item.id} item={item} />);
}
```

- You may also opt to use `loading.tsx`
- For a page with multiple queries, you may use `await Promise.all([query1(), query2()])`
- Revalidate and return if needed
- In cases where client side reactivity is needed, use `use` hook from `react` library. It allows you to await promises in the client. see [https://react.dev/reference/react/use](https://react.dev/reference/react/use) for more information.

### Caching Components / Data

Use the "use cache" directive inside query functions, inside react server components,
or on top of the file to cache data. Add a cacheLife() and a cacheTag() if needed.

```tsx
// page.tsx -- cached file
"use cache";

export default function GetItems({ searchParams }: PageProps<"/">) {
  const items = await getItems(searchParams);

  return items.map((item) => <ItemCard key={item.id} item={item} />);
}

// page.tsx -- cached component
export default function GetItems({ searchParams }: PageProps<"/">) {
  "use cache";
  // cacheLife("default")
  // cacheTag("items")
  const items = await getItems(searchParams);

  return items.map((item) => <ItemCard key={item.id} item={item} />);
}

// getItems.ts
import "server-only";

export async function getItems(
  requestCookies: RequestCookie[],
  searchParams: SearchParams,
) {
  "use cache";
  const supabase = await createClient(requestCookies);

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("status", "active");

  return items.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));
}
```

In most cases, the file cannot be cached due to supabase's
requirement of the cookies for SSR for fetching data, which requires
to be resolved on a higher component / function.

```tsx
import { cookies } from "next/headers";

export default async function GetItems({ searchParams }: PageProps<"/">) {
  // get cookies from the component
  const cookieStore = await cookies();

  // then pass the cookies to the getItems function
  const items = await getItems(cookieStore.getAll(), searchParams);

  return items.map((item) => <ItemCard key={item.id} item={item} />);
}

// getItems.ts
import "server-only";

export async function getItems(
  requestCookies: RequestCookie[],
  searchParams: SearchParams,
) {
  "use cache";
  const supabase = await createClient(requestCookies);

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("status", "active");

  return items.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));
}
```

- cacheLife will be used to set the cache duration in seconds
- cacheTag will be used to set a certain tag for the cache, which can be used to invalidate the cache.

For more details, see [Next.js caching](https://nextjs.org/docs/app/building-your-application/caching),
[CacheComponents](https://nextjs.org/docs/app/getting-started/cache-components)

### Toast Notifications

Toasts use `sonner`. The `<Toaster />` is in the root layout.

```tsx
import { toast } from "sonner";

// Manual usage (usually prefer useAction's toast options)
toast.success("Saved!");
toast.error("Something went wrong");
toast.loading("Saving...");
```
