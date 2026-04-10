CREATE OR REPLACE FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text DEFAULT NULL,
  "p_icon" text DEFAULT NULL,
  "p_image_url" text DEFAULT NULL,
  "p_card_placement" integer DEFAULT NULL,
  "p_is_active" boolean DEFAULT true
) RETURNS "public"."WebsiteContent"
    LANGUAGE "plpgsql" SECURITY DEFINER
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
    "cardPlacement",
    "isActive"
  ) VALUES (
    p_section,
    p_entry_key,
    p_text_type,
    p_text_value,
    p_icon,
    p_image_url,
    v_card_placement,
    p_is_active
  )
  ON CONFLICT ("section", "entryKey", "textType") DO UPDATE
  SET
    "textValue" = EXCLUDED."textValue",
    "icon" = EXCLUDED."icon",
    "imageUrl" = EXCLUDED."imageUrl",
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
  "p_card_placement" integer,
  "p_is_active" boolean
) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text,
  "p_icon" text,
  "p_image_url" text,
  "p_card_placement" integer,
  "p_is_active" boolean
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."upsert_website_content"(
  "p_section" "public"."WebsiteContentSection",
  "p_entry_key" text,
  "p_text_type" "public"."WebsiteContentTextType",
  "p_text_value" text,
  "p_icon" text,
  "p_image_url" text,
  "p_card_placement" integer,
  "p_is_active" boolean
) TO "service_role";
