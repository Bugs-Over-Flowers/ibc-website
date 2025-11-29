# Copilot Instructions for IBC Website

Next.js 16 + React 19 website for the Iloilo Business Club. Uses Turbopack, Tailwind CSS v4, shadcn/ui, and Supabase backend.

## Quick Reference

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run check-code   # Biome lint + format
npm run cy:open      # Cypress interactive
```

## Architecture Overview

```
src/
├── app/
│   ├── (public)/    # Public routes (home, about, events, members, network, contact)
│   ├── admin/       # Admin dashboard routes
│   ├── layout.tsx   # Root layout with Toaster
│   └── globals.css  # Tailwind v4 + oklch design tokens
├── server/          # Server-only data fetching & mutations
├── components/
│   ├── ui/          # shadcn/ui primitives (Radix-based)
│   └── form/        # TanStack Form field wrappers
├── hooks/
│   ├── _formHooks.ts   # TanStack Form context setup
│   └── useAction.ts    # Server action hook for buttons
└── lib/
    ├── actions/     # ServerActionResult types & handlers
    ├── supabase/    # Server client only (uses "server-only")
    └── validation/  # Zod schemas with reusable helpers

Component placement: route-specific → `app/[route]/components/`, reusable → `src/components/`
```

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

Use `useAppForm` from `src/hooks/_formHooks.ts` with field components:

```tsx
import { useAppForm } from "@/hooks/_formHooks";
import { handleActionResult } from "@/lib/actions";

const form = useAppForm({
  defaultValues: { name: "", email: "" },
  onSubmit: async ({ value }) => {
    const result = await createItem(value);
    handleActionResult(result, {
      onSuccess: () => router.push("/items"),
      onError: (err) => form.setErrorMap({ onSubmit: err }),
      successToast: ["Created"],
    });
  },
});

// Available fields: TextField, NumberField, SelectField, TextareaField
<form.AppField name="name">
  {(field) => <field.TextField label="Name" />}
</form.AppField>
```

**Add new field types:** Create in `src/components/form/` using `useFieldContext<T>()`, include `<FieldErrors />`, register in `_formHooks.ts`.

---

## Server Actions

**Always return tuple `[error, data]`:**

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import type { ServerActionResult } from "@/lib/actions";

export async function createItem(input: Input): Promise<ServerActionResult<{ id: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return ["Invalid input", null];

  const supabase = await createClient();
  const { data, error } = await supabase.from("items").insert(parsed.data).select().single();
  if (error) return [error.message, null];

  revalidatePath("/items");
  return [null, { id: data.id }];
}
```

**Button actions** — use `useAction` hook:
```tsx
const { execute, isPending } = useAction(deleteItem, {
  onSuccess: () => router.push("/items"),
  successToast: ["Deleted"],
});
```

**`tryCatch` utility** — wrap promises for consistent error handling:
```ts
const [error, data] = await tryCatch(someAsyncFunction());
if (error) return [error, null];
```

---

## Supabase

- **Server-side only**: Use `await createClient()` from `@/lib/supabase/server`
- Add `import "server-only"` to files in `src/server/`
- Never import server client in `"use client"` components
- Data fetching functions go in `src/server/[domain]/`
- Mutations use `"use server"` directive

**Validation helpers** in `src/lib/validation/utils.ts`:
```ts
import { phoneSchema, emailSchema, requiredString } from "@/lib/validation/utils";
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```
