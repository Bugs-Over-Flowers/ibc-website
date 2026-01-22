# Testing Guide

This project uses **Vitest** for all testing needs including unit tests, integration tests, and component tests.

## 🚀 Quick Start

### Prerequisites

1. **Install Docker Desktop** - Required for local Supabase
   - Download: https://www.docker.com/products/docker-desktop
   - Start Docker Desktop before running tests

   2. **Start Local Supabase**
      ```bash
      supabase start
      ```
      This command:
      - Starts local PostgreSQL on port 54322
      - Starts Supabase API on port 54321
      - Starts Supabase Studio on port 54323
      - Uses credentials from `.env.testing`

   3. **Run Tests**
      ```bash
      # Run all tests (automatically starts Supabase if not running via test:local)
      bun run test:local
      
      # Or manually start Supabase first, then run tests
      supabase start
      bun run test
      ```

   ### First Time Setup

   ```bash
   # 1. Install dependencies
   bun install

   # 2. Start local Supabase (first time will download Docker images)
   supabase start

   # 3. Check Supabase is running
   supabase status

   # 4. Seed test database (optional)
   # (Supabase automatically runs seed.sql on start/reset)
   supabase db reset

   # 5. Run tests
   bun run test
   ```

   ### Environment Variables

   Tests use **`.env.testing`** file which contains:
   - ✅ Local Supabase URLs (`http://127.0.0.1:54321`)
   - ✅ Local database credentials
   - ✅ Test-specific configuration
   - ✅ **Safe to commit** (local development keys only)

   **Important:** The `.env.testing` file is committed to the repository because it only contains local development credentials that work exclusively with your local Supabase instance.

   ## 📁 Test Structure


```
__tests__/
├── unit/                          # Vitest - Pure functions & utilities
│   └── lib/
│       ├── utils.test.ts
│       └── validation.test.ts
│
├── integration/                   # Vitest - Server actions & API
│   ├── auth/
│   ├── events/
│   └── registration/
│
├── component/
│   └── vitest/                    # Vitest - RSCs & UI components
│       ├── server/                # React Server Components
│       └── ui/                    # UI components
│
├── __fixtures__/                  # Test data
│   ├── events.ts                  # Vitest fixtures
│   └── users.ts                   # Vitest fixtures
│
├── __mocks__/                     # Mock implementations
│   └── supabase.ts
│
└── helpers/                       # Test utilities
    ├── setup.ts                   # Vitest setup
    ├── test-utils.tsx             # Custom render helpers
    └── db.ts                      # Database test helpers
```

## 🧪 Testing with Vitest

**Use Vitest for:**
- ✅ Unit tests (pure functions, utilities)
- ✅ Integration tests (server actions, queries)
- ✅ React Server Components (RSCs)
- ✅ UI components (buttons, badges, forms)
- ✅ Prop variations and logic testing

**Why Vitest?**
- Fast execution (no browser overhead)
- Better for RSC testing
- Easier CI/CD integration
- Great for TDD workflows

## 🚀 Running Tests

   ### Local Database Commands

   ```bash
   # Start local Supabase
   supabase start

   # Stop local Supabase
   supabase stop

   # Check Supabase status
   supabase status

   # Reset database (wipes all data and runs migrations)
   supabase db reset

   # Seed test database (runs db:reset + executes supabase/seed.sql)
   # (Supabase automatically seeds on reset)
   supabase db reset

   # Generate TypeScript types from local schema
   bun run db:gen:types
   ```


### Vitest Commands

```bash
# Run all Vitest tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run specific test types
bun run test:unit              # Unit tests only
bun run test:integration       # Integration tests only
bun run test:component         # Component tests only

# Generate coverage report
bun run test:coverage

# Run with UI (interactive mode)
bun run test:ui

# Run specific test file
vitest __tests__/unit/lib/utils.test.ts

# Run all tests
bun run test:all
```

## ✍️ Writing Tests

### Unit Test Example (Vitest)

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
});
```

### Integration Test Example (Vitest)

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
});
```

### Component Test Example (Vitest)

```typescript
// __tests__/component/vitest/ui/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

## 🛠️ Test Utilities

### Fixtures

Mock data for tests:

```typescript
// __tests__/__fixtures__/users.ts
import type { Database } from "@/lib/supabase/db.types";

export const mockUser: Database["public"]["Tables"]["ApplicationMember"]["Row"] = {
  // ... mock data
};
```

### Mocks

Mock implementations:

```typescript
// __tests__/__mocks__/supabase.ts
export const createMockSupabaseClient = () => ({
  from: vi.fn(),
  auth: { getUser: vi.fn() },
});
```

### Setup

Global test configuration:

```typescript
// __tests__/helpers/setup.ts
import { beforeAll, afterEach } from "vitest";

beforeAll(() => {
  // Setup code
});

afterEach(() => {
  vi.clearAllMocks();
});
```

## 📊 Coverage

Generate coverage reports:

```bash
bun run test:coverage
```

Coverage reports are generated in `./coverage/` directory.

**Coverage goals:**
- Unit tests: 80%+
- Integration tests: 70%+
- Overall: 75%+

## 🎯 Best Practices

### General
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **One assertion per test** (when possible)
4. **Arrange, Act, Assert** (AAA pattern)
5. **Clean up after tests** (use afterEach)

### Vitest
1. **Mock external dependencies**
2. **Use `vi.fn()` for function mocks**
3. **Use `describe` for grouping related tests**
4. **Prefer `screen` queries** from testing-library

## 🐛 Debugging Tests

### Vitest Debugging

```bash
# Run with UI for visual debugging
bun run test:ui

# Run specific test in watch mode
vitest __tests__/unit/lib/utils.test.ts --watch

# Use console.log or debug statements
it("test", () => {
  console.log(someValue);
  expect(someValue).toBe(expected);
});
```

## 📝 Testing Checklist

Before submitting a PR:

- [ ] All tests pass (`bun run test`)
- [ ] Coverage meets minimum thresholds
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Test names are descriptive
- [ ] No console errors/warnings
- [ ] Mocks are properly cleaned up

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤔 FAQ

**Q: When should I write tests?**
A: Write tests for all critical features including authentication, payments, data integrity, complex business logic, and admin functionality.

**Q: How do I test React Server Components?**
A: Use Vitest with proper mocking of server-side functions.

**Q: Should I test implementation details?**
A: No. Test behavior and user-facing functionality, not internal implementation.

**Q: How do I test authenticated routes?**
A: Mock the authentication state in your tests.

**Q: Can I test against production Supabase?**
A: No! Tests should NEVER run against production. Always use local Supabase for testing.

## 🔧 Troubleshooting

### "Cannot connect to Docker daemon"
   **Problem:** Supabase won't start  
   **Solution:**
   1. Make sure Docker Desktop is installed
   2. Start Docker Desktop application
   3. Wait for Docker to fully start (whale icon in menu bar)
   4. Try `supabase start` again

   ### "Port already in use"
   **Problem:** Ports 54321, 54322, or 54323 are in use  
   **Solution:**
   ```bash
   # Stop all Supabase services
   supabase stop

   # Check if ports are still in use
   lsof -i :54321
   lsof -i :54322

   # Kill processes if needed
   kill -9 <PID>

   # Restart Supabase
   supabase start
   ```

   ### "Tests fail with Supabase connection error"
   **Problem:** Tests can't connect to local Supabase  
   **Solution:**
   1. Verify Supabase is running: `supabase status`
   2. Check `.env.testing` has correct URLs
   3. Restart Supabase: `supabase stop && supabase start`
   4. Check test output for environment variable warnings


### ".env.testing not loaded"
**Problem:** Tests use wrong environment variables  
**Solution:**
1. Verify `.env.testing` exists in project root
2. Check `vitest.config.ts` loads dotenv correctly
3. Restart test runner
4. Check test setup output for warnings

   ### "Database schema mismatch"
   **Problem:** Tests fail due to missing tables/columns  
   **Solution:**
   ```bash
   # Reset database and run migrations
   supabase db reset

   # Verify migrations ran
   supabase status
   ```

   ### "Test passes locally but fails in CI"

**Problem:** Environment differences  
**Solution:**
1. Make sure CI uses `.env.testing` (or equivalent CI env vars)
2. Verify CI starts local Supabase before tests
3. Check for timing issues (add waits if needed)
4. Review CI logs for environment mismatches

### "Clean up before running tests"
   If tests are failing due to stale data:
   ```bash
   # Full reset workflow
   supabase stop
   supabase start
   supabase db reset
   bun run test
   ```

   ## 🆘 Getting Help

   1. **Check test output** - Tests print helpful environment info
   2. **Review this README** - Most issues are covered in troubleshooting
   3. **Check Supabase status** - `supabase status` shows all services

4. **Read test logs** - Vitest provides detailed error messages
5. **Ask the team** - Share error messages and steps to reproduce
