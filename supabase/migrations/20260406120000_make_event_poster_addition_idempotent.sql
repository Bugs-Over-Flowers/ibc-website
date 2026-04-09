set check_function_bodies = off;

-- Follow-up migration: keeps existing migration history immutable.
-- Safe for environments where Event may not exist yet during reset ordering.
DO $$
BEGIN
  IF to_regclass('public."Event"') IS NOT NULL THEN
    ALTER TABLE "public"."Event"
      ADD COLUMN IF NOT EXISTS "eventPoster" text;
  END IF;
END
$$;
