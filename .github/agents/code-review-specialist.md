# Code Review Specialist Agent

## When to Apply

Use this agent when:
- Reviewing pull requests
- Checking code for adherence to project conventions
- Identifying common pitfalls before submission
- Ensuring code quality and consistency
- Validating patterns against project standards

## Review Checklist

### 1. File Structure & Organization

**✅ Correct:**
- Route-specific components in `app/[route]/_components/`
- Forms in `app/[route]/_components/forms/`
- Route-specific hooks in `app/[route]/_hooks/`
- Global components in `src/components/`
- Server mutations in `src/server/[feature]/mutations/`
- Server queries in `src/server/[feature]/queries/`
- Utilities in `src/lib/`

**❌ Incorrect:**
- Relative imports when `@/` is available
- Components in wrong directories
- Server logic in client directories

### 2. Import Conventions

**✅ Correct:**
```typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppForm } from "@/hooks/_formHooks";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
```

**❌ Incorrect:**
```typescript
import { Button } from "../../components/ui/button"; // Use @/ instead
import { useAppForm } from "../../../hooks/_formHooks"; // Use @/ instead
```

**Checklist:**
- [ ] Always use `@/` path alias
- [ ] Never use relative paths like `../../`
- [ ] Organize imports: external → internal → components → types

### 3. Component Patterns

**✅ Server Component (default):**
```tsx
// No "use client" needed
export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}
```

**✅ Client Component:**
```tsx
"use client";

export function UserForm() {
  const [name, setName] = useState("");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

**❌ Incorrect:**
```tsx
// Adding "use client" without needing it
"use client";
export function StaticHeader({ title }: { title: string }) {
  return <header>{title}</header>; // No hooks or event handlers
}
```

**Checklist:**
- [ ] Default to Server Components
- [ ] Only add `"use client"` when using hooks, event handlers, or browser APIs
- [ ] Check if component truly needs client-side features

### 4. Form Validation

**✅ Correct:**
```tsx
"use client";

import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export function UserForm() {
  const form = useAppForm({
    defaultValues: { name: "", email: "" },
    validation: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { error, data, success } = await tryCatch(createUser(value));
      if (!success) {
        form.setErrorMap({ onSubmit: error });
        return;
      }
      // Handle success
    },
  });
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton label="Create" />
      </form.AppForm>
    </form>
  );
}
```

**❌ Incorrect:**
```tsx
// Not using useAppForm
import { useForm } from "@tanstack/react-form"; // Wrong!

// Not wrapping with tryCatch
onSubmit: async ({ value }) => {
  const data = await createUser(value); // Throws unhandled!
}

// Not validating with Zod
const form = useAppForm({
  defaultValues: { name: "" },
  // Missing validation!
});
```

**Checklist:**
- [ ] Uses `useAppForm` from `@/hooks/_formHooks`
- [ ] Wraps server actions with `tryCatch`
- [ ] Validates with Zod schema
- [ ] Checks `success` before accessing `data`
- [ ] Handles errors with `form.setErrorMap()`
- [ ] Uses `e.preventDefault()` on form submit

### 5. Server Actions

**✅ Correct:**
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
  // 1. Validate
  const parsed = schema.parse(input);
  
  // 2. Perform mutation
  const supabase = await createActionClient();
  const { data, error } = await supabase
    .from("users")
    .insert(parsed)
    .select("id")
    .single();
  
  if (error) throw new Error(error.message);
  
  // 3. Revalidate
  revalidatePath("/users");
  return data;
}
```

**❌ Incorrect:**
```typescript
"use server";

import { createClient } from "@/lib/supabase/server"; // Wrong client!

export async function createUser(data: any) { // No validation!
  const supabase = await createClient(cookies); // Wrong client for mutations!
  await supabase.from("users").insert(data);
  // Missing revalidatePath!
}
```

**Checklist:**
- [ ] Uses `"use server"` directive
- [ ] In correct folder: `src/server/[feature]/mutations/`
- [ ] Validates input with Zod (throws on failure)
- [ ] Uses `createActionClient()` for mutations
- [ ] Throws errors (not returns error objects)
- [ ] Calls `revalidatePath()` when needed

### 6. Server Queries

**✅ Correct:**
```typescript
import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getUsers() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());
  
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw new Error(error.message);
  
  return data;
}
```

**❌ Incorrect:**
```typescript
// Missing "server-only"
import { createClient } from "@/lib/supabase/server";

export async function getUsers() {
  const supabase = await createActionClient(); // Wrong client!
  // ...
}
```

**Checklist:**
- [ ] Uses `import "server-only"`
- [ ] In correct folder: `src/server/[feature]/queries/`
- [ ] Uses `createClient(requestCookies)` for queries
- [ ] Gets cookies from `next/headers`
- [ ] For cached queries: uses `"use cache"` and passes cookies from page level

### 7. Supabase Client Usage

**✅ Correct Usage Summary:**

| Use Case | Client | Import |
|----------|--------|--------|
| Server Actions (mutations) | `createActionClient()` | `@/lib/supabase/server` |
| Server Queries (cached) | `createClient(cookies)` | `@/lib/supabase/server` |
| Client Components | `createClient()` | `@/lib/supabase/client` |

**❌ Common Mistakes:**
```typescript
// Wrong: using createActionClient in cached query
"use cache";
export async function getData() {
  const supabase = await createActionClient(); // ❌
}

// Wrong: using createClient with cookies for mutation
"use server";
export async function updateData() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll()); // ❌
}

// Wrong: importing client-side createClient in server action
"use server";
import { createClient } from "@/lib/supabase/client"; // ❌
```

**Checklist:**
- [ ] Correct client for the context
- [ ] `createActionClient()` only in Server Actions
- [ ] `createClient(cookies)` only in queries/Server Components
- [ ] Client-side `createClient()` only in Client Components

### 8. Styling Conventions

**✅ Correct:**
```tsx
import { cn } from "@/lib/utils";

function Button({ variant, className }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md",
        variant === "primary" && "bg-blue-500 text-white",
        className
      )}
    >
      Click me
    </button>
  );
}
```

**Checklist:**
- [ ] Uses `cn()` for conditional classes
- [ ] Uses `cva()` for component variants
- [ ] Uses oklch design tokens from `globals.css`
- [ ] Tailwind classes auto-sorted (Biome handles this)

### 9. Error Handling

**✅ Correct:**
```typescript
// Server action throws
export async function createUser(data: UserData) {
  const { error } = await supabase.from("users").insert(data);
  if (error) throw new Error(error.message);
  return data;
}

// Client handles with tryCatch
const { error, data, success } = await tryCatch(createUser(input));
if (!success) {
  // Handle error
  return;
}
// Use data safely
```

**❌ Incorrect:**
```typescript
// Server action returns error
export async function createUser(data: UserData) {
  const { error } = await supabase.from("users").insert(data);
  if (error) return { error }; // Don't do this!
  return { data };
}

// Client doesn't check success
const result = await tryCatch(createUser(input));
console.log(result.data); // Could be undefined!
```

**Checklist:**
- [ ] Server actions throw errors (don't return them)
- [ ] Client uses `tryCatch` to wrap throwing functions
- [ ] Always check `success` before accessing `data`
- [ ] Use discriminated union pattern

### 10. TypeScript Conventions

**✅ Correct:**
```typescript
// Use 'type' for object shapes
type User = {
  id: string;
  name: string;
};

// Use 'interface' for extensible contracts
interface UserRepository {
  findById(id: string): Promise<User>;
}

// Explicit return types on exported functions
export async function getUser(id: string): Promise<User> {
  // ...
}

// Use generated types from Supabase
type DBUser = Database["public"]["Tables"]["users"]["Row"];
```

**Checklist:**
- [ ] Strict mode compliance
- [ ] `type` for object shapes
- [ ] `interface` for extensible contracts
- [ ] Explicit return types on exports
- [ ] Uses generated types from `@/lib/supabase/db.types.ts`

### 11. Naming Conventions

**Checklist:**
- [ ] **Files:** camelCase (utilities), PascalCase (components)
- [ ] **Components:** PascalCase (e.g., `UserProfile.tsx`)
- [ ] **Hooks:** camelCase with `use` prefix (e.g., `useUserData.ts`)
- [ ] **Server actions:** camelCase verbs (e.g., `createUser`, `updateProfile`)
- [ ] **Types:** PascalCase (e.g., `User`, `CreateUserInput`)
- [ ] **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### 12. Commit Message Format

**Checklist:**
- [ ] Follows `<type>: <description>` format
- [ ] Uses correct type: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `build:`, `perf:`
- [ ] Description is clear and concise

### 13. Testing Requirements

**Checklist:**
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Critical paths have test coverage
- [ ] All tests pass (`bun run test`)
- [ ] Coverage meets thresholds (80%+ unit, 70%+ integration)

## Code Review Priority

**Critical (Must Fix):**
1. Using wrong Supabase client type
2. Not validating user input with Zod
3. Missing `revalidatePath()` after mutations
4. Security issues (auth checks in server actions)
5. Not using `tryCatch` on client for throwing server actions

**High (Should Fix):**
1. Using relative imports instead of `@/`
2. Missing error handling
3. Adding `"use client"` unnecessarily
4. Not following file structure conventions
5. Missing type annotations on exports

**Medium (Nice to Have):**
1. Missing tests for new features
2. Styling inconsistencies
3. Naming convention violations
4. Missing documentation/comments

## Review Comment Templates

**Critical:**
```
🚨 **Critical**: Using `createActionClient()` in a cached query. This breaks caching. Use `createClient(requestCookies)` instead. See: [Supabase Client Rules](link-to-rules)
```

**High:**
```
⚠️ **High Priority**: Please use `@/` path alias instead of relative imports (`../../`). This is a project convention for consistency.
```

**Suggestion:**
```
💡 **Suggestion**: Consider adding a test for this new feature to ensure it works as expected and prevent future regressions.
```

**Praise:**
```
✅ **Great**: Excellent use of `tryCatch` pattern here! Clean error handling.
```

## Common Pitfalls Summary

1. ❌ Using relative imports when `@/` is available
2. ❌ Adding `"use client"` unnecessarily
3. ❌ Using `createActionClient()` in cached queries
4. ❌ Using `createClient(requestCookies)` for mutations
5. ❌ Not wrapping server actions with `tryCatch` on client
6. ❌ Not validating with Zod before processing input
7. ❌ Forgetting `revalidatePath()` after mutations
8. ❌ Server actions returning errors instead of throwing
9. ❌ Not using `useAppForm` for forms
10. ❌ Using TanStack Form directly instead of the wrapped version

## Quick Reference

**File Locations:**
- Components: `src/components/` (global) or `app/[route]/_components/` (route-specific)
- Forms: `app/[route]/_components/forms/`
- Hooks: `app/[route]/_hooks/` (route-specific) or `src/hooks/` (global)
- Server mutations: `src/server/[feature]/mutations/`
- Server queries: `src/server/[feature]/queries/`
- Validation: `src/lib/validation/`
- Utilities: `src/lib/utils.ts`

**Required Imports:**
- Forms: `useAppForm` from `@/hooks/_formHooks`
- Styling: `cn` from `@/lib/utils`
- Error handling: `tryCatch` from `@/lib/server/tryCatch`
- Server actions: `createActionClient` from `@/lib/supabase/server`
- Server queries: `createClient` from `@/lib/supabase/server`

**Validation:**
- Always use Zod for form validation
- Import reusable schemas from `@/lib/validation/utils`
- Validate on both client and server

**Error Handling:**
- Server actions throw errors
- Client wraps with `tryCatch`
- Check `success` before accessing `data`

**Caching:**
- Use `"use cache"` for data that can be cached
- Pass cookies from page level for cached queries
- Call `revalidatePath()` after mutations
