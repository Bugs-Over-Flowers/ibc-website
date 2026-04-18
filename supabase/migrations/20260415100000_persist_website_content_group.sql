ALTER TABLE "public"."WebsiteContent"
ADD COLUMN IF NOT EXISTS "group" text;

-- Backfill legacy board rows so existing data keeps stable grouping after reload.
UPDATE "public"."WebsiteContent"
SET "group" = CASE
  WHEN LOWER(COALESCE("textValue", '')) LIKE '%trustee%' THEN 'trustees'
  WHEN COALESCE("cardPlacement", 0) BETWEEN 1 AND 2 THEN 'featured'
  WHEN COALESCE("cardPlacement", 0) BETWEEN 3 AND 7 THEN 'officers'
  WHEN COALESCE("cardPlacement", 0) >= 8 THEN 'trustees'
  ELSE 'other'
END
WHERE "section" = 'board_of_trustees'
  AND "group" IS NULL;

CREATE OR REPLACE FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text DEFAULT NULL,
  "p_icon" text DEFAULT NULL,
  "p_image_url" text DEFAULT NULL,
  "p_group" text DEFAULT NULL,
  "p_card_placement" integer DEFAULT NULL,
  "p_is_active" boolean DEFAULT true
) RETURNS "public"."WebsiteContent"
  LANGUAGE "plpgsql" SECURITY INVOKER
AS $$
DECLARE
  v_card_placement integer;
  v_row "public"."WebsiteContent";
BEGIN
  IF p_card_placement IS NULL
    AND p_section IN (
      'goals',
      'company_thrusts',
      'board_of_trustees',
      'secretariat',
      'landing_page_benefits'
    ) THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(p_section::text || ':' || p_text_type::text, 0)
    );

    SELECT COALESCE(MAX(wc."cardPlacement"), 0) + 1
    INTO v_card_placement
    FROM "public"."WebsiteContent" wc
    WHERE wc."section" = p_section
      AND wc."textType" = p_text_type;
  ELSE
    v_card_placement := p_card_placement;
  END IF;

  INSERT INTO "public"."WebsiteContent" (
    "section",
    "entryKey",
    "textType",
    "textValue",
    "icon",
    "imageUrl",
    "group",
    "cardPlacement",
    "isActive"
  ) VALUES (
    p_section,
    p_entry_key,
    p_text_type,
    p_text_value,
    p_icon,
    p_image_url,
    p_group,
    v_card_placement,
    p_is_active
  )
  ON CONFLICT ("section", "entryKey", "textType") DO UPDATE
  SET
    "textValue" = EXCLUDED."textValue",
    "icon" = EXCLUDED."icon",
    "imageUrl" = EXCLUDED."imageUrl",
    "group" = EXCLUDED."group",
    "cardPlacement" = EXCLUDED."cardPlacement",
    "isActive" = EXCLUDED."isActive"
  RETURNING *
  INTO v_row;

  RETURN v_row;
END;
$$;

ALTER FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text,
  "p_icon" text,
  "p_image_url" text,
  "p_group" text,
  "p_card_placement" integer,
  "p_is_active" boolean
) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text,
  "p_icon" text,
  "p_image_url" text,
  "p_group" text,
  "p_card_placement" integer,
  "p_is_active" boolean
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text,
  "p_icon" text,
  "p_image_url" text,
  "p_group" text,
  "p_card_placement" integer,
  "p_is_active" boolean
) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text,
  "p_icon" text,
  "p_image_url" text,
  "p_group" text,
  "p_card_placement" integer,
  "p_is_active" boolean
) TO "service_role";
