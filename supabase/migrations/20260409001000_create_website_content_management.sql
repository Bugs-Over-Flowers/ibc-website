CREATE TYPE "public"."WebsiteContentSection" AS ENUM (
  'vision_mission',
  'goals',
  'company_thrusts',
  'board_of_trustees',
  'secretariat',
  'landing_page_benefits'
);

CREATE TYPE "public"."WebsiteContentTextType" AS ENUM (
  'Paragraph',
  'Title',
  'Subtitle'
);

CREATE TABLE "public"."WebsiteContent" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "section" "public"."WebsiteContentSection" NOT NULL,
  "entryKey" text NOT NULL,
  "textType" "public"."WebsiteContentTextType" NOT NULL,
  "textValue" text,
  "icon" text,
  "imageUrl" text,
  "cardPlacement" integer,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "WebsiteContent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WebsiteContent_cardPlacement_nonnegative" CHECK (("cardPlacement" IS NULL OR "cardPlacement" >= 1)),
  CONSTRAINT "WebsiteContent_content_present" CHECK (("textValue" IS NOT NULL OR "icon" IS NOT NULL OR "imageUrl" IS NOT NULL))
);

CREATE UNIQUE INDEX "WebsiteContent_section_entry_key_text_type_key"
  ON "public"."WebsiteContent" ("section", "entryKey", "textType");

CREATE INDEX "WebsiteContent_section_card_placement_idx"
  ON "public"."WebsiteContent" ("section", "cardPlacement")
  WHERE "isActive" = true;

CREATE INDEX "WebsiteContent_is_active_idx"
  ON "public"."WebsiteContent" ("isActive");

CREATE OR REPLACE FUNCTION "public"."update_website_content_updated_at"()
RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER "set_website_content_updated_at"
  BEFORE UPDATE ON "public"."WebsiteContent"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_website_content_updated_at"();

ALTER TABLE "public"."WebsiteContent" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Website content is readable by everyone"
  ON "public"."WebsiteContent"
  FOR SELECT
  TO "anon", "authenticated"
  USING ("isActive" = true);

-- TODO: Replace this with a strict admin check policy if/when admin claims are available.
CREATE POLICY "Website content is writable by authenticated users"
  ON "public"."WebsiteContent"
  FOR ALL
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE "public"."WebsiteContent" TO "service_role";
GRANT ALL ON TABLE "public"."WebsiteContent" TO "authenticated";
GRANT SELECT ON TABLE "public"."WebsiteContent" TO "anon";
