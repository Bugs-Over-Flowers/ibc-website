# Testing Specialist Agent

## When to Apply

Use this agent when working with:
- Unit tests for utilities and pure functions
- Integration tests for server actions
- Component tests with Testing Library
- Test fixtures and mocks
- Test coverage requirements

## Quick Start

```bash
# Run all tests
bun run test

# Run with local Supabase
bun run test:local

# Run specific test types
bun run test:unit              # Unit tests only
bun run test:integration       # Integration tests only
bun run test:component         # Component tests only

# Run with UI
bun run test:ui

# Generate coverage
bun run test:coverage
```

## Test Structure

```
__tests__/
├── unit/                    # Pure functions & utilities
│   └── lib/
│       ├── utils.test.ts
│       └── validation.test.ts
│
├── integration/             # Server actions & API
│   ├── auth/
│   ├── events/
│   └── registration/
│
├── component/               # UI components
│   └── vitest/
│       ├── server/          # React Server Components
│       └── ui/              # UI components
│
├── __fixtures__/            # Test data
│   ├── events.ts
│   └── users.ts
│
├── __mocks__/               # Mock implementations
│   └── supabase.ts
│
└── helpers/                 # Test utilities
    ├── setup.ts
    ├── test-utils.tsx
    └── db.ts
```

## Unit Test Example

```typescript
// __tests__/unit/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("base", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
  });
  
  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });
});
```

## Integration Test Example

```typescript
// __tests__/integration/server/tryCatch.test.ts
import { describe, it, expect } from "vitest";
import tryCatch from "@/lib/server/tryCatch";

describe("tryCatch", () => {
  it("should handle successful promise", async () => {
    const result = await tryCatch(Promise.resolve({ data: "test" }));
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: "test" });
  });
  
  it("should handle rejected promise", async () => {
    const result = await tryCatch(Promise.reject(new Error("Failed")));
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
  
  it("should handle throwing function", async () => {
    const throwingFn = () => { throw new Error("Error"); };
    const result = await tryCatch(throwingFn());
    expect(result.success).toBe(false);
  });
});
```

## Component Test Example

```typescript
// __tests__/component/vitest/ui/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
  
  it("should handle click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## Test Fixtures

```typescript
// __tests__/__fixtures__/users.ts
import type { Database } from "@/lib/supabase/db.types";

export const mockUser: Database["public"]["Tables"]["users"]["Row"] = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Test User",
  email: "test@example.com",
  created_at: new Date().toISOString(),
};

export const mockUsers = [
  mockUser,
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    name: "Another User",
    email: "another@example.com",
    created_at: new Date().toISOString(),
  },
];
```

## Mocking Supabase

```typescript
// __tests__/__mocks__/supabase.ts
import { vi } from "vitest";

export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
  },
});
```

## Local Supabase Setup

```bash
# Start local Supabase
supabase start

# Check status
supabase status

# Reset database (runs migrations)
supabase db reset

# Generate types
bun run db:gen:types
```

## Coverage Requirements

- **Unit tests:** 80%+
- **Integration tests:** 70%+
- **Overall:** 75%+

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names** (`it("should handle successful login")`)
3. **One assertion per test** (when possible)
4. **Arrange, Act, Assert** (AAA pattern)
5. **Clean up after tests** (use `afterEach`)
6. **Mock external dependencies**
7. **Use `vi.fn()` for function mocks**
8. **Use `describe` for grouping related tests**
9. **Prefer `screen` queries** from testing-library

## Testing Checklist

Before submitting a PR:

- [ ] All tests pass (`bun run test`)
- [ ] Coverage meets minimum thresholds
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Test names are descriptive
- [ ] No console errors/warnings
- [ ] Mocks are properly cleaned up

## Testing Cached Functions

When testing cached queries (functions with `"use cache"`):

```typescript
// Test the data fetching logic, not the cache itself
import { describe, it, expect, vi } from "vitest";
import { getCachedUsers } from "@/server/users/queries";

describe("getCachedUsers", () => {
  it("should return users with correct structure", async () => {
    // Pass mock cookies since function expects RequestCookie[]
    const mockCookies: RequestCookie[] = [];
    const users = await getCachedUsers(mockCookies);

    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });
});
```

**Important:** Don't test cache behavior (cache hits/misses) in unit tests. The cache is a Next.js framework concern.

## Testing Mutations with Cache Invalidation

```typescript
describe("createUser mutation", () => {
  it("should invalidate cache tags after creation", async () => {
    const { updateTag } = await import("next/cache");
    const updateTagSpy = vi.spyOn(await import("next/cache"), "updateTag");

    await createUser({ name: "Test User", email: "test@example.com" });

    expect(updateTagSpy).toHaveBeenCalledWith(CACHE_TAGS.members.all);
    expect(updateTagSpy).toHaveBeenCalledWith(CACHE_TAGS.members.admin);
  });
});
```

## Common Pitfalls

- Don't test implementation details - test behavior and user-facing functionality
- Always clean up mocks in `afterEach`
- Never run tests against production Supabase
- Use `test:local` for tests requiring database
- Mock external APIs and services
- Use fixtures for consistent test data
