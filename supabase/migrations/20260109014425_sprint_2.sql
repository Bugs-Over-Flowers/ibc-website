


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."ApplicationMemberType" AS ENUM (
    'corporate',
    'personal'
);


ALTER TYPE "public"."ApplicationMemberType" OWNER TO "postgres";


CREATE TYPE "public"."ApplicationType" AS ENUM (
    'newMember',
    'updating',
    'renewal'
);


ALTER TYPE "public"."ApplicationType" OWNER TO "postgres";


CREATE TYPE "public"."EventType" AS ENUM (
    'public',
    'private'
);


ALTER TYPE "public"."EventType" OWNER TO "postgres";


CREATE TYPE "public"."PaymentMethod" AS ENUM (
    'BPI',
    'ONSITE'
);


ALTER TYPE "public"."PaymentMethod" OWNER TO "postgres";


CREATE TYPE "public"."PaymentStatus" AS ENUM (
    'pending',
    'verified'
);


ALTER TYPE "public"."PaymentStatus" OWNER TO "postgres";


CREATE TYPE "public"."participant_list_item" AS (
	"participant_id" "uuid",
	"first_name" "text",
	"last_name" "text",
	"email" "text",
	"contact_number" "text",
	"affiliation" "text",
	"payment_status" "public"."PaymentStatus",
	"registration_date" timestamp without time zone,
	"registration_id" "uuid"
);


ALTER TYPE "public"."participant_list_item" OWNER TO "postgres";


CREATE TYPE "public"."registration_list_item" AS (
	"event_id" "uuid",
	"registration_id" "uuid",
	"affiliation" "text",
	"registration_date" timestamp without time zone,
	"payment_status" "text",
	"payment_method" "text",
	"payment_image_path" "text",
	"business_member_id" "uuid",
	"business_name" "text",
	"is_member" boolean,
	"registrant" "jsonb"
);


ALTER TYPE "public"."registration_list_item" OWNER TO "postgres";


CREATE TYPE "public"."registration_stats" AS (
	"total" integer,
	"verified" integer,
	"pending" integer
);


ALTER TYPE "public"."registration_stats" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text", "p_payment_status" "public"."PaymentStatus" DEFAULT NULL::"public"."PaymentStatus") RETURNS SETOF "public"."participant_list_item"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN

    -- 1. Set the fuzzy search threshold for this execution
  PERFORM set_limit(0.3);

  RETURN QUERY
  SELECT
    p."participantId",
    p."firstName",
    p."lastName",
    p."email",
    p."contactNumber",
    -- COALESCE determines the company name: 
    -- It prioritizes the linked Business Member name; if null, falls back to nonMemberName
    COALESCE(bm."businessName", r."nonMemberName") AS "affiliation",
    r."paymentStatus",
    r."registrationDate",
    r."registrationId"
  FROM
    "Participant" p
  
  -- Select the registration
  JOIN
    "Registration" r ON p."registrationId" = r."registrationId"

  -- Check the affiliation
  LEFT JOIN
    "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"

  -- Filter the event that is needed
  WHERE
    r."eventId" = p_event_id
    -- 1. Filter by Payment Status (if provided)
    AND (p_payment_status IS NULL OR r."paymentStatus" = p_payment_status)
    -- 2. Filter by Search Text (if provided) across Name, Email, or Company
    AND (
      -- return everything if no search text or empty
      p_search_text IS NULL
      OR p_search_text = '' 

      -- filter by data: firstname, lastname, email, or affiliation
      OR p."firstName" % p_search_text
      OR p."lastName" % p_search_text
      OR (p."firstName" || ' ' || p."lastName") % p_search_text
      OR p.email % p_search_text 
      OR COALESCE(bm."businessName", r."nonMemberName") % p_search_text 
    )

    ORDER BY
    -- Sort Logic: If searching, put most relevant matches at the top.
    -- If not searching, this block returns 0 and has no effect.
    CASE 
      WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN 
        GREATEST(
          similarity(p."firstName", p_search_text),
          similarity(p."lastName", p_search_text),
          similarity(p."firstName" || ' ' || p."lastName", p_search_text),
          similarity(p."email", p_search_text),
          similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text)
        )
      ELSE 0 
    END DESC,
    -- Secondary Sort: Date (Newest first)
    r."registrationDate" DESC;
END;
$$;


ALTER FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text", "p_payment_status" "public"."PaymentStatus" DEFAULT NULL::"public"."PaymentStatus") RETURNS SETOF "public"."registration_list_item"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    -- 1. Set the fuzzy search threshold for this execution
    PERFORM set_limit(0.3);

    RETURN QUERY
    SELECT 
        p_event_id,
        r."registrationId",
        COALESCE(bm."businessName", r."nonMemberName") AS affiliation, 
        r."registrationDate",
        r."paymentStatus"::TEXT,
        r."paymentMethod"::TEXT,
        CASE 
            WHEN r."paymentMethod" = 'BPI' THEN pi.path 
            ELSE NULL 
        END AS payment_image_path,
        bm."businessMemberId",
        bm."businessName",
        (bm."businessMemberId" IS NOT NULL) AS is_member,
        CASE 
            WHEN p."participantId" IS NOT NULL THEN
                jsonb_build_object(
                    'participantId', p."participantId",
                    'firstName', p."firstName",
                    'lastName', p."lastName",
                    'contactNumber', p."contactNumber",
                    'email', p.email,
                    'isPrincipal', p."isPrincipal"
                )
            ELSE NULL 
        END AS registrant

    FROM "Registration" r
    LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
    
    -- Join Proof Image
    LEFT JOIN LATERAL (
        SELECT path 
        FROM "ProofImage" img 
        WHERE img."registrationId" = r."registrationId"
        LIMIT 1
    ) pi ON true

    -- Join Principal Participant
    LEFT JOIN LATERAL (
        SELECT *
        FROM "Participant" part
        WHERE part."registrationId" = r."registrationId"
          AND part."isPrincipal" = true
        LIMIT 1
    ) p ON true

    WHERE r."eventId" = p_event_id
      -- Ensure affiliation exists
      AND COALESCE(bm."businessName", r."nonMemberName") IS NOT NULL

      -- *** Filter By Status Logic ***
      AND (
        p_payment_status IS null
        OR
        r."paymentStatus" = p_payment_status::"PaymentStatus"
      )
      
      -- *** SEARCH LOGIC HERE ***
      AND (
          p_search_text IS NULL   -- If no search term, return everything
          OR 
          -- Matches either Business Name OR Non-Member Name
          (
            -- Affiliation
            COALESCE(bm."businessName", r."nonMemberName") % p_search_text
            -- Check Participant Details
            OR p."firstName" % p_search_text
            OR p."lastName" % p_search_text
            OR p.email % p_search_text
          )
      )
      
    -- *** SORTING LOGIC ***
    ORDER BY
        -- If searching, sort by similarity score (best match first)
        CASE WHEN p_search_text IS NOT NULL THEN
        GREATEST(
            similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text),
            similarity(p."firstName" || ' ' || p."lastName", p_search_text)
        )
        ELSE 0 END DESC,
        -- Secondary sort by date (newest first)
        r."registrationDate" DESC;
END;
$$;


ALTER FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_registration_stats"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text", "p_payment_status" "public"."PaymentStatus" DEFAULT NULL::"public"."PaymentStatus") RETURNS "public"."registration_stats"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_result registration_stats;
BEGIN
    -- 1. Set the threshold for this specific function execution
    -- "PERFORM" is used to run a function that returns void or when we ignore the return
    PERFORM set_limit(0.3);
    
    -- 2. Run the query
    SELECT 
        COUNT(*)::INTEGER AS total,
        COUNT(*) FILTER (WHERE r."paymentStatus" = 'verified')::INTEGER AS verified,
        COUNT(*) FILTER (WHERE r."paymentStatus" = 'pending')::INTEGER AS pending
    INTO v_result
    FROM "Registration" r

    -- Left Join Business Member
    LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
    WHERE r."eventId" = p_event_id

     AND (
        p_payment_status IS null
        OR
        r."paymentStatus" = p_payment_status::"PaymentStatus"
      )
      AND (
          -- IF p_affiliation IS NULL, this block is skipped (TRUE)
          p_search_text IS NULL 
          OR 
          -- OTHERWISE, we check the fuzzy match
          bm."businessName" % p_search_text OR
          r."nonMemberName" % p_search_text OR
          EXISTS (
            SELECT 1 FROM "Participant" p
            WHERE p."registrationId" = r."registrationId"
            AND p."isPrincipal" = true
            AND (
              p."firstName" % p_search_text
              OR p."lastName" % p_search_text
              OR p.email % p_search_text
            )
          )
      );
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_registration_stats"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_business_member_id" "uuid" DEFAULT NULL::"uuid", "p_non_member_name" "text" DEFAULT NULL::"text", "p_payment_method" "text" DEFAULT 'onsite'::"text", "p_payment_path" "text" DEFAULT NULL::"text", "p_registrant" "jsonb" DEFAULT '{}'::"jsonb", "p_other_participants" "jsonb" DEFAULT '[]'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_registration_id UUID;
  v_event_title TEXT;
  v_payment_status "PaymentStatus";
  v_participant_ids UUID[];
  v_payment_method_enum "PaymentMethod";
BEGIN

  -- Convert and cast the payment method
  v_payment_method_enum := (CASE 
    WHEN p_payment_method = 'online' THEN 'BPI' 
    ELSE 'ONSITE' 
  END)::"PaymentMethod";

  -- Determine payment status
  v_payment_status := (CASE 
    WHEN p_payment_method = 'online' THEN 'pending'
    ELSE 'verified'
  END)::"PaymentStatus";

  -- Insert registration record
  INSERT INTO "Registration" (
    "eventId",
    "paymentMethod",
    "paymentStatus",
    "businessMemberId",
    "nonMemberName",
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

  -- Get event title for response
  SELECT "eventTitle" INTO v_event_title
  FROM "Event"
  WHERE "eventId" = p_event_id;

  -- Handle proof of payment if online payment
  IF p_payment_method = 'online' THEN
    INSERT INTO "ProofImage" (path, "registrationId")
    VALUES (p_payment_path, v_registration_id);
  END IF;

  -- Insert principal registrant
  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email
  )
  VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email'
  );

  -- Insert other registrants if any exist
  IF jsonb_array_length(p_other_participants) > 0 THEN
    INSERT INTO "Participant" (
      "registrationId",
      "isPrincipal",
      "firstName",
      "lastName",
      "contactNumber",
      email
    )
    SELECT
      v_registration_id,
      FALSE,
      registrant->>'firstName',
      registrant->>'lastName',
      registrant->>'contactNumber',
      registrant->>'email'
    FROM jsonb_array_elements(p_other_participants) AS registrant;
  END IF;

  -- Return success response with data
  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, the transaction auto-rolls back
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_payment_proof_url" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_application_id uuid;
  v_app_type_enum "ApplicationType";
  v_pay_method_enum "PaymentMethod";
  v_pay_status_enum "PaymentStatus";
  v_sector_id int;
  v_existing_member_id uuid;
  representative jsonb;
  v_rep_type_text text;
BEGIN

  -- 1. Validate Inputs & Enums
  v_app_type_enum := p_application_type::"ApplicationType";
  v_pay_method_enum := p_payment_method::"PaymentMethod";
  v_pay_status_enum := 'pending'::"PaymentStatus";

  -- Validate: Online payment requires proof
  IF v_pay_method_enum = 'online' AND (p_payment_proof_url IS NULL OR p_payment_proof_url = '') THEN
    RAISE EXCEPTION 'Proof of payment is required for online transactions.';
  END IF;

  -- Extract Sector ID
  v_sector_id := (p_company_details->>'sectorId')::int;
  
  -- Extract Existing Member ID (for renewals)
  IF p_company_details->>'existingMemberId' IS NOT NULL THEN
    v_existing_member_id := (p_company_details->>'existingMemberId')::uuid;
  ELSE
    v_existing_member_id := NULL;
  END IF;

  -- 2. Insert into "Application" Table
  INSERT INTO "Application" (
    "memberId",
    "sectorId",
    "logoImageURL",
    "applicationDate",
    "applicationType",
    "companyName",
    "companyAddress",
    "landline",
    "faxNumber",
    "mobileNumber",
    "emailAddress",
    "paymentStatus",
    "paymentMethod"
  ) VALUES (
    v_existing_member_id,
    v_sector_id,
    p_company_details->>'logoUrl',
    NOW(),
    v_app_type_enum,
    p_company_details->>'name',
    p_company_details->>'address',
    p_company_details->>'landline',
    p_company_details->>'fax',
    p_company_details->>'mobile',
    p_company_details->>'email',
    v_pay_status_enum,
    v_pay_method_enum
  )
  RETURNING "applicationId" INTO v_application_id;

  -- 3. Handle Proof of Payment
  IF v_pay_method_enum = 'online' THEN
    INSERT INTO "ProofImage" ("applicationId", "url") 
    VALUES (v_application_id, p_payment_proof_url);
  END IF;

  -- 4. Insert Representatives (Splitting First and Last Name)
  IF jsonb_array_length(p_representatives) > 0 THEN
    FOR representative IN SELECT * FROM jsonb_array_elements(p_representatives)
    LOOP
      
      -- Extract the type (principal or alternative)
      v_rep_type_text := representative->>'memberType';

      INSERT INTO "ApplicationMember" (
        "applicationId",
        "ApplicationMemberType",
        "firstName",  -- New Column
        "lastName",   -- New Column
        "mailingAddress",
        "sex",
        "nationality",
        "birthdate",
        "companyDesignation",
        "landline",
        "faxNumber",
        "mobileNumber",
        "emailAddress"
      ) VALUES (
        v_application_id,
        v_rep_type_text::"ApplicationMemberType",
        representative->>'firstName', -- Insert directly
        representative->>'lastName',  -- Insert directly
        representative->>'mailingAddress',
        representative->>'sex',
        representative->>'nationality',
        (representative->>'birthdate')::timestamp,
        representative->>'position',
        representative->>'landline',
        representative->>'fax',
        representative->>'mobileNumber',
        representative->>'email'
      );
    END LOOP;
  END IF;

  -- 5. Return Success
  RETURN jsonb_build_object(
    'applicationId', v_application_id,
    'status', 'success',
    'message', 'Application submitted successfully.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Application submission failed: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_payment_proof_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_start_date" "date", "p_end_date" "date", "p_venue" "text", "p_event_type" "text", "p_registration_fee" numeric) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  -- We declare a variable to hold the ENTIRE existing row
  v_existing_event "Event"%ROWTYPE; 
  
  -- Variables to hold the "Final" values (Existing DB value + New Input)
  v_final_title text;
  v_final_description text;
  v_final_start_date date;
  v_final_end_date date;
  v_final_venue text;
  
  v_new_status "EventType";
  v_is_finished boolean;
BEGIN

  -- 1. Fetch ALL columns from the current event into one record variable
  SELECT * INTO v_existing_event 
  FROM "Event" 
  WHERE "eventId" = p_event_id;

  -- Check if event exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id;
  END IF;

  -- 2. Calculate "Effective" Values
  -- This logic takes the New Value. If the New Value is NULL, it falls back to the Existing Database Value.
  -- This ensures that if you only update the "Date", we still know what the "Title" is for validation.
  v_final_title       := COALESCE(p_title, v_existing_event."eventTitle");
  v_final_description := COALESCE(p_description, v_existing_event."description");
  v_final_start_date  := COALESCE(p_start_date, v_existing_event."eventStartDate");
  v_final_end_date    := COALESCE(p_end_date, v_existing_event."eventEndDate");
  v_final_venue       := COALESCE(p_venue, v_existing_event."venue");
  
  -- Determine Status
  v_new_status   := (COALESCE(p_event_type, v_existing_event."eventType"::text))::"EventType";
  
  -- Determine if Finished (Check against the Final End Date)
  v_is_finished := (v_final_end_date IS NOT NULL AND CURRENT_DATE > v_final_end_date);


  -- 3. VALIDATION LOGIC

  -- SCENARIO A: DRAFT EVENTS
  IF v_existing_event."eventType" = 'draft' THEN
    
    -- If we are attempting to PUBLISH (Draft -> Public/Private)
    IF v_new_status IN ('public', 'private') THEN
      
      -- CHECK ALL FIELDS: 
      -- We check the v_final_... variables to ensure the resulting event is complete.
      IF (v_final_title IS NULL OR v_final_title = '') OR
         (v_final_description IS NULL OR v_final_description = '') OR
         (v_final_start_date IS NULL) OR
         (v_final_end_date IS NULL) OR
         (v_final_venue IS NULL OR v_final_venue = '') THEN
         
        RAISE EXCEPTION 'Publish Failed: Event Title, Description, Dates, and Venue must all be populated.';
      END IF;
      
    END IF;

  -- SCENARIO B: FINISHED EVENTS
  -- Logic: If the event dates have passed, strict rules apply.
  ELSIF v_is_finished THEN
    
    -- Prevent editing Fee
    IF p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for finished events.';
    END IF;

    -- Prevent editing Type
    IF v_new_status IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot change Event Type for finished events.';
    END IF;

    -- Prevent editing Dates
    IF p_start_date IS DISTINCT FROM v_existing_event."eventStartDate" OR 
       p_end_date IS DISTINCT FROM v_existing_event."eventEndDate" THEN
      RAISE EXCEPTION 'Cannot edit Dates for finished events.';
    END IF;

    -- Prevent editing Venue
    IF p_venue IS DISTINCT FROM v_existing_event."venue" THEN
      RAISE EXCEPTION 'Cannot edit Venue for finished events.';
    END IF;

  -- SCENARIO C: PUBLISHED EVENTS (Public/Private)
  ELSIF v_existing_event."eventType" IN ('public', 'private') THEN
    
    -- Prevent editing Fee
    IF p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for published events.';
    END IF;

    -- Prevent editing Type
    IF v_new_status IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot change Event Type for published events.';
    END IF;

  END IF;

  -- 4. PERFORM UPDATE
  -- We use the inputs directly. If they are NULL, the COALESCE inside the UPDATE 
  -- ensures we don't accidentally wipe out existing data (or you can rely on the client sending all data).
  UPDATE "Event" 
  SET 
    "eventTitle"      = v_final_title,
    "description"     = v_final_description,
    "eventHeaderUrl"  = COALESCE(p_event_header_url, "eventHeaderUrl"),
    "eventStartDate"  = v_final_start_date,
    "eventEndDate"    = v_final_end_date,
    "venue"           = v_final_venue,
    "eventType"       = v_new_status,
    "registrationFee" = COALESCE(p_registration_fee, "registrationFee")
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


ALTER FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_start_date" "date", "p_end_date" "date", "p_venue" "text", "p_event_type" "text", "p_registration_fee" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Application" (
    "applicationId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "memberId" "uuid",
    "sectorId" bigint NOT NULL,
    "logoImageURL" "text" NOT NULL,
    "applicationDate" timestamp without time zone DEFAULT "now"() NOT NULL,
    "applicationType" "public"."ApplicationType" NOT NULL,
    "companyName" "text" NOT NULL,
    "companyAddress" "text" NOT NULL,
    "landline" "text" NOT NULL,
    "faxNumber" "text" NOT NULL,
    "mobileNumber" "text" NOT NULL,
    "emailAddress" "text" NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "websiteURL" "text" NOT NULL
);


ALTER TABLE "public"."Application" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ApplicationMember" (
    "applicationMemberId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "applicationId" "uuid" NOT NULL,
    "applicationMemberType" "public"."ApplicationMemberType" NOT NULL,
    "firstName" "text" NOT NULL,
    "mailingAddress" "text" NOT NULL,
    "sex" "text" NOT NULL,
    "nationality" "text" NOT NULL,
    "birthdate" "date" NOT NULL,
    "companyDesignation" "text" NOT NULL,
    "landline" "text" NOT NULL,
    "faxNumber" "text" NOT NULL,
    "mobileNumber" "text" NOT NULL,
    "emailAddress" "text" NOT NULL,
    "lastName" "text" NOT NULL
);


ALTER TABLE "public"."ApplicationMember" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."BusinessMember" (
    "sectorId" bigint NOT NULL,
    "logoImageURL" "text",
    "joinDate" "date" NOT NULL,
    "websiteURL" "text" NOT NULL,
    "businessName" "text" NOT NULL,
    "businessMemberId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."BusinessMember" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."CheckIn" (
    "participantId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" timestamp without time zone DEFAULT "now"() NOT NULL,
    "checkInId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventDayId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."CheckIn" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Event" (
    "eventId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventTitle" "text" NOT NULL,
    "eventHeaderUrl" "text",
    "description" "text",
    "eventStartDate" "date",
    "eventEndDate" "date",
    "venue" "text",
    "eventType" "public"."EventType",
    "registrationFee" real DEFAULT '0'::real NOT NULL,
    "updatedAt" timestamp without time zone,
    "publishedAt" timestamp without time zone
);


ALTER TABLE "public"."Event" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."EventDay" (
    "eventDayId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventId" "uuid" NOT NULL,
    "eventDate" "date" NOT NULL,
    "label" "text" NOT NULL
);


ALTER TABLE "public"."EventDay" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Participant" (
    "participantId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registrationId" "uuid" NOT NULL,
    "firstName" "text" NOT NULL,
    "lastName" "text" NOT NULL,
    "contactNumber" "text" NOT NULL,
    "email" "text" NOT NULL,
    "isPrincipal" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."Participant" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ProofImage" (
    "proofImageId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registrationId" "uuid",
    "path" "text" NOT NULL,
    "applicationId" "uuid"
);


ALTER TABLE "public"."ProofImage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Registration" (
    "registrationId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventId" "uuid" NOT NULL,
    "businessMemberId" "uuid" DEFAULT "gen_random_uuid"(),
    "nonMemberName" "text",
    "registrationDate" timestamp without time zone DEFAULT "now"() NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL
);


ALTER TABLE "public"."Registration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Sector" (
    "sectorId" bigint NOT NULL,
    "sectorName" "text" NOT NULL
);


ALTER TABLE "public"."Sector" OWNER TO "postgres";


ALTER TABLE "public"."Sector" ALTER COLUMN "sectorId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Sector_sectorId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."ApplicationMember"
    ADD CONSTRAINT "ApplicationMember_pkey" PRIMARY KEY ("applicationMemberId");



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId");



ALTER TABLE ONLY "public"."BusinessMember"
    ADD CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("businessMemberId");



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("checkInId");



ALTER TABLE ONLY "public"."EventDay"
    ADD CONSTRAINT "EventDay_pkey" PRIMARY KEY ("eventDayId");



ALTER TABLE ONLY "public"."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId");



ALTER TABLE ONLY "public"."Participant"
    ADD CONSTRAINT "Participant_pkey" PRIMARY KEY ("participantId");



ALTER TABLE ONLY "public"."ProofImage"
    ADD CONSTRAINT "ProofImage_pkey" PRIMARY KEY ("proofImageId");



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_pkey" PRIMARY KEY ("registrationId");



ALTER TABLE ONLY "public"."Sector"
    ADD CONSTRAINT "Sector_pkey" PRIMARY KEY ("sectorId");



ALTER TABLE ONLY "public"."ApplicationMember"
    ADD CONSTRAINT "ApplicationMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."Sector"("sectorId") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."BusinessMember"
    ADD CONSTRAINT "BusinessMember_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."Sector"("sectorId") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_eventDayId_fkey" FOREIGN KEY ("eventDayId") REFERENCES "public"."EventDay"("eventDayId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("participantId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."EventDay"
    ADD CONSTRAINT "EventDay_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Participant"
    ADD CONSTRAINT "Participant_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("registrationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ProofImage"
    ADD CONSTRAINT "ProofImage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ProofImage"
    ADD CONSTRAINT "ProofImage_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("registrationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES "public"."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON UPDATE CASCADE;



CREATE POLICY "Allow delete rollback for anone" ON "public"."Registration" FOR DELETE USING (true);



CREATE POLICY "Allow event creation" ON "public"."Event" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow read access to all on Sector" ON "public"."Sector" FOR SELECT USING (true);



CREATE POLICY "Allow rollback for anyone" ON "public"."ProofImage" FOR DELETE USING (true);



ALTER TABLE "public"."Application" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ApplicationMember" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."BusinessMember" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."CheckIn" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Enable admins to update data" ON "public"."Participant" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users" ON "public"."Event" FOR DELETE TO "authenticated" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert access for all users" ON "public"."Event" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."Participant" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."ProofImage" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."Registration" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for everyone" ON "public"."Event" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."BusinessMember" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."Participant" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."ProofImage" FOR SELECT USING (true);



CREATE POLICY "Enable read access for anonymous" ON "public"."Registration" FOR SELECT USING (true);



CREATE POLICY "Enable read access for everyone" ON "public"."Event" FOR SELECT USING (true);



CREATE POLICY "Enable update for admins" ON "public"."Registration" FOR UPDATE TO "authenticated" USING (true);



ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."EventDay" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Participant" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ProofImage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Registration" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Sector" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































































































































GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "anon";
GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_registration_stats"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "anon";
GRANT ALL ON FUNCTION "public"."get_registration_stats"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_registration_stats"("p_event_id" "uuid", "p_search_text" "text", "p_payment_status" "public"."PaymentStatus") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_payment_proof_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_payment_proof_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_payment_proof_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_start_date" "date", "p_end_date" "date", "p_venue" "text", "p_event_type" "text", "p_registration_fee" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_start_date" "date", "p_end_date" "date", "p_venue" "text", "p_event_type" "text", "p_registration_fee" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_start_date" "date", "p_end_date" "date", "p_venue" "text", "p_event_type" "text", "p_registration_fee" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."Application" TO "anon";
GRANT ALL ON TABLE "public"."Application" TO "authenticated";
GRANT ALL ON TABLE "public"."Application" TO "service_role";



GRANT ALL ON TABLE "public"."ApplicationMember" TO "anon";
GRANT ALL ON TABLE "public"."ApplicationMember" TO "authenticated";
GRANT ALL ON TABLE "public"."ApplicationMember" TO "service_role";



GRANT ALL ON TABLE "public"."BusinessMember" TO "anon";
GRANT ALL ON TABLE "public"."BusinessMember" TO "authenticated";
GRANT ALL ON TABLE "public"."BusinessMember" TO "service_role";



GRANT ALL ON TABLE "public"."CheckIn" TO "anon";
GRANT ALL ON TABLE "public"."CheckIn" TO "authenticated";
GRANT ALL ON TABLE "public"."CheckIn" TO "service_role";



GRANT ALL ON TABLE "public"."Event" TO "anon";
GRANT ALL ON TABLE "public"."Event" TO "authenticated";
GRANT ALL ON TABLE "public"."Event" TO "service_role";



GRANT ALL ON TABLE "public"."EventDay" TO "anon";
GRANT ALL ON TABLE "public"."EventDay" TO "authenticated";
GRANT ALL ON TABLE "public"."EventDay" TO "service_role";



GRANT ALL ON TABLE "public"."Participant" TO "anon";
GRANT ALL ON TABLE "public"."Participant" TO "authenticated";
GRANT ALL ON TABLE "public"."Participant" TO "service_role";



GRANT ALL ON TABLE "public"."ProofImage" TO "anon";
GRANT ALL ON TABLE "public"."ProofImage" TO "authenticated";
GRANT ALL ON TABLE "public"."ProofImage" TO "service_role";



GRANT ALL ON TABLE "public"."Registration" TO "anon";
GRANT ALL ON TABLE "public"."Registration" TO "authenticated";
GRANT ALL ON TABLE "public"."Registration" TO "service_role";



GRANT ALL ON TABLE "public"."Sector" TO "anon";
GRANT ALL ON TABLE "public"."Sector" TO "authenticated";
GRANT ALL ON TABLE "public"."Sector" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Sector_sectorId_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Sector_sectorId_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Sector_sectorId_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

CREATE POLICY "Allow admins to to operations m7tc2d_0" ON "storage"."objects" FOR SELECT TO "authenticated", "anon" USING (("bucket_id" = 'paymentProofs'::"text"));



CREATE POLICY "Allow admins to to operations m7tc2d_1" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'paymentProofs'::"text"));



CREATE POLICY "Allow admins to to operations m7tc2d_2" ON "storage"."objects" FOR UPDATE TO "authenticated" USING (("bucket_id" = 'paymentProofs'::"text"));



CREATE POLICY "Allow admins to to operations m7tc2d_3" ON "storage"."objects" FOR DELETE TO "authenticated" USING (("bucket_id" = 'paymentProofs'::"text"));



CREATE POLICY "Allow anyone to delete m7tc2d_0" ON "storage"."objects" FOR DELETE USING (("bucket_id" = 'paymentProofs'::"text"));



CREATE POLICY "Allow anyone to insert m7tc2d_0" ON "storage"."objects" FOR INSERT WITH CHECK (("bucket_id" = 'paymentProofs'::"text"));



CREATE POLICY "allow authenticated uploads" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'headerImage'::"text"));



