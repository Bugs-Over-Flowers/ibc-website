# Copilot Instructions for IBC Website

Use repository patterns over generic framework advice.

## Repository Snapshot

- Next.js 16 App Router with `typedRoutes` and `reactCompiler`
- Bun + React 19 + TypeScript with `strict: true`
- Tailwind CSS v4 + shadcn/ui + Base UI
- Supabase backend
- Biome for linting and formatting
- Vitest for unit, integration, and component tests
- Playwright for E2E tests
- Next cache components enabled in `next.config.ts`

## Core Commands

```bash
bun run dev
bun run build
bun run start
bun run biome:check
bun run biome:write
```

## Test Commands

```bash
bun run test
bun run test:watch
bun run test:coverage
bun run test:ui
bun run test:unit
bun run test:integration
bun run test:component
bun run test:local
bun run test:local:ui
```

### Running a Single Test

```bash
bun run test -- __tests__/unit/path/to/file.test.ts
vitest run __tests__/integration/path/to/file.test.ts
vitest run __tests__/component/vitest/path/to/file.test.tsx
vitest run -t "specific test name"
```

Notes:

- `bun run test -- <file>` forwards the file path to Vitest
- Vitest loads `.env.testing`
- Test environment is `happy-dom`
- Vitest includes only `__tests__/unit`, `__tests__/integration`, and `__tests__/component/vitest`
- `__tests__/e2e` is excluded from Vitest

## Playwright Commands

```bash
bun run test:e2e
bun run test:e2e:ui
bun run test:e2e:headed
bun run test:e2e:debug
bun run test:e2e:report
bun run test:e2e:local
playwright test __tests__/e2e/path/to/spec.ts
```

## Other Useful Commands

```bash
bun run email:dev
bun run db:gen:types
bun run gen:types
bun run docker:dev
bun run docker:devb
bun run docker:prod
bun run docker:prodb
```

## Commit Convention

Commit messages must follow `<type>: <description>`.

Allowed types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `test`
- `chore`
- `build`
- `perf`

## Project Structure

- `src/app`: routes, route-local UI, route-local hooks
- `src/components`: reusable UI
- `src/components/form`: registered TanStack Form field components
- `src/hooks`: shared hooks like `useAction` and `useAppForm`
- `src/lib`: utilities, validation, cache tags, Supabase clients, shared types
- `src/server`: feature server logic

Inside `src/server`, prefer:

- `queries/` for reads
- `mutations/` for writes

Do not default to `actions/` for new work. Older files may still exist, but new write operations should go in `mutations/`.

## Placement Rules

- Route-specific components belong in `src/app/**/_components`
- Route-specific hooks belong in `src/app/**/_hooks`
- Reusable components belong in `src/components`
- Feature server code belongs in `src/server/[feature]`
- Shared cross-feature logic should stay in shared lib/server utilities, not random route files

## Imports and Formatting

- Always use the `@/` alias for project imports when possible
- Prefer `import type` for type-only imports
- Let Biome organize imports automatically
- Indentation: 2 spaces
- Strings: double quotes
- Semicolons: required
- Tailwind classes are auto-sorted by Biome's `useSortedClasses` rule
- Use `cn()` from `@/lib/utils` for conditional classes
- Preserve generated component patterns in `src/components/ui`

## TypeScript and Naming

- Keep types strict; avoid `any` unless there is no practical alternative
- Prefer `type` for object shapes and unions; use `interface` when extension is intended
- Prefer explicit return types on exported functions
- Infer validated input types from Zod with `z.infer<typeof Schema>`
- Reuse generated DB types from `@/lib/supabase/db.types.ts`
- Components use PascalCase
- Hooks use camelCase with `use` prefix
- Utility files use camelCase
- Constants use UPPER_SNAKE_CASE
- Server functions use verb-led camelCase like `getMembers`, `createEvent`, `verifyPayment`

## React and Forms

- Prefer Server Components first
- Add `"use client"` only when hooks, browser APIs, handlers, or client context are required
- Use `useAppForm` from `@/hooks/_formHooks`
- Use registered components from `src/components/form`
- Register new custom fields in `@/hooks/_formHooks`
- Preserve `data-invalid` and `aria-invalid` behavior on custom fields
- Use Zod for both form validation and server-side validation

## Error Handling

- Client code should usually wrap async server calls with `tryCatch` from `@/lib/server/tryCatch`
- `tryCatch(promise)` returns `{ success, data, error }`
- `tryCatch(fn)` adapts throwing async functions for `useAction` and `useOptimisticAction`
- Use `useAction` for button-triggered mutations
- Form submission errors should flow through TanStack Form error handling
- Server mutations may throw; callers are expected to handle failures through `tryCatch`

## Supabase Usage

Use the correct client for the correct layer:

- `createClient(requestCookies)` from `@/lib/supabase/server` for server reads and cached queries
- `createActionClient()` from `@/lib/supabase/server` for server mutations that may mutate cookies
- `createClient()` from `@/lib/supabase/client` for client-side usage

Rules:

- Never use `createActionClient()` inside cached queries
- Never use the read-only server client for mutations
- Never import server Supabase clients into client components
- Query modules should use `import "server-only"` when appropriate

## Caching Rules

- Cached queries should use `"use cache"` only when reuse is likely
- Use cache profiles from `next.config.ts`: `publicHours`, `admin5m`, `realtime60s`
- Use centralized tags from `@/lib/cache/tags`; do not hardcode tag strings
- Cached queries should declare both `cacheLife()` and `cacheTag()`
- Prefer `updateTag(...)` for shared data invalidation
- Use `revalidatePath(...)` only when route refresh is intentionally the primary strategy
- Avoid dynamic tag strings like `members:${id}`

## Testing Expectations

- For targeted changes, run the smallest relevant check first
- For style-only changes, `bun run biome:check` is usually enough
- For UI or routing changes, consider `bun run build`
- For broader data-flow changes, run the nearest unit or integration tests plus lint

## Guardrails

- Do not modify `AGENTS.md` or `.github/DOD.md` unless explicitly asked
- When docs and code disagree, trust the actual codebase and config first
- Prefer extending existing feature patterns instead of introducing a new architecture style
