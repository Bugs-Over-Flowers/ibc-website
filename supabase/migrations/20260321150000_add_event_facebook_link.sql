-- Add eventPoster and facebookLink columns to Event
ALTER TABLE "public"."Event"
  ADD COLUMN IF NOT EXISTS "eventPoster" text,
  ADD COLUMN IF NOT EXISTS "facebookLink" text;

-- Allow finished events to update only the Facebook link and expose the new parameter
CREATE OR REPLACE FUNCTION "public"."update_event_details"(
  "p_event_id" "uuid",
  "p_title" "text" DEFAULT NULL::"text",
  "p_description" "text" DEFAULT NULL::"text",
  "p_event_header_url" "text" DEFAULT NULL::"text",
  "p_start_date" timestamp without time zone DEFAULT NULL::timestamp without time zone,
  "p_end_date" timestamp without time zone DEFAULT NULL::timestamp without time zone,
  "p_venue" "text" DEFAULT NULL::"text",
  "p_event_type" "text" DEFAULT NULL::"text",
  "p_registration_fee" real DEFAULT NULL::real,
  "p_facebook_link" "text" DEFAULT NULL::"text"
) RETURNS "jsonb"
    LANGUAGE "plpgsql"
AS $$
DECLARE
  v_existing_event "Event"%ROWTYPE;
  v_final_title text;
  v_final_description text;
  v_final_header_url text;
  v_final_start_date timestamp;
  v_final_end_date timestamp;
  v_final_venue text;
  v_final_event_type "EventType";
  v_final_registration_fee float4;
  v_final_facebook_link text;
  v_is_draft boolean;
  v_is_finished boolean;
BEGIN
  SELECT * INTO v_existing_event
  FROM "Event"
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id;
  END IF;

  v_is_draft := (v_existing_event."eventType" IS NULL);
  v_is_finished := (v_existing_event."eventEndDate" IS NOT NULL
                    AND CURRENT_TIMESTAMP > v_existing_event."eventEndDate");

  v_final_title := COALESCE(p_title, v_existing_event."eventTitle");
  v_final_description := COALESCE(p_description, v_existing_event."description");
  v_final_header_url := COALESCE(p_event_header_url, v_existing_event."eventHeaderUrl");
  v_final_start_date := COALESCE(p_start_date, v_existing_event."eventStartDate");
  v_final_end_date := COALESCE(p_end_date, v_existing_event."eventEndDate");
  v_final_venue := COALESCE(p_venue, v_existing_event."venue");
  v_final_registration_fee := COALESCE(p_registration_fee, v_existing_event."registrationFee");
  v_final_facebook_link := COALESCE(p_facebook_link, v_existing_event."facebookLink");

  IF p_event_type IS NULL THEN
    v_final_event_type := v_existing_event."eventType";
  ELSIF p_event_type = 'draft' THEN
    v_final_event_type := NULL;
  ELSE
    v_final_event_type := p_event_type::"EventType";
  END IF;

  IF v_is_draft THEN
    IF v_final_event_type IS NOT NULL THEN
      IF (v_final_title IS NULL OR v_final_title = '') OR
         (v_final_description IS NULL OR v_final_description = '') OR
         (v_final_start_date IS NULL) OR
         (v_final_end_date IS NULL) OR
         (v_final_venue IS NULL OR v_final_venue = '') THEN
        RAISE EXCEPTION 'Publish Failed: Event Title, Description, Start Date, End Date, and Venue must all be populated.';
      END IF;
    END IF;

  ELSIF v_is_finished THEN
    IF p_title IS NOT NULL AND p_title IS DISTINCT FROM v_existing_event."eventTitle" THEN
      RAISE EXCEPTION 'Cannot edit Event Title for finished events.';
    END IF;
    IF p_description IS NOT NULL AND p_description IS DISTINCT FROM v_existing_event."description" THEN
      RAISE EXCEPTION 'Cannot edit Description for finished events.';
    END IF;
    IF p_start_date IS NOT NULL AND p_start_date IS DISTINCT FROM v_existing_event."eventStartDate" THEN
      RAISE EXCEPTION 'Cannot edit Start Date for finished events.';
    END IF;
    IF p_end_date IS NOT NULL AND p_end_date IS DISTINCT FROM v_existing_event."eventEndDate" THEN
      RAISE EXCEPTION 'Cannot edit End Date for finished events.';
    END IF;
    IF p_venue IS NOT NULL AND p_venue IS DISTINCT FROM v_existing_event."venue" THEN
      RAISE EXCEPTION 'Cannot edit Venue for finished events.';
    END IF;
    IF p_event_type IS NOT NULL AND p_event_type::"EventType" IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot edit Event Type for finished events.';
    END IF;
    IF p_registration_fee IS NOT NULL AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for finished events.';
    END IF;

    IF p_facebook_link IS NULL AND v_existing_event."facebookLink" IS NULL THEN
      RAISE EXCEPTION 'Finished events can only update the Facebook link.';
    END IF;

    v_final_title := v_existing_event."eventTitle";
    v_final_description := v_existing_event."description";
    v_final_header_url := v_existing_event."eventHeaderUrl";
    v_final_start_date := v_existing_event."eventStartDate";
    v_final_end_date := v_existing_event."eventEndDate";
    v_final_venue := v_existing_event."venue";
    v_final_event_type := v_existing_event."eventType";
    v_final_registration_fee := v_existing_event."registrationFee";
    v_final_facebook_link := p_facebook_link;

  ELSE
    IF p_registration_fee IS NOT NULL AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for published events.';
    END IF;

    IF v_final_event_type IS DISTINCT FROM v_existing_event."eventType" THEN
       RAISE EXCEPTION 'Cannot change Event Type for published events. Once published, the type is locked.';
    END IF;

    v_final_registration_fee := v_existing_event."registrationFee";
    v_final_event_type := v_existing_event."eventType";
  END IF;

  UPDATE "Event"
  SET
    "eventTitle" = v_final_title,
    "description" = v_final_description,
    "eventHeaderUrl" = v_final_header_url,
    "eventStartDate" = v_final_start_date,
    "eventEndDate" = v_final_end_date,
    "venue" = v_final_venue,
    "eventType" = v_final_event_type,
    "registrationFee" = v_final_registration_fee,
    "facebookLink" = v_final_facebook_link,
    "updatedAt" = NOW(),
    "publishedAt" = CASE
      WHEN v_is_draft AND v_final_event_type IS NOT NULL THEN NOW()
      ELSE "publishedAt"
    END
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event update failed. The event may have been deleted or you do not have permission to update it.';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'eventId', p_event_id,
    'eventType', COALESCE(v_final_event_type::text, 'draft'),
    'message', 'Event updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'eventId', p_event_id,
      'error', SQLERRM
    );
END;
$$;

ALTER FUNCTION "public"."update_event_details"(
  "p_event_id" "uuid",
  "p_title" "text",
  "p_description" "text",
  "p_event_header_url" "text",
  "p_start_date" timestamp without time zone,
  "p_end_date" timestamp without time zone,
  "p_venue" "text",
  "p_event_type" "text",
  "p_registration_fee" real,
  "p_facebook_link" "text"
) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."update_event_details"(
  "p_event_id" "uuid",
  "p_title" "text",
  "p_description" "text",
  "p_event_header_url" "text",
  "p_start_date" timestamp without time zone,
  "p_end_date" timestamp without time zone,
  "p_venue" "text",
  "p_event_type" "text",
  "p_registration_fee" real,
  "p_facebook_link" "text"
) TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_details"(
  "p_event_id" "uuid",
  "p_title" "text",
  "p_description" "text",
  "p_event_header_url" "text",
  "p_start_date" timestamp without time zone,
  "p_end_date" timestamp without time zone,
  "p_venue" "text",
  "p_event_type" "text",
  "p_registration_fee" real,
  "p_facebook_link" "text"
) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_details"(
  "p_event_id" "uuid",
  "p_title" "text",
  "p_description" "text",
  "p_event_header_url" "text",
  "p_start_date" timestamp without time zone,
  "p_end_date" timestamp without time zone,
  "p_venue" "text",
  "p_event_type" "text",
  "p_registration_fee" real,
  "p_facebook_link" "text"
) TO "service_role";
