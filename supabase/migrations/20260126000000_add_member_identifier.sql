-- Migration: Add human-readable identifier to BusinessMember table
-- Format: ibc-mem-XXXXXXXX (first 8 chars of UUID without dashes)

-- 1. Add identifier column to BusinessMember table
ALTER TABLE "BusinessMember" 
ADD COLUMN IF NOT EXISTS "identifier" text UNIQUE;

-- 2. Populate existing members with identifiers
UPDATE "BusinessMember"
SET "identifier" = 'ibc-mem-' || left(replace("businessMemberId"::text, '-', ''), 8)
WHERE "identifier" IS NULL;

-- 3. Make identifier NOT NULL after populating existing records
ALTER TABLE "BusinessMember"
ALTER COLUMN "identifier" SET NOT NULL;

-- 4. Create trigger function to auto-generate identifier for new members
CREATE OR REPLACE FUNCTION generate_member_identifier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."identifier" IS NULL THEN
    NEW."identifier" := 'ibc-mem-' || left(replace(NEW."businessMemberId"::text, '-', ''), 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger (drop first if exists to allow re-running)
DROP TRIGGER IF EXISTS set_member_identifier ON "BusinessMember";
CREATE TRIGGER set_member_identifier
  BEFORE INSERT ON "BusinessMember"
  FOR EACH ROW
  EXECUTE FUNCTION generate_member_identifier();

-- 6. Add comments for documentation
COMMENT ON COLUMN "BusinessMember"."identifier" IS 
'Human-readable member identifier in format ibc-mem-XXXXXXXX (first 8 chars of UUID without dashes). Auto-generated on insert.';

COMMENT ON FUNCTION generate_member_identifier() IS 
'Trigger function that auto-generates a human-readable identifier for new BusinessMember records.';
