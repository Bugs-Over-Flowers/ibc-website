# Copilot Instructions for IBC Website

Next.js 15 + React 19 website for the Iloilo Business Club. Uses Turbopack, Tailwind CSS v4, shadcn/ui, and Supabase backend.

---

## Project Structure

```
src/
  app/
    (public)/
      layout.tsx
      page.tsx                      # Landing page
      events/
        page.tsx                    # List events
        [eventId]/
          page.tsx                  # Event details
          register/
            page.tsx                # Public registration form
            success.tsx
      membership/
        apply/
          page.tsx                  # Membership application form
          success.tsx
      about/
        page.tsx
      contact/
        page.tsx
    (admin)/
      layout.tsx
      dashboard/
        page.tsx
      events/
        page.tsx                    # Admin event list
        new/
          page.tsx                  # Create event
        [eventId]/
          page.tsx                  # Event overview
          edit/
            page.tsx
          registrations/
            page.tsx                # Registrations for event
      registrations/
        page.tsx                    # All registrations
        [registrationId]/
          page.tsx
      members/
        page.tsx                    # All members
        [memberId]/
          page.tsx
    api/
      webhook/
        resend/
          route.ts                  # Email webhook (optional)
    layout.tsx
    globals.css

  server/
    events/
      createEvent.ts
      updateEvent.ts
      deleteEvent.ts
      getEvent.ts
      listEvents.ts
    registrations/
      createRegistration.ts
      updateRegistrationStatus.ts
      getRegistration.ts
      listRegistrations.ts
    members/
      createMember.ts
      updateMember.ts
      getMember.ts
      listMembers.ts
    auth/
      login.ts
      logout.ts
      requireAdmin.ts
      getCurrentUser.ts
    utils/
      eventStats.ts
      registrationStats.ts
      memberStats.ts

  components/
    ui/                             # shadcn/ui primitives
    form/                           # TanStack Form field wrappers
    forms/                          # Reusable form components
    layout/                         # Headers, footers, navigation
    table/                          # Data table components
    charts/                         # Dashboard charts
    feedback/                       # Toasts, alerts, modals

  hooks/
    _formHooks.ts                   # TanStack Form context
    useAction.ts                    # Server action hook

  lib/
    utils.ts                        # cn() utility
    actions/
      handleActionResult.ts
      types.ts
    validation/                     # Zod schemas for forms & server actions
      events.ts
      registrations.ts
      members.ts
      auth.ts
    supabase/
      server.ts                     # Server client (import "server-only")
      client.ts                     # Browser client (realtime only)
    auth/
      getRole.ts
    email/
      sendEmail.ts
      templates/
        registrationConfirmation.ts
        sponsoredRegistration.ts
        membershipApproved.ts
    qr/
      generateQr.ts
    constants/
      roles.ts
      routes.ts

  types/
    index.ts                        # Shared TypeScript types

supabase/
  migrations/                       # SQL migration files
  types.ts                          # Generated Supabase types
  seed.sql
```

**Component placement rules:**
- Route-specific components → `app/[route]/components/`
- Global/reusable components → `src/components/` (ui, forms, layout, table, charts, feedback)

---

## Code Conventions

### Imports
Always use `@/` path alias (maps to `./src/`):
```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### Naming
- Components → **PascalCase**
- Variables, functions → **camelCase**
- Server Components by default; only add `"use client"` when needed

### Styling
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Design tokens in `src/app/globals.css` use CSS variables (oklch colors)
- Use `cva()` from `class-variance-authority` for component variants (see `button.tsx`)

---

## Form System (TanStack Form)

Forms use typed context hooks from `src/hooks/_formHooks.ts`.

### Shared Validation Schemas
Define schemas in `src/lib/validation/` to share between forms and server actions:
```ts
// src/lib/validation/eventSchema.ts
import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// Default values matching schema shape
export const createEventDefaults: CreateEventInput = {
  name: "",
  date: "",
  description: "",
};
```

### Form Usage
```tsx
import { useAppForm } from "@/hooks/_formHooks";
import { createEventDefaults } from "@/lib/validation/eventSchema";
import { createEvent } from "@/server/events/createEvent";
import handleActionResult from "@/lib/actions/handleActionResult";

const form = useAppForm({
  defaultValues: createEventDefaults,
  onSubmit: async ({ value }) => {
    const result = await createEvent(value);
    handleActionResult(result, {
      onSuccess: () => router.push("/events"),
      onError: (err) => form.setErrorMap({ onSubmit: err }),
    });
  },
});

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
    <form.AppField name="name">
      {(field) => <field.TextField label="Name" />}
    </form.AppField>
    <form.AppField name="date">
      {(field) => <field.TextField label="Date" type="date" />}
    </form.AppField>
  </form>
);
```

**Available field components**: `TextField`, `NumberField`, `SelectField`, `TextareaField`

To add new field types:
1. Create component in `src/components/form/` using `useFieldContext<T>()`
2. Include `<FieldInfo />` for validation errors
3. Export from `src/components/form/index.ts`
4. Register in `src/hooks/_formHooks.ts` fieldComponents

---

## Server Actions & Error Handling

### Standard Return Type
All server actions must return `ServerActionResult<T>`:
```ts
// src/lib/actions/types.ts
type ServerActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

### Server Action Template
```ts
// src/server/events/createEvent.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createEventSchema, type CreateEventInput } from "@/lib/validation/eventSchema";
import type { ServerActionResult } from "@/lib/actions";

export async function createEvent(
  input: CreateEventInput
): Promise<ServerActionResult<{ id: string }>> {
  const parsed = createEventSchema.safeParse(input);
  
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/events");
  return { success: true, data: { id: data.id } };
}
```

### Client-Side Handling

**Button actions** — use `useAction` hook:
```tsx
import { useAction } from "@/hooks/useAction";

const { execute, isPending } = useAction(deleteEvent, {
  onSuccess: () => router.push("/events"),
  successToast: ["Event deleted"],
});

<Button onClick={() => execute({ id })} disabled={isPending}>Delete</Button>
```

### Rules
- Always return `ServerActionResult<T>` from server actions
- Validate with Zod before any database operation
- Use `handleActionResult` in TanStack Form `onSubmit`
- Use `useAction` hook for button-triggered actions
- Never trust client input—always verify server-side

---

## Supabase Integration

**All Supabase interactions must be server-side** (Server Components, Server Actions, or `src/server/` functions). Exceptions:
- Realtime subscriptions (require client-side)
- Other explicitly needed client-side features

### Server-Only Protection
Add `import "server-only"` to all server-side files to prevent accidental client imports:
```ts
// src/server/events/getEvents.ts
import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw error;
  return data;
}
```

| File | Add `server-only`? |
|------|-------------------|
| `src/server/**/*.ts` | ✅ Yes |
| `src/lib/supabase/server.ts` | ✅ Yes |
| Server Actions (`"use server"`) | ❌ No, use "use server" instead |

**Data fetching pattern** — keep `page.tsx` clean, fetch in `server/`:
```tsx
// src/app/(public)/events/[eventId]/page.tsx
import { getEvent } from "@/server/events/getEvent";
import { notFound } from "next/navigation";

export default async function EventPage({ params }: { params: { eventId: string } }) {
  const event = await getEvent(params.eventId);
  if (!event) notFound();
  
  return <h1>{event.name}</h1>;
}
```

| Function Type | Location | Directive |
|---------------|----------|-----------|
| GET (read data) | `src/server/[domain]/` | None (regular async) |
| Mutations (create/update/delete) | `src/server/[domain]/` | `"use server"` |

### Rules
- Server client: `await createClient()` from `@/lib/supabase/server`
- RLS is enabled on all sensitive tables—never bypass it
- Auth: Google OAuth only, no sign-up flow (admin accounts pre-created)
- Storage uploads go through server actions only
- Never import server client in `"use client"` components

**Environment variables required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## UI Components (shadcn/ui)

Components in `src/components/ui/` follow shadcn/ui patterns:
- Built on Radix UI primitives
- Use `data-slot` attributes for styling hooks
- Variants via `cva()` (see `button.tsx` for example)

**When adding new UI components:**
- Use `bunx --bun shadcn@latest add <component>` or create manually following existing patterns
- Export directly from component file

---

## Animations (GSAP)

- Only use GSAP in `"use client"` components
- Import GSAP and plugins as needed:
  ```tsx
  "use client";
  import gsap from "gsap";
  import { useGSAP } from "@gsap/react";
  ```
- Avoid animations that interfere with usability or accessibility
- Use `useGSAP` hook for proper cleanup in React components

---

## Developer Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run check-code   # Biome check and format
npm run cy:open      # Cypress interactive mode
npm run cy:run       # Cypress headless tests
```

---

## Testing

- **Cypress** for component and E2E tests
- Component tests: `cypress/component/` — use `cy.mount(<Component />)`
- Test fixtures: `cypress/fixtures/`

---

## Security Rules

- RLS active on all critical tables
- Server actions validate roles before mutations
- Sensitive admin data never fetched on public pages
- Secrets never exposed client-side

---

## Email Templates (Resend)

Email templates live in `src/lib/email/templates/`. Use React Email components:

```tsx
// src/lib/email/templates/registrationConfirmation.tsx
import { Html, Head, Body, Container, Text, Link } from "@react-email/components";

interface RegistrationConfirmationProps {
  eventName: string;
  registrantName: string;
  qrCodeUrl: string;
}

export default function RegistrationConfirmation({
  eventName,
  registrantName,
  qrCodeUrl,
}: RegistrationConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hi {registrantName},</Text>
          <Text>You're registered for {eventName}!</Text>
          <Link href={qrCodeUrl}>View your QR code</Link>
        </Container>
      </Body>
    </Html>
  );
}
```

Send emails via server action:
```ts
// src/lib/email/sendEmail.ts
import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  return resend.emails.send({
    from: "IBC <noreply@iloilobusinessclub.org>",
    to,
    subject,
    react,
  });
}
```

---

## QR Code Generation

Generate QR codes for event check-in using `qrcode` package:

```ts
// src/lib/qr/generateQr.ts
import "server-only";
import QRCode from "qrcode";

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
  });
}

// Usage: generate QR with registration ID for check-in
const qrDataUrl = await generateQrDataUrl(`checkin:${registrationId}`);
```

Store QR codes in Supabase Storage or embed as data URLs in emails.

---

## Admin Role Protection

Protect admin actions with role checks:

```ts
// src/server/auth/requireAdmin.ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return user;
}
```

Use in admin pages:
```tsx
// src/app/(admin)/dashboard/page.tsx
import { requireAdmin } from "@/server/auth/requireAdmin";

export default async function DashboardPage() {
  await requireAdmin(); // Redirects if not admin
  
  return <Dashboard />;
}
```

Use in server actions:
```ts
// src/server/events/deleteEvent.ts
"use server";
import { requireAdmin } from "@/server/auth/requireAdmin";

export async function deleteEvent(id: string): Promise<ServerActionResult<void>> {
  await requireAdmin();
  // ... delete logic
}
```

---

## Data Tables (Admin)

Use TanStack Table for admin list pages:

```tsx
// src/components/table/DataTable.tsx
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add pagination controls */}
    </div>
  );
}
```

Define columns per domain:
```tsx
// src/app/(admin)/events/columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { Event } from "@/types";

export const eventColumns: ColumnDef<Event>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "registrationCount", header: "Registrations" },
];
```
