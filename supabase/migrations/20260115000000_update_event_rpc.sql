-- Migration to update update_event_details RPC to include maxGuest

-- 1. Ensure the column exists (just in case it's missing from the table)
ALTER TABLE "public"."Event" ADD COLUMN IF NOT EXISTS "maxGuest" integer DEFAULT 0;

-- 2. Drop the old function (signature mismatch requires drop before replace if arguments change significantly in a way that creates ambiguity or if we want to ensure clean state)
DROP FUNCTION IF EXISTS "public"."update_event_details"(uuid, text, text, text, date, date, text, text, numeric);

-- 3. Create the new function with p_maxGuest
CREATE OR REPLACE FUNCTION "public"."update_event_details"(
    p_event_id uuid,
    p_title text,
    p_description text,
    p_event_header_url text,
    p_start_date date,
    p_end_date date,
    p_venue text,
    p_maxGuest integer, -- New parameter
    p_event_type text,
    p_registration_fee numeric
) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_existing_event "Event"%ROWTYPE; 
  
  v_final_title text;
  v_final_description text;
  v_final_start_date date;
  v_final_end_date date;
  v_final_venue text;
  v_final_max_guest integer; -- New variable
  
  v_new_status "EventType";
  v_is_finished boolean;
BEGIN

  -- 1. Fetch ALL columns
  SELECT * INTO v_existing_event 
  FROM "Event" 
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id;
  END IF;

  -- 2. Calculate "Effective" Values
  v_final_title       := COALESCE(p_title, v_existing_event."eventTitle");
  v_final_description := COALESCE(p_description, v_existing_event."description");
  v_final_start_date  := COALESCE(p_start_date, v_existing_event."eventStartDate");
  v_final_end_date    := COALESCE(p_end_date, v_existing_event."eventEndDate");
  v_final_venue       := COALESCE(p_venue, v_existing_event."venue");
  v_final_max_guest   := COALESCE(p_maxGuest, v_existing_event."maxGuest"); -- New logic
  
  -- Determine Status
  v_new_status   := (COALESCE(p_event_type, v_existing_event."eventType"::text))::"EventType";
  
  -- Determine if Finished
  v_is_finished := (v_final_end_date IS NOT NULL AND CURRENT_DATE > v_final_end_date);


  -- 3. VALIDATION LOGIC

  -- SCENARIO A: DRAFT EVENTS
  IF v_existing_event."eventType" = 'draft' THEN
    
    IF v_new_status IN ('public', 'private') THEN
      
      IF (v_final_title IS NULL OR v_final_title = '') OR
         (v_final_description IS NULL OR v_final_description = '') OR
         (v_final_start_date IS NULL) OR
         (v_final_end_date IS NULL) OR
         (v_final_venue IS NULL OR v_final_venue = '') THEN
         
        RAISE EXCEPTION 'Publish Failed: Event Title, Description, Dates, and Venue must all be populated.';
      END IF;
      
    END IF;

  -- SCENARIO B: FINISHED EVENTS
  ELSIF v_is_finished THEN
    
    IF p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for finished events.';
    END IF;

    IF v_new_status IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot change Event Type for finished events.';
    END IF;

    IF p_start_date IS DISTINCT FROM v_existing_event."eventStartDate" OR 
       p_end_date IS DISTINCT FROM v_existing_event."eventEndDate" THEN
      RAISE EXCEPTION 'Cannot edit Dates for finished events.';
    END IF;

    IF p_venue IS DISTINCT FROM v_existing_event."venue" THEN
      RAISE EXCEPTION 'Cannot edit Venue for finished events.';
    END IF;

    -- Optional: Block maxGuest changes for finished events
    IF p_maxGuest IS DISTINCT FROM v_existing_event."maxGuest" THEN
      RAISE EXCEPTION 'Cannot edit Max Guest for finished events.';
    END IF;

  -- SCENARIO C: PUBLISHED EVENTS
  ELSIF v_existing_event."eventType" IN ('public', 'private') THEN
    
    IF p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for published events.';
    END IF;

    IF v_new_status IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot change Event Type for published events.';
    END IF;

  END IF;

  -- 4. PERFORM UPDATE
  UPDATE "Event" 
  SET 
    "eventTitle"      = v_final_title,
    "description"     = v_final_description,
    "eventHeaderUrl"  = COALESCE(p_event_header_url, "eventHeaderUrl"),
    "eventStartDate"  = v_final_start_date,
    "eventEndDate"    = v_final_end_date,
    "venue"           = v_final_venue,
    "eventType"       = v_new_status,
    "registrationFee" = COALESCE(p_registration_fee, "registrationFee"),
    "maxGuest"        = v_final_max_guest
  WHERE "eventId" = p_event_id;

  -- 5. Return Response
  RETURN jsonb_build_object(
    'eventId', p_event_id,
    'status', v_new_status,
    'message', 'Event updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Event update failed: %', SQLERRM;
END;$$;

ALTER FUNCTION "public"."update_event_details"(uuid, text, text, text, date, date, text, integer, text, numeric) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."update_event_details"(uuid, text, text, text, date, date, text, integer, text, numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_details"(uuid, text, text, text, date, date, text, integer, text, numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_details"(uuid, text, text, text, date, date, text, integer, text, numeric) TO "service_role";
