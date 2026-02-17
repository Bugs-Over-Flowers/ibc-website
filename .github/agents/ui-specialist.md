# UI Component Specialist Agent

## When to Apply

Use this agent when working with:
- shadcn/ui component integration
- Custom form field components
- Tailwind CSS v4 with oklch design tokens
- Responsive layout patterns
- Component variants with `cva()`

## Adding shadcn/ui Components

```bash
bunx --bun shadcn@latest add <component>
```

Available components: https://ui.shadcn.com/docs/components

## Using UI Components

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Input placeholder="Enter value" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Styling with Tailwind CSS

### Using `cn()` for Conditional Classes

```tsx
import { cn } from "@/lib/utils";

function Button({ variant, className }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800",
        className
      )}
    >
      Click me
    </button>
  );
}
```

### Using `cva()` for Component Variants

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "px-4 py-2 rounded-md font-medium",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant, size, className, children }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </button>
  );
}
```

## Design Tokens (oklch)

Design tokens use oklch colors as CSS variables in `globals.css`:

```css
:root {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.1 150);
}
```

Usage in Tailwind:

```tsx
<div className="bg-[var(--color-primary)] text-white">
  Primary color background
</div>
```

## Component File Placement

- Route-specific components → `app/[route]/_components/`
- Forms → `app/[route]/_components/forms/`
- Route-specific hooks → `app/[route]/_hooks/`
- Global/reusable components → `src/components/`
- shadcn/ui primitives → `src/components/ui/`

## Server vs Client Components

### Server Component (Default)

```tsx
export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}
```

### Client Component

```tsx
"use client";

export function UserForm() {
  const [name, setName] = useState("");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

**When to use "use client":**
- Using React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onSubmit, etc.)
- Browser APIs (window, document, localStorage)
- Context consumers

**Default to Server Components** - only add `"use client"` when needed

## Caching Considerations

When building UI that displays cached data:

### Loading States with Cached Data

```tsx
import { Suspense } from "react";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();

  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersList cookies={cookieStore.getAll()} />
    </Suspense>
  );
}

async function UsersList({ cookies }: { cookies: RequestCookie[] }) {
  const users = await getCachedUsers(cookies); // Uses "use cache"
  return <UserGrid users={users} />;
}
```

### When to Use "use cache" in Components

- Server Components can use `"use cache"` at file or function level
- Pass cookies from the page level to cached query functions
- Don't add "use cache" to Client Components (it only works in Server Components)

### Cache Invalidation from UI Actions

When UI triggers mutations (e.g., button clicks):

```tsx
"use client";

import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { deleteUser } from "@/server/users/mutations";

export function DeleteButton({ userId }: { userId: string }) {
  const { execute, isPending } = useAction(tryCatch(deleteUser), {
    onSuccess: () => {
      // Router refresh will trigger re-fetch of cached data
      router.refresh();
    },
  });

  return <button onClick={() => execute(userId)}>Delete</button>;
}
```

## Common Pitfalls

- Don't use relative imports when `@/` alias is available
- Always use `cn()` for conditional classes
- shadcn/ui components use `data-slot` attributes
- Import shadcn components from `@/components/ui/`
- Use oklch design tokens for colors
