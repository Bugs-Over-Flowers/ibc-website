# Database Specialist Agent

## When to Apply

Use this agent when working with:
- Supabase PostgreSQL queries
- Type-safe database operations
- Supabase client selection
- Caching strategies
- Database types and migrations

## Three Supabase Client Types

### 1. Server-Side: `createClient(requestCookies)` - For Cached Queries

**Use when:** Server Components, cached queries with `"use cache"`

```typescript
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

**Rules:**
- ✅ Use in cached queries (`"use cache"`) or Server Components
- ✅ Requires passing `requestCookies` from `cookies().getAll()`
- ❌ Cannot set cookies (read-only)
- ❌ Never use for mutations

### 2. Server-Side: `createActionClient()` - For Server Actions

**Use when:** Server Actions with `"use server"`

```typescript
"use server";

import { createActionClient } from "@/lib/supabase/server";

export async function updateItem(data: FormData) {
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
- ❌ Never use inside `"use cache"` functions
- ❌ Never import in `"use client"` components

### 3. Client-Side: `createClient()` - For Client Components

**Use when:** Client Components, React Hooks

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = await createClient();
const { data, error } = await supabase.from("table").select("*");
```

**Rules:**
- ✅ Use in Client Components, React Hooks, and client-side files
- ❌ Never import in `"use server"` functions

## Type-Safe Database Operations

### Using Generated Types

```typescript
import { Database } from "@/lib/supabase/db.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type NewUser = Database["public"]["Tables"]["users"]["Insert"];

async function createUser(user: NewUser): Promise<User> {
  const supabase = await createActionClient();
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}
```

## Regenerate Database Types

```bash
# For Local Development (after migrations)
bun run db:gen:types

# For Production (before deployment)
bun run gen:types
```

## Caching Strategies

### Using "use cache" Directive

```typescript
import "server-only";

export async function getCachedData(requestCookies: RequestCookie[]) {
  "use cache";
  cacheLife(60); // Cache for 60 seconds
  cacheTag("users"); // Tag for invalidation
  
  const supabase = await createClient(requestCookies);
  const { data } = await supabase.from("users").select("*");
  
  return data;
}
```

### Cache Invalidation

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function updateUser(id: string, data: UserUpdate) {
  const supabase = await createActionClient();
  await supabase.from("users").update(data).eq("id", id);
  
  // Invalidate cache
  revalidatePath("/users");
  revalidateTag("users");
}
```

## Query Patterns

### Basic Select

```typescript
const { data, error } = await supabase
  .from("users")
  .select("*");
```

### Select with Joins

```typescript
const { data, error } = await supabase
  .from("posts")
  .select("*, author:users(name, email)");
```

### Select with Filters

```typescript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("status", "active")
  .gt("created_at", "2024-01-01")
  .order("created_at", { ascending: false })
  .limit(10);
```

### Insert

```typescript
const { data, error } = await supabase
  .from("users")
  .insert({ name: "John", email: "john@example.com" })
  .select()
  .single();
```

### Update

```typescript
const { data, error } = await supabase
  .from("users")
  .update({ name: "Jane" })
  .eq("id", userId)
  .select()
  .single();
```

### Delete

```typescript
const { error } = await supabase
  .from("users")
  .delete()
  .eq("id", userId);
```

## Common Pitfalls

1. **Don't mix client types incorrectly:**
   - Never use `createActionClient()` in cached queries
   - Never use `createClient(requestCookies)` for mutations
   - Never use client-side `createClient()` in server actions

2. **Always handle errors:**
   ```typescript
   if (error) throw new Error(error.message);
   ```

3. **Don't forget to regenerate types** after schema changes

4. **Use proper cache invalidation** after mutations with `revalidatePath()` and `revalidateTag()`

5. **Pass cookies from page level** for cached queries - don't read cookies inside cached functions
