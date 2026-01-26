# Supabase Development & Operations Guide

This comprehensive guide covers the local development workflow, database management, and production deployment procedures for the IBC Website project.

## Table of Contents

- [Supabase Development \& Operations Guide](#supabase-development--operations-guide)
  - [Table of Contents](#table-of-contents)
  - [1. Overview \& Architecture](#1-overview--architecture)
    - [The Stack](#the-stack)
  - [2. Prerequisites \& Installation](#2-prerequisites--installation)
  - [3. First-Time Setup](#3-first-time-setup)
    - [3.1 Supabase CLI Authentication](#31-supabase-cli-authentication)
    - [3.2 Link to Production Project](#32-link-to-production-project)
    - [3.3 Start Local Supabase](#33-start-local-supabase)
    - [3.4 Initial Schema Pull](#34-initial-schema-pull)
    - [3.5 Environment Variables](#35-environment-variables)
  - [4. Daily Development Workflow](#4-daily-development-workflow)
    - [Starting Your Work Session](#starting-your-work-session)
    - [Accessing Tools](#accessing-tools)
    - [Ending Your Session](#ending-your-session)
  - [5. Creating \& Managing Migrations](#5-creating--managing-migrations)
    - [5.1 Approach A: Studio-First (Recommended for Exploration)](#51-approach-a-studio-first-recommended-for-exploration)
    - [5.2 Approach B: Migration-First (Recommended for Complex Logic)](#52-approach-b-migration-first-recommended-for-complex-logic)
    - [5.3 Migration Naming Conventions](#53-migration-naming-conventions)
    - [5.4 Testing Migrations Locally](#54-testing-migrations-locally)
  - [6. Database Branching Strategies](#6-database-branching-strategies)
    - [6.1 Feature Branch Workflow](#61-feature-branch-workflow)
    - [6.2 Handling Conflicts (Multiple Developers)](#62-handling-conflicts-multiple-developers)
  - [7. Syncing with Production](#7-syncing-with-production)
    - [7.1 Pull Latest Production Schema](#71-pull-latest-production-schema)
    - [7.2 Detecting Schema Drift](#72-detecting-schema-drift)
  - [8. Type Generation](#8-type-generation)
    - [8.1 Generating Types from LOCAL Schema](#81-generating-types-from-local-schema)
    - [8.2 Generating Types from PRODUCTION](#82-generating-types-from-production)
  - [9. Production Deployment](#9-production-deployment)
    - [9.1 Pre-Deployment Checklist](#91-pre-deployment-checklist)
    - [9.2 Pushing to Production](#92-pushing-to-production)
    - [9.3 Post-Deployment](#93-post-deployment)
  - [10. Backup \& Recovery Procedures](#10-backup--recovery-procedures)
    - [10.1 What is a "Risky" Migration?](#101-what-is-a-risky-migration)
    - [10.2 Creating a Manual Backup](#102-creating-a-manual-backup)
    - [10.3 Restoring from Backup](#103-restoring-from-backup)
  - [11. Post-Migration Validation](#11-post-migration-validation)
  - [12. Migration Squashing \& Consolidation](#12-migration-squashing--consolidation)
  - [13. Special Features](#13-special-features)
    - [13.1 Row Level Security (RLS)](#131-row-level-security-rls)
    - [13.2 Storage Policies](#132-storage-policies)
    - [13.3 Realtime](#133-realtime)
  - [14. Branch Switching Workflow](#14-branch-switching-workflow)
  - [15. Docker Compose Integration](#15-docker-compose-integration)
    - [Running Full Stack](#running-full-stack)
    - [Networking](#networking)
  - [16. Available NPM Scripts Reference](#16-available-npm-scripts-reference)
  - [17. Best Practices \& Safety Checklists](#17-best-practices--safety-checklists)
    - [Migration Safety Checklist](#migration-safety-checklist)
    - [General Rules](#general-rules)
  - [18. Troubleshooting](#18-troubleshooting)
    - [Port Conflicts](#port-conflicts)
    - [Migration Fails](#migration-fails)
    - [Next.js Can't Connect](#nextjs-cant-connect)
    - [Schema Drift](#schema-drift)
  - [19. Future: Self-Hosting Transition](#19-future-self-hosting-transition)
  - [20. Document Changelog](#20-document-changelog)

---

## 1. Overview & Architecture

We use **Supabase** (PostgreSQL 17) for our database and backend services. The project follows a strict **Development vs. Production** separation:

- **Local Development:** Runs a complete Supabase stack in Docker containers. This is your "sandbox" for safe experimentation.
- **Production:** A hosted Supabase project (Project ID: `rpdourwztdpwdebggkkc`). This is the source of truth for schema and live data.

### The Stack

The local Supabase stack (`supabase start`) spins up the following services via Docker:

- **PostgreSQL 17:** The core database (Port `54322`)
- **PostgREST API:** Auto-generated REST API (Port `54321`)
- **Supabase Studio:** Dashboard UI for managing the local DB (Port `54323`)
- **GoTrue (Auth):** Authentication server
- **Storage API:** For file uploads (S3 compatible)
- **Realtime Server:** For WebSocket subscriptions
- **Inbucket:** Email testing tool (Port `54324`)

---

## 2. Prerequisites & Installation

Before starting, ensure you have the following installed:

1.  **Docker Desktop:** [Download Here](https://www.docker.com/products/docker-desktop/) (Must be running)
2.  **Supabase CLI:** Version v2.67.1 or higher.
    ```bash
    brew install supabase/tap/supabase
    # OR
    npm install -g supabase
    ```
3.  **Bun Runtime:** [Download Here](https://bun.sh/)
4.  **Supabase Account:** You must have access to the `rpdourwztdpwdebggkkc` project in the Supabase dashboard.

---

## 3. First-Time Setup

Follow these steps to set up your local environment for the first time.

### 3.1 Supabase CLI Authentication

Authenticate your local CLI with your Supabase account.

```bash
supabase login
```

This will open your browser. Log in and confirm the token.

### 3.2 Link to Production Project

Link your local environment to the production project to enable syncing.

```bash
supabase link --project-ref rpdourwztdpwdebggkkc
```

_Note: You will be asked for your database password. If you don't have it, ask the team lead._

### 3.3 Start Local Supabase

Start the local Docker containers.

```bash
supabase start
```

_This may take a few minutes the first time as it pulls Docker images._

### 3.4 Initial Schema Pull

If your local migration history is empty or out of sync, pull the latest schema from production.

```bash
supabase db pull
```

This ensures your local `supabase/migrations/` folder matches production.

### 3.5 Environment Variables

1.  Copy `.env.example` to `.env.local` (if not done already).
2.  Update `.env.local` with **Production** credentials if you need to connect to the live DB (rare).
3.  For **Local Development**, the app is pre-configured to look for Supabase at `http://127.0.0.1:54321` when running locally.

---

## 4. Daily Development Workflow

### Starting Your Work Session

```bash
# 1. Start Supabase (Docker)
supabase start

# 2. Verify services are running
supabase status

# 3. Start Next.js App
bun run dev
```

### Accessing Tools

- **Supabase Studio:** [http://127.0.0.1:54323](http://127.0.0.1:54323) (GUI for Database, Auth, Storage)
- **Email Inbucket:** [http://127.0.0.1:54324](http://127.0.0.1:54324) (View locally sent emails)

### Ending Your Session

```bash
supabase stop
```

---

## 5. Creating & Managing Migrations

We use **Migrations** to version control our database schema. Never make schema changes manually in production!

### 5.1 Approach A: Studio-First (Recommended for Exploration)

1.  Open **Supabase Studio** ([http://127.0.0.1:54323](http://127.0.0.1:54323)).
2.  Make changes using the UI (Create tables, add columns, etc.).
3.  Generate a migration file from your changes:
    ```bash
    supabase db diff -f descriptive_name_of_change
    ```
    _Example:_ `supabase db diff -f add_user_preferences`
4.  **Review the generated SQL file** in `supabase/migrations/`.
5.  Test the migration by resetting:
    ```bash
    supabase db reset
    ```

### 5.2 Approach B: Migration-First (Recommended for Complex Logic)

1.  Create an empty migration file:
    ```bash
    supabase migration new descriptive_name_of_change
    ```
2.  Edit the generated file in `supabase/migrations/` and write your SQL.
3.  Apply the migration:
    ```bash
    supabase db reset
    ```

### 5.3 Migration Naming Conventions

- **Prefix:** Timestamp (Auto-generated)
- **Name:** `verb_noun` pattern.
- **Good:** `add_profiles_table`, `alter_events_add_status`, `create_update_timestamp_function`
- **Bad:** `update_db`, `fix`, `migration_1`

### 5.4 Testing Migrations Locally

Always ensure your migration applies cleanly:

```bash
supabase db reset
bun run test
```

---

## 6. Database Branching Strategies

We follow a **Feature Branch Workflow** for database changes.

### 6.1 Feature Branch Workflow

1.  Create a feature branch: `git checkout -b feature/my-feature`
2.  Make schema changes and generate a migration (`supabase db diff`).
3.  Test locally (`supabase db reset`).
4.  Generate types (`bun run db:gen:types`).
5.  Commit the migration file AND type definitions:
    ```bash
    git add supabase/migrations/ src/lib/supabase/db.types.ts
    git commit -m "feat: add user profiles table"
    ```

### 6.2 Handling Conflicts (Multiple Developers)

If two developers create migrations at the same time:

1.  Supabase runs migrations in **Timestamp Order**.
2.  When you merge `main`, you will get your teammate's migration.
3.  Run `supabase db reset` to apply both.
4.  If they conflict (e.g., both added the same table), you must resolve it by creating a **Fix Migration**:
    ```sql
    -- 20260113_fix_conflict.sql
    ALTER TABLE users DROP COLUMN duplicate_column;
    ```

---

## 7. Syncing with Production

Periodically, you need to sync your local environment with production to ensure you aren't drifting.

### 7.1 Pull Latest Production Schema

Use this when you suspect someone pushed changes to production that aren't in your local migrations.

```bash
supabase db pull
supabase db reset
```

### 7.2 Detecting Schema Drift

Check if your local database differs from production:

```bash
supabase db diff
```

---

## 8. Type Generation

We use TypeScript to ensure type safety between our database and application code.

### 8.1 Generating Types from LOCAL Schema

Run this **after every migration** during development.

```bash
supabase gen types typescript --local > src/lib/supabase/db.types.ts
```
*Output:* `src/lib/supabase/db.types.ts`


### 8.2 Generating Types from PRODUCTION
Run this **before deploying** or in CI/CD to ensure types match the live database.
```bash
supabase gen types typescript --project-id rpdourwztdpwdebggkkc > src/lib/supabase/db.types.ts
````

---

## 9. Production Deployment

**⚠️ WARNING: Pushing migrations is irreversible.**

### 9.1 Pre-Deployment Checklist

- [ ] Migration runs successfully locally (`supabase db reset`)
- [ ] Full test suite passes (`bun run test`)
- [ ] Backup created (if the migration is risky - see Section 10)
- [ ] Types are generated and committed

### 9.2 Pushing to Production

```bash
supabase db push
```

This applies all pending local migrations to the remote production database.

### 9.3 Post-Deployment

- Monitor application logs.
- Verify changes in the Production Studio dashboard.
- Update types from production: `bun run gen:types`

---

## 10. Backup & Recovery Procedures

Since we manage our own database lifecycle, backups are critical for "Risky" migrations.

### 10.1 What is a "Risky" Migration?

- Dropping a table or column (`DROP`)
- Changing a column's data type (e.g., `TEXT` -> `INT`)
- Removing constraints or indexes
- Modifying critical RLS policies

### 10.2 Creating a Manual Backup

**Before pushing a risky migration:**

1.  **Via Dashboard (Current Hosted):**
    - Go to Supabase Dashboard -> Database -> Backups.
    - Click **Create backup**.
    - Wait for it to complete.

2.  **Via CLI (For Future Self-Hosted):**
    ```bash
    pg_dump --clean --if-exists --create \
      --dbname=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres \
      > backup-$(date +%Y%m%d-%H%M%S).sql
    ```

### 10.3 Restoring from Backup

**If a migration corrupts production data:**

1.  **Stop all traffic:** Put the site in maintenance mode if possible.
2.  **Via Dashboard:**
    - Go to Database -> Backups.
    - Select the backup created before the migration.
    - Click **Restore**.
3.  **Verify:** Check that data is restored and application is functional.

---

## 11. Post-Migration Validation

After pushing to production, verify the health of the system:

1.  **Schema Check:** Open Production Studio and verify new tables/columns exist.
2.  **Application Check:** Test the specific feature that relies on the migration.
3.  **Logs:** Check Supabase Dashboard -> Reports -> API for any 500 errors.
4.  **RLS Validation:** Ensure users cannot access data they shouldn't.

---

## 12. Migration Squashing & Consolidation

As the project grows, we may accumulate hundreds of migration files. Squashing consolidates them.

**When to Squash:** After a major release or when migration files > 50.

**Process:**

1.  **Backup** production database.
2.  Dump the current full schema:
    ```bash
    supabase db dump > full_schema.sql
    ```
3.  Delete old migration files in `supabase/migrations/`.
4.  Create a new single migration file and paste the content of `full_schema.sql` into it.
5.  **Test Locally:** Run `supabase db reset` to ensure the squashed migration works.
6.  **Commit:** `git commit -m "chore: squash migrations"`

---

## 13. Special Features

### 13.1 Row Level Security (RLS)

Always enable RLS on tables containing user data.

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON events FOR SELECT
USING (true);
```

### 13.2 Storage Policies

Storage buckets also need policies via SQL migrations.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are public"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );
```

### 13.3 Realtime

To enable realtime subscriptions for a table:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

---

## 14. Branch Switching Workflow

When switching git branches, your local database schema might not match the code.

**Workflow:**

1.  `git checkout feature-branch`
2.  `supabase db reset` (Resets DB, runs migrations from this branch, seeds data)
3.  `bun run dev`

_Note: `db:reset` destroys local data. Ensure your `seed.sql` provides enough test data._

---

## 15. Docker Compose Integration

The project is configured to allow the Next.js app (running in Docker or locally) to communicate with the Supabase stack.

### Running Full Stack

```bash
# Option A: Local Next.js + Docker Supabase (Recommended)
supabase start
bun run dev

# Option B: All Docker
supabase start
bun run docker:dev
```

### Networking

- **Config:** `docker-compose.yaml` uses `extra_hosts: "host.docker.internal:host-gateway"` to allow containers to talk to the host.
- **Env Vars:** `.env.local` should point to `http://127.0.0.1:54321`.

---

## 16. Available NPM Scripts Reference

| Script         | Command                         | Purpose                         |
| :------------- | :------------------------------ | :------------------------------ |
| `db:gen:types` | `supabase gen types... --local` | Generate TS types from LOCAL DB |
| `gen:types`    | `bunx supabase gen types...`    | Generate TS types from PROD DB  |
| `test:local`   | `supabase start && vitest`      | Start Supabase & run tests      |
| `test:local:ui`| `supabase start && vitest --ui` | Start Supabase & run tests with UI|
| `test:all`     | `vitest run`     | Run all tests      |

For database operations, we use the `supabase` CLI directly:

| Command             | Purpose                             |
| :------------------ | :---------------------------------- |
| `supabase start`    | Start local Supabase stack          |
| `supabase stop`     | Stop local services                 |
| `supabase status`   | Show service URLs and keys          |
| `supabase db reset` | Wipe DB, apply migrations, run seed |

---

## 17. Best Practices & Safety Checklists

### Migration Safety Checklist

- [ ] **Is it destructive?** (Drop table/column) -> **Backup first!**
- [ ] **Does it lock the table?** (Index creation on large tables) -> **Schedule downtime.**
- [ ] **Is it idempotent?** (Can it run twice without failing?) -> Use `CREATE OR REPLACE` or `IF NOT EXISTS`.
- [ ] **Did you update types?** -> Run `bun run db:gen:types`.

### General Rules

1.  **Never** edit migration files that have already been pushed to production.
2.  **Always** write a "Down" migration (rollback SQL) if possible, even if just in comments.
3.  **One feature = One migration file.** Keep them atomic.
4.  **Test RLS policies** immediately after creating them.

---

## 18. Troubleshooting

### Port Conflicts

**Error:** `Port 54321 is already in use`
**Fix:**

```bash
lsof -ti:54321 | xargs kill -9
supabase start
```

### Migration Fails

**Error:** `relation "users" does not exist`
**Fix:** Check your migration order. Ensure you aren't referencing a table created in a _later_ migration.

### Next.js Can't Connect

**Error:** `ECONNREFUSED 127.0.0.1:54321`
**Fix:**

1.  Run `supabase status` to confirm Supabase is running.
2.  Check `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL`.

### Schema Drift

**Error:** Local DB behaves differently than Production.
**Fix:**

```bash
supabase db pull  # Get prod schema
supabase db reset  # Apply to local
```

---

## 19. Future: Self-Hosting Transition

When transitioning to a self-hosted instance, the following workflows will change:

1.  **Connection:** You will no longer use `supabase link`. Commands will require `--db-url`.
    ```bash
    supabase db push --db-url postgresql://user:pass@host:5432/db
    ```
2.  **Backups:** You must configure `pg_dump` cron jobs manually.
3.  **Type Gen:**
    ```bash
    supabase gen types typescript --db-url <URL> > src/lib/supabase/db.types.ts
    ```
4.  **Infrastructure:** You will need to manage the Docker containers for Kong, GoTrue, PostgREST, etc., yourself using a production `docker-compose.yaml`.

_Detailed instructions will be added here upon transition._

---

## 20. Document Changelog

| Date       | Author | Description                          |
| :--------- | :----- | :----------------------------------- |
| 2026-01-13 | Team   | Initial comprehensive guide created. |
