# Agent Development Guide - IBC Website

This guide provides essential information for AI coding agents working in this repository.

## Commit Message Convention

All commit messages **MUST** follow this format: `<type>: <description>`

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

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + Turbopack
- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **UI:** shadcn/ui (Base-ui primitives)
- **Forms:** TanStack Form with Zod validation
- **Backend:** Supabase (PostgreSQL)
- **Testing:** Vitest (unit), Cypress (component/e2e)
- **Linting:** Biome (replaces ESLint + Prettier)
- **Git Hooks:** Lefthook

## Build/Test Commands

```bash
# Development
bun run dev                  # Start dev server with Turbopack
bun run build                # Production build
bun run start                # Start production server

# Code Quality
bun run biome:check          # Lint and format check
bun run biome:write          # Lint and format with auto-fix

# Testing
bun run test                 # Run all tests
bun run test:local           # Start Supabase & run tests
bun run test:local:ui        # Start Supabase & run tests with UI
bun run test:all             # Run all tests (Unit + Cypress)
bun run test:watch           # Run tests in watch mode
bun run test:coverage        # Run tests with coverage report
bun run test -- <file>       # Run single test file
vitest tests/example.test.ts # Run specific test file directly

# Cypress
bun run cy:open              # Open Cypress interactive mode
bun run cy:run               # Run Cypress tests headless

# Email Development
bun run email:dev            # Email template preview server (port 3050)
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   ├── admin/                    # Admin dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Tailwind + design tokens
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── form/                     # TanStack Form fields
├── hooks/                        # Global React hooks
├── lib/                          # Utilities and configs
│   ├── supabase/                 # Supabase clients
│   ├── validation/               # Zod schemas
│   └── server/                   # Server utilities (tryCatch, types)
└── server/                       # Business logic
    └── [feature]/
        ├── mutations/            # POST/PUT/DELETE actions
        └── queries/              # GET queries
```

### Component Placement Rules

- **Route-specific components:** `app/[route]/_components/`
- **Route-specific forms:** `app/[route]/_components/forms/`
- **Route-specific hooks:** `app/[route]/_hooks/`
- **Global/reusable components:** `src/components/`

### Server Logic Placement Rules

- **Feature business logic:** `src/server/[feature]/`
- **Mutations (POST/PUT/DELETE):** `src/server/[feature]/mutations/<filename>.ts`
- **Queries (GET):** `src/server/[feature]/queries/<filename>.ts`
- **Shared server utils:** `src/server/utils.ts`

## Code Style Guidelines

### Imports

- **ALWAYS** use `@/` path alias (maps to `./src/`) - never use relative paths
- Organize imports: external packages → internal modules → components → types
- Biome auto-sorts imports on save

```typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
```

### Formatting

- **Indentation:** 2 spaces (enforced by Biome)
- **Quotes:** Double quotes for strings
- **Semicolons:** Required
- **Line length:** No strict limit (Biome handles wrapping)
- **Tailwind classes:** Auto-sorted by Biome's `useSortedClasses` rule
- Use `cn()` from `@/lib/utils` for conditional classes
- Use `cva()` from `class-variance-authority` for component variants

### TypeScript

- **Strict mode enabled** - all type errors must be resolved
- Use `type` for object shapes, `interface` for extensible contracts
- Prefer explicit return types on exported functions
- Use generated types from `@/lib/supabase/db.types.ts` for database tables
- Server functions use `ServerFunctionResult<T, E>` from `@/lib/server/types`

```typescript
// Good
export async function getUser(id: string): Promise<User> {
  // ...
}

// For server actions
type CreateUserInput = z.infer<typeof createUserSchema>;
export async function createUser(input: CreateUserInput): Promise<{ id: string }> {
  // ...
}
```

### Naming Conventions

- **Files:** camelCase for utilities, PascalCase for components
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useUserData.ts`)
- **Server actions:** camelCase verbs (e.g., `createUser`, `updateProfile`)
- **Types/Interfaces:** PascalCase (e.g., `User`, `CreateUserInput`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Components

- **Server Components by default** - only add `"use client"` when needed
- Client-side requirements: hooks, event handlers, browser APIs, context
- Use React 19 patterns: `use` hook for promises in client components
- shadcn/ui components use `data-slot` attributes

```tsx
// Server Component (default)
export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}

// Client Component
"use client";
export function UserForm() {
  const [name, setName] = useState("");
  // ...
}
```

## Server Functions & Error Handling

### Server Actions (Mutations)

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(input: z.infer<typeof schema>) {
  const parsed = schema.parse(input); // Throws on validation failure
  
  const supabase = await createActionClient(); // Can set cookies
  const { data, error } = await supabase
    .from("users")
    .insert(parsed)
    .select("id")
    .single();
  
  if (error) throw new Error(error.message);
  
  revalidatePath("/users");
  return data;
}
```

### Server Queries

```typescript
import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getUsers() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll()); // Read-only
  
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw new Error(error.message);
  
  return data;
}
```

### Client-Side Error Handling

**Use `tryCatch` utility** to convert throwing functions/promises into safe results:

```typescript
import tryCatch from "@/lib/server/tryCatch";
import { createUser } from "@/server/users/mutations";

// In forms
const { error, data, success } = await tryCatch(createUser(input));
if (!success) {
  form.setErrorMap({ onSubmit: error });
  return;
}

// With useAction hook (for buttons, not forms)
const { execute, isPending } = useAction(tryCatch(deleteUser), {
  onSuccess: () => router.push("/users"),
  onError: (err) => toast.error(err),
});
```

## Forms (TanStack Form)

**MUST use `useAppForm` from `@/hooks/_formHooks`** with registered field components.

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

## Supabase Client Usage

### Three Client Types

1. **`createClient(requestCookies)`** - For cached queries/Server Components (read-only)
2. **`createActionClient()`** - For Server Actions (can set cookies)
3. **`createClient()`** (from `client.ts`) - For Client Components

**Never mix client types incorrectly** - see `.cursor/rules/supabase-rules.mdc` for details.

## Validation

**MUST use Zod schemas** for all forms. Import reusable schemas from `@/lib/validation/utils`:

- `phoneSchema` - Philippine phone format
- `emailSchema` - Standard email validation

## Pre-commit Hooks

Lefthook runs automatically on commit:
- Biome check with auto-fix on staged files
- Package audit for security vulnerabilities

To bypass (not recommended): `git commit --no-verify`

## Common Pitfalls

1. **Don't use relative imports** when `@/` alias is available
2. **Don't add `"use client"`** unless component needs client-side features
3. **Don't use `createActionClient()`** in cached queries
4. **Don't use `createClient(requestCookies)`** for mutations
5. **Always wrap server actions with `tryCatch`** on the client side
6. **Always validate with Zod** before processing user input
7. **Don't forget `revalidatePath()`** after mutations that affect cached data

## Additional Resources

- Cursor Rules: `.cursor/rules/` (standard, form, server, supabase)
- Copilot Instructions: `.github/copilot-instructions.md`
- shadcn/ui docs: https://ui.shadcn.com/docs/components
- TanStack Form docs: https://tanstack.com/form/latest
- Supabase docs: https://supabase.com/docs

## Editing Rules

-  Do not modify `AGENTS.md` without explicit instructions.
-  Do not modify `./github/DOD.md` without explicit instructions.
