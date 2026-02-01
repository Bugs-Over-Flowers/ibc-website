# Server Specialist Agent

## When to Apply

Use this agent when working with:
- Server Actions (mutations) in `src/server/[feature]/mutations/`
- Server Queries in `src/server/[feature]/queries/`
- Supabase server-side operations
- Error handling with `tryCatch`
- Cache revalidation with `revalidatePath()`

## Server Actions (Mutations)

### Basic Pattern

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
  // 1. Validate input (throws on failure)
  const parsed = schema.parse(input);
  
  // 2. Perform mutation with createActionClient
  const supabase = await createActionClient();
  const { data, error } = await supabase
    .from("users")
    .insert(parsed)
    .select("id")
    .single();
  
  if (error) throw new Error(error.message);
  
  // 3. Revalidate and return
  revalidatePath("/users");
  return data;
}
```

### Rules for Server Actions

- **MUST** use `"use server"` directive
- **MUST** be in `src/server/[feature]/mutations/` folder
- Can throw errors freely - use `tryCatch` on client to handle
- **MUST** validate input with Zod schemas (throws on failure)
- **MUST** use `createActionClient()` from `@/lib/supabase/server` for Supabase
- **MUST** call `revalidatePath()` after mutations when needed

## Server Queries (Data Fetching)

### Basic Pattern

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

### Cached Query Pattern

```typescript
import "server-only";

export async function getCachedData(requestCookies: RequestCookie[]) {
  "use cache";
  const supabase = await createClient(requestCookies);
  const { data, error } = await supabase.from("table").select("*");
  // ...
}
```

### Rules for Server Queries

- **MUST** use `import "server-only"` directive
- **MUST** be in `src/server/[feature]/queries/` folder
- Can throw errors - use `tryCatch` on client to handle
- **MUST** use `createClient(requestCookies)` from `@/lib/supabase/server` for Supabase
- Get cookies from `next/headers` and pass to `createClient()`
- For cached queries, use `"use cache"` directive and pass cookies from page level

## Client-Side Error Handling

### Using tryCatch

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

## Server Function Types

```typescript
import { ServerFunctionResult } from "@/lib/server/types";

type CreateUserInput = z.infer<typeof createUserSchema>;
export async function createUser(
  input: CreateUserInput
): Promise<ServerFunctionResult<{ id: string }>> {
  // ...
}
```

The result is a discriminated union based on the `success` property:
- `{ success: true, data: T }` - Success case with typed data
- `{ success: false, error: E }` - Error case with error object

## Common Pitfalls

1. **Don't use `createActionClient()`** in cached queries
2. **Don't use `createClient(requestCookies)`** for mutations
3. **Always wrap server actions with `tryCatch`** on the client side
4. **Always validate with Zod** before processing user input
5. **Don't forget `revalidatePath()`** after mutations that affect cached data
6. Server actions can **throw errors freely** - the client handles them with `tryCatch`
