CREATE OR REPLACE FUNCTION "public"."update_website_content_updated_at"()
RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "set_website_content_updated_at" ON "public"."WebsiteContent";

CREATE TRIGGER "set_website_content_updated_at"
  BEFORE UPDATE ON "public"."WebsiteContent"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_website_content_updated_at"();
