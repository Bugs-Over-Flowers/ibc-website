set check_function_bodies = off;

-- This migration can execute before the schema snapshot that creates "public"."Event".
-- Keep it safe and idempotent for local `supabase db reset` runs.
DO $$
BEGIN
  IF to_regclass('public."Event"') IS NOT NULL THEN
    ALTER TABLE "public"."Event"
      ADD COLUMN IF NOT EXISTS "eventPoster" text;
  END IF;
END
$$;
