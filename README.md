# Iloilo Business Club Repository

Modern membership, events, and registration platform for the Iloilo Business Club (IBC). The app powers the public-facing site, member workflows, and the internal admin workspace, all built with an App Router stack optimized for Bun, Turbopack, and Supabase.

## Features

- **Public experience**: Informational pages, events calendar, membership details, and registration flows with TanStack Form validation and shadcn/ui components.
- **Membership management**: Admin tools to review applications, manage sectors, update member profiles, and oversee dues or sponsored registrations.
- **Event + attendance management**: Create events, handle RSVPs, run QR-based check-ins, and trigger follow-up emails powered by Supabase and Resend integrations.
- **Operational dashboards**: Admin-only analytics, evaluation workflows, and cached data views with configurable cache tags/lifetimes for fast reporting.
- **Automated communications**: Email templates, sonner toasts, and action hooks that keep users informed across submissions, approvals, and reminders.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 (Server Components-first)
- **Runtime**: Bun with Turbopack for dev builds
- **Language**: TypeScript
- **Styling**: Tailwind CSS and shadcn/ui
- **Forms**: TanStack Form and Zod validation helpers
- **Backend**: Supabase (PostgreSQL, Auth, Storage) + Server Actions

## To run this project:

1. **Clone & install**
   ```bash
   git clone https://github.com/Bugs-Over-Flowers/ibc-website.git
   cd ibc-website
   bun install
   ```
2. **Environment variables** (`.env.local` or `.env`)

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   SUPABASE_SECRET_KEY=your_service_role_key

   EMAIL_FROM=notifications@example.com

   EMAIL_PROVIDER=nodemailer / resend

   # Required if REMAIL_PROVIDER=resend
   RESEND_API_KEY=your_resend_api_key

   # Required if EMAIL_PROVIDER=nodemailer
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=email@gmail.com
   SMTP_PASS=samplePassword
   SMTP_SECURE=false
   ```

3. **Local development**
   ```bash
   bun run dev
   ```
   Visit http://localhost:3000 and sign in via the configured Supabase auth provider(s).
