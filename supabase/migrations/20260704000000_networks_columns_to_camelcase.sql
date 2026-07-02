-- Rename Networks table columns snake_case -> camelCase to match
-- the current production database. The trigger function
-- update_updated_at_column() was already updated in
-- 20260513000000_fix_networks_trigger.sql to use "updatedAt" (which
-- would fail locally until this migration applies).
--
-- No indexes, RLS policies, or foreign keys reference these column
-- names directly. Triggers reference the function by OID and update
-- transparently. Grants are table-level. RLS policies are
-- command-based (not column-based).

ALTER TABLE "public"."Networks" RENAME COLUMN "location_type" TO "locationType";
ALTER TABLE "public"."Networks" RENAME COLUMN "representative_name" TO "representativeName";
ALTER TABLE "public"."Networks" RENAME COLUMN "representative_position" TO "representativePosition";
ALTER TABLE "public"."Networks" RENAME COLUMN "logo_url" TO "logoUrl";
ALTER TABLE "public"."Networks" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "public"."Networks" RENAME COLUMN "updated_at" TO "updatedAt";
