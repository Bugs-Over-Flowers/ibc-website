# Server Specialist Agent

## When to Apply

Use this agent when working with:
- Server Actions (mutations) in `src/server/[feature]/mutations/`
- Server Queries in `src/server/[feature]/queries/`
- Supabase server-side operations
- Error handling with `tryCatch`
- Cache invalidation with `updateTag()` / `revalidateTag()`

## Server Actions (Mutations)

### Basic Pattern

```typescript
"use server";

import { updateTag } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";
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

  // 3. Invalidate cache (choose ONE primary strategy)
  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.admin);

  return data;
}
```

### Rules for Server Actions

- **MUST** use `"use server"` directive
- **MUST** be in `src/server/[feature]/mutations/` folder
- Can throw errors freely - use `tryCatch` on client to handle
- **MUST** validate input with Zod schemas (throws on failure)
- **MUST** use `createActionClient()` from `@/lib/supabase/server` for Supabase
- **MUST** invalidate cache after mutations (choose primary strategy below)

### Cache Invalidation Strategy

**Choose ONE primary approach per mutation:**

**1. Tag-Level Invalidation** (preferred for shared data)
- Use when: Data is reused across multiple routes/components
- Use when: You have tagged cached queries
- Benefits: Allows partial invalidation, more granular control
- Implementation:
```typescript
updateTag(CACHE_TAGS.members.all);
updateTag(CACHE_TAGS.members.admin);
```

**2. Path-Level Invalidation** (use sparingly)
- Use when: Freshness is strictly route/segment-driven
- Use when: The affected view is not backed by tagged caches
- Use when: Route-level refresh behavior is explicitly required
- Implementation:
```typescript
revalidatePath("/admin/members");
revalidatePath(`/admin/members/${id}`);
```

**Rules:**
- Choose one primary strategy per mutation
- Only combine both when intentionally needed for different purposes
- NO param tags: Don't create `members:${id}` tags; function arguments are automatically serialized into cache keys
- Use `revalidateTag(tag, "max")` only for public flows with eventual consistency

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
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function getCachedData(requestCookies: RequestCookie[]) {
  "use cache";
  cacheLife("admin5m");
  cacheTag(CACHE_TAGS.members.all);
  cacheTag(CACHE_TAGS.members.admin);

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
- For cached queries, MUST specify both `cacheLife("profileName")` and `cacheTag(CACHE_TAGS.*)`
- Use centralized tags from `@/lib/cache/tags` (never hardcode tag strings)
- Avoid caching high-cardinality or time-dependent queries unless staleness is intentional

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
5. **Don't forget cache invalidation** after mutations (choose tag-level or path-level strategy)
6. **Don't create param tags** like `members:${id}` - function arguments are automatically serialized into cache keys
7. **Don't mix invalidation strategies** without intent - choose tag-level OR path-level as primary
8. Server actions can **throw errors freely** - the client handles them with `tryCatch`
