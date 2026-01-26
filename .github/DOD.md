# Definition of Done
## Code Quality
- Code follows all architectural rules from `AGENTS.md`:
- `@/` path alias used
  - Server Components by default (Client Components only when necessary)
  - Correct Supabase client type used (`createClient`, `createActionClient`, or client-side client)
  - Files placed in correct locations (route-specific vs. global components/hooks)
  - Server logic organized in `src/server/[feature]/mutations` or `queries`
- Code passes Biome checks (formatting & linting):
  - No Biome errors or warnings
- TypeScript strict mode compliance:
  - All type errors resolved
  - Generated Supabase types used from `@/lib/supabase/db.types.ts`
- Naming conventions followed:
  - Components: PascalCase
  - Hooks: camelCase with `use` prefix
  - Server actions: camelCase verbs
  - Constants: UPPER_SNAKE_CASE
## Functionality
-! All acceptance criteria met as defined in the user story
- Validation implemented with Zod schemas for all user inputs/forms
- Error handling properly implemented:
- Server actions wrapped with `tryCatch` on client side
  - Button mutations use `useAction` hook with error callbacks
- Errors are displayed and message is clear
- Loading states implemented:
  - Server Components: `<Suspense>` or `loading.tsx`
  - Client Components: use hook with `<Suspense>` or loading indicators
- Cache invalidation where needed (`revalidatePath()` or `revalidateTag()` after mutations)
## Testing
- All tests pass:
- `bun run test` (unit tests) if necessary
- Manual testing completed:
  - Feature works as expected in development environment
  - Edge cases validated
  - Error scenarios tested
## UI/UX
- Mobile responsiveness verified (required per PR checklist)
- shadcn/ui components used where applicable
- Tailwind CSS styling follows project conventions (if applicable):
  - `cn()` utility for conditional classes
  - `cva()` for component variants
## Accessibility
- Keyboard navigation works for all interactive elements
- Form inputs have proper labels (visible or `aria-label`)
- Focus indicators visible on all interactive elements
- Text readability:
- Minimum font size of 16px (1rem) for most text
  - Sufficient color contrast (WCAG AA minimum or contrast ratio of 4.5:1 or higher)
  - Line height and spacing appropriate for readability
- Error messages are clear and actionable
- Loading states communicated clearly
- Touch targets minimum 360 pixels wide for mobile devices
## Performance
- Production build succeeds: `bun run build`
- Images optimized (Next.js Image component used where appropriate)
- Large data sets paginated or virtualized
- Client-side JavaScript minimized (prefer Server Components)
## Documentation
- Code is self-documenting with clear naming
- (Optional) Complex logic has comments explaining the "why"
## Git & Deployment
- Commit messages follow convention: `<type>: <description>`
  - Types: feat, fix, docs, style, refactor, test, chore, build, perf
- Pre-commit hooks pass:
  - Biome auto-fix on staged files
  - Package audit for security vulnerabilities
- Self-review completed (per PR checklist)
- Pull request created with (applicable applied):
  - Jira ticket ID referenced (BOF-XXX)
  - Description of changes and rationale
- Screenshots/video for UI changes or
  - Type of change selected
  - Concerns/known issues documented
## Security
- No secrets committed (`.env.local`, credentials, API keys)
- Input validation performed with Zod
- No vulnerable dependencies (passes `bun audit`)
- Authentication/authorization verified for protected routes
