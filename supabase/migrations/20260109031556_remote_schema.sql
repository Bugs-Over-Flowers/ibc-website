create extension if not exists "pg_cron" with schema "pg_catalog";

drop extension if exists "pg_net";

create type "public"."ApplicationStatus" as enum ('new', 'pending', 'approved', 'rejected');

create type "public"."CompanyMemberType" as enum ('principal', 'alternate');

create type "public"."InterviewStatus" as enum ('scheduled', 'completed', 'cancelled', 'rescheduled');

create type "public"."MembershipStatus" as enum ('active', 'unpaid', 'overdue', 'revoked');

drop policy "Enable insert for all users" on "public"."Participant";

drop policy "Enable read access for all users" on "public"."Participant";

drop policy "Enable insert for all users" on "public"."ProofImage";

alter table "public"."Application" drop constraint "Application_sectorId_fkey";

alter table "public"."ApplicationMember" drop constraint "ApplicationMember_applicationId_fkey";

alter table "public"."ProofImage" drop constraint "ProofImage_applicationId_fkey";

drop function if exists "public"."get_event_participant_list"(p_event_id uuid, p_search_text text, p_payment_status public."PaymentStatus");

drop function if exists "public"."get_registration_stats"(p_event_id uuid, p_search_text text, p_payment_status public."PaymentStatus");

drop function if exists "public"."submit_event_registration"(p_event_id uuid, p_member_type text, p_business_member_id uuid, p_non_member_name text, p_payment_method text, p_payment_path text, p_registrant jsonb, p_other_participants jsonb);

drop function if exists "public"."update_event_details"(p_event_id uuid, p_title text, p_description text, p_event_header_url text, p_start_date date, p_end_date date, p_venue text, p_event_type text, p_registration_fee numeric);

drop type "public"."participant_list_item";

drop type "public"."registration_list_item" cascade;

drop type "public"."registration_stats";

create type "public"."registration_details_result" as ("registration_details" jsonb, "event_details" jsonb, "check_in_list" jsonb, "event_days" jsonb, "all_is_checked_in" boolean, "is_event_day" boolean);

create type "public"."participant_list_item" as ("participant_id" uuid, "first_name" text, "last_name" text, "email" text, "contact_number" text, "affiliation" text, "registration_date" timestamp without time zone, "registration_id" uuid);

create type "public"."registration_list_item" as ("registration_id" uuid, "affiliation" text, "registration_date" timestamp without time zone, "payment_status" public."PaymentStatus", "payment_method" public."PaymentMethod", "business_member_id" uuid, "business_name" text, "is_member" boolean, "registrant" jsonb, "people" integer, "registration_identifier" text);

create type "public"."registration_stats" as ("totalRegistrations" integer, "verifiedRegistrations" integer, "pendingRegistrations" integer, "totalParticipants" integer);

alter table "public"."Application" drop constraint "Application_pkey";

drop index if exists "public"."Application_pkey";


  create table "public"."Interview" (
    "interviewId" uuid not null default gen_random_uuid(),
    "applicationId" uuid not null,
    "interviewDate" timestamp without time zone not null,
    "interviewVenue" text not null,
    "status" public."InterviewStatus" default 'scheduled'::public."InterviewStatus",
    "notes" text,
    "createdAt" timestamp without time zone default now(),
    "updatedAt" timestamp without time zone default now()
      );


alter table "public"."Interview" enable row level security;

alter table "public"."Application" add column "applicationMemberType" public."ApplicationMemberType" not null;

alter table "public"."Application" add column "applicationStatus" public."ApplicationStatus" not null default 'new'::public."ApplicationStatus";

alter table "public"."Application" add column "paymentStatus" public."PaymentStatus" not null;

alter table "public"."ApplicationMember" drop column "applicationMemberType";

alter table "public"."ApplicationMember" add column "companyMemberType" public."CompanyMemberType" not null;

alter table "public"."BusinessMember" add column "lastPaymentDate" timestamp without time zone default now();

alter table "public"."BusinessMember" add column "membershipExpiryDate" timestamp without time zone;

alter table "public"."BusinessMember" add column "membershipStatus" public."MembershipStatus" default 'active'::public."MembershipStatus";

alter table "public"."CheckIn" add column "remarks" text;

alter table "public"."CheckIn" alter column "date" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."CheckIn" alter column "date" set data type timestamp with time zone using "date"::timestamp with time zone;

alter table "public"."Event" alter column "eventEndDate" set data type timestamp without time zone using "eventEndDate"::timestamp without time zone;

alter table "public"."Event" alter column "eventStartDate" set data type timestamp without time zone using "eventStartDate"::timestamp without time zone;

alter table "public"."Registration" add column "identifier" text not null;

CREATE UNIQUE INDEX "CheckIn_participantId_eventDayId__unique" ON public."CheckIn" USING btree ("participantId", "eventDayId");

CREATE UNIQUE INDEX "EventDay_eventId_eventDate_key" ON public."EventDay" USING btree ("eventId", "eventDate");

CREATE UNIQUE INDEX "Interview_pkey" ON public."Interview" USING btree ("interviewId");

CREATE UNIQUE INDEX "Registration_token_key" ON public."Registration" USING btree (identifier);

CREATE INDEX idx_interview_application ON public."Interview" USING btree ("applicationId");

CREATE INDEX idx_interview_date ON public."Interview" USING btree ("interviewDate");

CREATE INDEX idx_interview_status ON public."Interview" USING btree (status);

alter table "public"."Interview" add constraint "Interview_pkey" PRIMARY KEY using index "Interview_pkey";

alter table "public"."CheckIn" add constraint "CheckIn_participantId_eventDayId__unique" UNIQUE using index "CheckIn_participantId_eventDayId__unique";

alter table "public"."EventDay" add constraint "EventDay_eventId_eventDate_key" UNIQUE using index "EventDay_eventId_eventDate_key";

alter table "public"."Registration" add constraint "Registration_token_key" UNIQUE using index "Registration_token_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_membership_expiry()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE "BusinessMember" 
  SET "membershipStatus" = 'overdue'
  WHERE "membershipExpiryDate" < NOW()
  AND "membershipStatus" IN ('active', 'unpaid');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_event_checkin_list(p_event_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
WITH relevant_days as (
  SELECT "eventDayId", "eventDate", label
  from "EventDay"
  where "eventId" = p_event_id
),
expected_participants AS (
  SELECT COUNT(p."participantId") as total
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  WHERE r."eventId" = p_event_id
)
SELECT jsonb_build_object(
  'stats', (
    jsonb_build_object(
      'totalExpectedParticipants', (SELECT total from expected_participants)
    )
  ),
  'eventDays', (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'eventDayId', rd."eventDayId",
          'eventDate', rd."eventDate",
          'label', rd.label
        )
        ORDER BY rd."eventDate"
      ),
      '[]'::jsonb
    )
    FROM relevant_days rd
  ),
  'checkIns', (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'checkInId', c."checkInId",
          'participantId', p."participantId",
          'firstName', p."firstName",
          'lastName', p."lastName",
          'email', p.email,
          'contactNumber', p."contactNumber",
          'eventDayId', c."eventDayId",
          'checkedInAt', c.date,
          'registrationId', p."registrationId",
          'affiliation', COALESCE(bm."businessName", r."nonMemberName")
        )
        ORDER BY c.date asc
      ),
      '[]'::jsonb
    )
    FROM "CheckIn" c
    JOIN "Participant" p ON p."participantId" = c."participantId"
    join relevant_days rd on rd."eventDayId" = c."eventDayId"
    left join "Registration" r on r."registrationId" = p."registrationId"
    left join "BusinessMember" bm on bm."businessMemberId" = r."businessMemberId"
  )
);
$function$
;


CREATE OR REPLACE FUNCTION public.get_event_participant_list(p_event_id uuid, p_search_text text DEFAULT NULL::text)
 RETURNS SETOF public.participant_list_item
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
declare
  v_search_pattern TEXT;
BEGIN

    -- 1. Set the fuzzy search threshold for this execution
  PERFORM set_limit(0.3);

  IF p_search_text IS NOT NULL THEN
    v_search_pattern := '%' || p_search_text || '%';
  END IF;

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
    -- 1. Payment Status is verified
    AND r."paymentStatus" = 'verified'::"PaymentStatus"
    -- 2. Filter by Search Text (if provided) across Name, Email, or Company
    AND (
      -- return everything if no search text or empty
      p_search_text IS NULL
      OR p_search_text = '' 

      -- filter by data: firstname, lastname, email, or affiliation
      OR (p."firstName" % p_search_text or p."firstName" ilike v_search_pattern)
      OR (p."lastName" % p_search_text or p."lastName" ilike v_search_pattern)
      OR (
        (p."firstName" || ' ' || p."lastName") % p_search_text
        or (p."firstName" || ' ' || p."lastName") ilike v_search_pattern)
      OR (p.email <% p_search_text OR p.email ilike v_search_pattern)
      OR (COALESCE(bm."businessName", r."nonMemberName") <% p_search_text OR COALESCE(bm."businessName", r."nonMemberName") ilike v_search_pattern)
    )

    ORDER BY

    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
        -- *** PRIORITY 1: Exact Substring Matches ***
        -- If the text physically exists inside the string, bring it to the top.
        CASE 
            WHEN (
                 p."firstName" ILIKE v_search_pattern
                 OR p."lastName" ILIKE v_search_pattern
                 OR (p."firstName" || ' ' || p."lastName") ILIKE v_search_pattern
                 OR p."email" ILIKE v_search_pattern
                 OR COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
            ) THEN 1
            ELSE 0 
        END
    ELSE 0 END DESC,

    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN 
        -- *** PRIORITY 2: Fuzzy Similarity Score ***
        -- If it wasn't an exact match, sort by how close the typo is.
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_event_status(p_event_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  total_regs bigint := 0;
  verified_regs bigint := 0;
  pending_regs bigint := 0;
  participants_total bigint := 0;
  attended_total bigint := 0;
  day_rec record;
  days_arr jsonb := '[]'::jsonb;
  day_obj jsonb;
  participants_day bigint;
  attended_day bigint;
  has_event_days boolean;
BEGIN
  -- Overall registration counts
  SELECT COUNT(*) INTO total_regs 
  FROM "Registration" r 
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(*) INTO verified_regs 
  FROM "Registration" r 
  WHERE r."eventId" = p_event_id 
    AND lower(coalesce(r."paymentStatus"::text, '')) = 'verified';

  SELECT COUNT(*) INTO pending_regs 
  FROM "Registration" r 
  WHERE r."eventId" = p_event_id 
    AND lower(coalesce(r."paymentStatus"::text, '')) = 'pending';

  -- Total participants registered for this event
  SELECT COUNT(DISTINCT p."participantId") INTO participants_total
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  WHERE r."eventId" = p_event_id;

  -- Total unique participants who attended at least one day (have a check-in record)
  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  -- Check if explicit event_days exist for this event
  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id) INTO has_event_days;

  IF has_event_days THEN
    FOR day_rec IN
      SELECT ed."eventDayId" AS day_id, ed."dayLabel" AS day_label, ed."dayDate" AS day_date
      FROM "EventDay" ed
      WHERE ed."eventId" = p_event_id
      ORDER BY ed."dayDate", ed."eventDayId"
    LOOP
      -- Participants who checked in on this day
      SELECT COUNT(DISTINCT ci."participantId") INTO participants_day
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id 
        AND ci."eventDayId" = day_rec.day_id;

      -- For attended, we count the same as participants_day since CheckIn means attended
      attended_day := participants_day;

      day_obj := jsonb_build_object(
        'day_id', day_rec.day_id,
        'day_label', coalesce(day_rec.day_label, to_char(day_rec.day_date, 'YYYY-MM-DD')),
        'day_date', day_rec.day_date,
        'participants', coalesce(participants_day, 0),
        'attended', coalesce(attended_day, 0)
      );

      days_arr := days_arr || jsonb_build_array(day_obj);
    END LOOP;
  ELSE
    -- Fallback: aggregate by CheckIn date when no EventDay rows exist
    FOR day_rec IN
      SELECT (ci."date"::date) AS day_date
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
      GROUP BY ci."date"::date
      ORDER BY ci."date"::date
    LOOP
      SELECT COUNT(DISTINCT ci."participantId") INTO participants_day
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id 
        AND ci."date"::date = day_rec.day_date;

      attended_day := participants_day;

      day_obj := jsonb_build_object(
        'day_id', null,
        'day_label', to_char(day_rec.day_date, 'YYYY-MM-DD'),
        'day_date', day_rec.day_date,
        'participants', coalesce(participants_day, 0),
        'attended', coalesce(attended_day, 0)
      );

      days_arr := days_arr || jsonb_build_array(day_obj);
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'event_id', p_event_id::text,
    'total_registrations', coalesce(total_regs, 0),
    'verified_registrations', coalesce(verified_regs, 0),
    'pending_registrations', coalesce(pending_regs, 0),
    'participants', coalesce(participants_total, 0),
    'attended', coalesce(attended_total, 0),
    'event_days', days_arr
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_registration_list_checkin(p_identifier text, p_today date DEFAULT CURRENT_DATE)
 RETURNS public.registration_details_result
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result registration_details_result;
BEGIN

  WITH
  -- registration and event details
  base_data AS (
    SELECT 
      r."registrationId",
      r."nonMemberName",
      r."businessMemberId",
      e.*
    FROM "Registration" r
    JOIN "Event" e on r."eventId" = e."eventId"
    WHERE r.identifier = p_identifier
    LIMIT 1
  ),

  -- Current Event Day
  current_event_day AS (
    SELECT ed.*
    FROM "EventDay" ed
    JOIN base_data bd ON ed."eventId" = bd."eventId"
    -- FOR DEBUGGING COMMENT THIS OUT
    WHERE ed."eventDate" = p_today
    limit 1
  ),

  check_in_list AS (
    SELECT 
      p.*,
      ci.remarks,
      ci.date,
      -- Check if a CheckIn exists for this participant on the current event day(s)
      EXISTS (
        SELECT 1 
        FROM "CheckIn" ci
        JOIN current_event_day ced ON ci."eventDayId" = ced."eventDayId"
        WHERE ci."participantId" = p."participantId"
      ) AS is_checked_in
    FROM "Participant" p
    JOIN base_data bd ON p."registrationId" = bd."registrationId"
    LEFT JOIN "CheckIn" ci on ci."participantId" = p."participantId"
  )

  select
    -- Registration details
    json_build_object(
      'registrationId', bd."registrationId",
      'affiliation', COALESCE(bm."businessName", bd."nonMemberName")
    ),
    -- Event details except the createdAt and the updatedAt
    to_jsonb(bd) - 'createdAt' - 'updatedAt' - 'registrationId' - 'nonMemberName' - 'businessMemberId',
    -- participant list, and check if checkedin today
    (
      SELECT json_agg(
        to_jsonb(cil.*) || jsonb_build_object(
          'checkedIn', cil.is_checked_in
        )
        ORDER BY 
          "lastName" ASC,      
          "firstName" ASC
      )
      FROM check_in_list cil
     
    ),
    -- event day(s) details today
    (
      SELECT COALESCE(jsonb_agg(ced.*), '[]'::jsonb)
      FROM current_event_day ced
    ),
    (
      -- Check if every participant has a check-in for today
      SELECT COALESCE(BOOL_AND(cil.is_checked_in), FALSE)
      FROM check_in_list cil
    ),
    (
      -- Check if today is within the event date range
      (p_today >= bd."eventStartDate" AND p_today <= bd."eventEndDate")
    )
  INTO 
    v_result.registration_details,
    v_result.event_details,
    v_result.check_in_list,
    v_result.event_days,
    v_result.all_is_checked_in,
    v_result.is_event_day

  FROM base_data bd
  LEFT JOIN "BusinessMember" bm ON bd."businessMemberId" = bm."businessMemberId";
  
  -- Check if registration exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration Not Found';
  END IF;

  -- Validate Affiliation
  IF v_result.registration_details->>'affiliation' IS NULL THEN
    RAISE EXCEPTION 'Affiliation not found';
  END IF;

  -- Validate that we have required data
  IF v_result.event_details IS NULL THEN
    RAISE EXCEPTION 'Event details not found';
  END IF;

  -- Validate if not event dat
  -- IF NOT v_result.is_event_day THEN
  --   RAISE EXCEPTION 'Today is not within the event date range for event: %', v_result.event_details->>'eventTitle';
  -- END IF;

  -- Validate if Event Day Exists
  IF v_result.event_days = '[]'::jsonb THEN
    RAISE EXCEPTION 'Event days not found for today';
  END IF;

  RETURN v_result;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_registration_list_stats(p_event_id uuid)
 RETURNS public.registration_stats
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    v_result registration_stats;
BEGIN
    
    -- Run the query
    SELECT 
        COUNT(distinct r."registrationId")::INTEGER AS "totalRegistrations",
        COUNT(distinct r."registrationId") FILTER (WHERE r."paymentStatus" = 'verified')::INTEGER AS "verifiedRegistrations",
        COUNT(distinct r."registrationId") FILTER (WHERE r."paymentStatus" = 'pending')::INTEGER AS "pendingRegistrations",
        COUNT(p."participantId") FILTER (where r."paymentStatus" = 'verified')::INTEGER as "totalParticipants"
    INTO v_result
    FROM "Registration" r

    -- Left Join Participants
    LEFT JOIN "Participant" p On r."registrationId" = p."registrationId"

    WHERE r."eventId" = p_event_id;

    --  AND (
    --     p_payment_status IS null
    --     OR
    --     r."paymentStatus" = p_payment_status::"PaymentStatus"
    --   )
    --   AND (
    --       -- IF p_affiliation IS NULL, this block is skipped (TRUE)
    --       p_search_text IS NULL 
    --       OR 
    --       -- OTHERWISE, we check the fuzzy match
    --       bm."businessName" % p_search_text OR
    --       r."nonMemberName" % p_search_text OR
    --       EXISTS (
    --         SELECT 1 FROM "Participant" p
    --         WHERE p."registrationId" = r."registrationId"
    --         AND p."isPrincipal" = true
    --         AND (
    --           p."firstName" % p_search_text
    --           OR p."lastName" % p_search_text
    --           OR p.email % p_search_text
    --         )
    --       )
    --   );
    
    RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_event_days()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  day_date DATE;
  day_label TEXT;
BEGIN
  -- Case 1: Event type changed to null (draft)
  IF (NEW."eventType" IS NULL) THEN
    DELETE FROM public."EventDay" WHERE "eventId" = NEW."eventId";
    RETURN NEW;
  END IF;

  -- Case 2: Event is inserted or updated with eventType = 'public' or 'private'
  -- Ensure dates are present before generating days
  IF (NEW."eventType" IN ('public', 'private') AND NEW."eventStartDate" IS NOT NULL AND NEW."eventEndDate" IS NOT NULL) THEN
    
    -- 1. Delete days that are outside the new range
    DELETE FROM public."EventDay"
    WHERE "eventId" = NEW."eventId"
    AND ("eventDate" < NEW."eventStartDate" OR "eventDate" > NEW."eventEndDate");

    -- 2. Insert missing days
    day_date := NEW."eventStartDate";
    WHILE day_date <= NEW."eventEndDate" LOOP
      -- Check if exists
      IF NOT EXISTS (
        SELECT 1 FROM public."EventDay" 
        WHERE "eventId" = NEW."eventId" AND "eventDate" = day_date
      ) THEN
        -- Generate label (e.g., "Day 1")
        day_label := 'Day ' || (day_date - NEW."eventStartDate"::DATE + 1)::TEXT;
        
        INSERT INTO public."EventDay" ("eventId", "eventDate", "label")
        VALUES (NEW."eventId", day_date, day_label);
      END IF;
      
      day_date := day_date + 1;
    END LOOP;

    -- 3. Update labels for existing rows to ensure they match the new start date sequence
    -- This ensures that if start date shifts, "Day 1" is always the first day.
    UPDATE public."EventDay"
    SET label = 'Day ' || ("eventDate" - NEW."eventStartDate"::DATE + 1)::TEXT
    WHERE "eventId" = NEW."eventId";
    
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.january_first_reset()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- On Jan 1, update statuses:
    -- active → unpaid (if expired)
    -- unpaid → overdue
    UPDATE "BusinessMember" 
    SET "membershipStatus" = 
        CASE 
            WHEN "membershipStatus" = 'active'::"MembershipStatus" 
                 AND "membershipExpiryDate" < NOW() 
            THEN 'unpaid'::"MembershipStatus"
            WHEN "membershipStatus" = 'unpaid'::"MembershipStatus" 
            THEN 'overdue'::"MembershipStatus"
            ELSE "membershipStatus"
        END
    WHERE "membershipStatus" IN ('active'::"MembershipStatus", 'unpaid'::"MembershipStatus");
END;
$function$
;

CREATE OR REPLACE FUNCTION public.publish_event(p_event_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_current_date DATE;
  v_day_number INT := 1;
BEGIN
  -- Update the event to be published and get the dates
  UPDATE "Event"
  SET "publishedAt" = NOW()
  WHERE "eventId" = p_event_id
  RETURNING "eventStartDate", "eventEndDate" INTO v_start_date, v_end_date;

  -- Check if event exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found or permission denied', p_event_id;
  END IF;

  -- Check if dates are present
  IF v_start_date IS NULL OR v_end_date IS NULL THEN
    RAISE EXCEPTION 'Event must have start and end dates to be published';
  END IF;

  -- Clear existing EventDay entries for this event to avoid duplicates
  DELETE FROM "EventDay" WHERE "eventId" = p_event_id;

  -- Loop through the dates and create EventDay rows
  v_current_date := v_start_date;
  WHILE v_current_date <= v_end_date LOOP
    INSERT INTO "EventDay" ("eventId", "eventDate", "label")
    VALUES (p_event_id, v_current_date, 'Day ' || v_day_number);
    
    v_current_date := v_current_date + 1;
    v_day_number := v_day_number + 1;
  END LOOP;
END;
$function$
;


CREATE OR REPLACE FUNCTION public.set_membership_expiry()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW."lastPaymentDate" IS NOT NULL THEN
        NEW."membershipExpiryDate" = 
            DATE_TRUNC('year', NEW."lastPaymentDate") 
            + INTERVAL '1 year';
        NEW."membershipStatus" = 'active'::"MembershipStatus";
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_event_registration(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_path text DEFAULT NULL::text, p_registrant jsonb DEFAULT '{}'::jsonb, p_other_participants jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    "identifier",
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
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
$function$
;

CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_application_member_type text, p_payment_proof_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$DECLARE
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

  -- Validate: Online payment requires proof (Checking against 'BPI')
  IF v_pay_method_enum = 'BPI' AND (p_payment_proof_url IS NULL OR p_payment_proof_url = '') THEN
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
    "paymentMethod",
    "websiteURL",
    "applicationMemberType"
  ) VALUES (
    v_existing_member_id,
    v_sector_id,
    p_company_details->>'logoImageURL',
    NOW(),
    v_app_type_enum,
    p_company_details->>'name',
    p_company_details->>'address',
    p_company_details->>'landline',
    p_company_details->>'fax',
    p_company_details->>'mobile',
    p_company_details->>'email',
    v_pay_status_enum,
    v_pay_method_enum,
    p_company_details->>'websiteURL',
    p_application_member_type::"ApplicationMemberType"
  )
  RETURNING "applicationId" INTO v_application_id;

  -- 3. Handle Proof of Payment
  IF v_pay_method_enum = 'BPI' THEN
    INSERT INTO "ProofImage" ("applicationId", "path") 
    VALUES (v_application_id, p_payment_proof_url);
  END IF;

  -- 4. Insert Representatives
  IF jsonb_array_length(p_representatives) > 0 THEN
    FOR representative IN SELECT * FROM jsonb_array_elements(p_representatives)
    LOOP
      
      -- Extract the type (principal or alternative)
      v_rep_type_text := representative->>'memberType';

      INSERT INTO "ApplicationMember" (
        "applicationId",
        "companyMemberType", -- Assumes this column exists in ApplicationMember
        "firstName",
        "lastName",
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
        v_rep_type_text::"CompanyMemberType", -- Casting to specific Enum
        representative->>'firstName',
        representative->>'lastName',
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_event_details(p_event_id uuid, p_title text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_event_header_url text DEFAULT NULL::text, p_start_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_end_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_venue text DEFAULT NULL::text, p_event_type text DEFAULT NULL::text, p_registration_fee real DEFAULT NULL::real)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
  v_is_draft boolean;
  v_is_finished boolean;
BEGIN
  -- 1. Fetch the current event
  SELECT * INTO v_existing_event 
  FROM "Event" 
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id;
  END IF;

  -- 2. Determine if draft (eventType is NULL means draft)
  v_is_draft := (v_existing_event."eventType" IS NULL);

  -- 3. Determine if event is finished
  v_is_finished := (v_existing_event."eventEndDate" IS NOT NULL 
                    AND CURRENT_TIMESTAMP > v_existing_event."eventEndDate");

  -- 4. Calculate final values using COALESCE
  v_final_title := COALESCE(p_title, v_existing_event."eventTitle");
  v_final_description := COALESCE(p_description, v_existing_event."description");
  v_final_header_url := COALESCE(p_event_header_url, v_existing_event."eventHeaderUrl");
  v_final_start_date := COALESCE(p_start_date, v_existing_event."eventStartDate");
  v_final_end_date := COALESCE(p_end_date, v_existing_event."eventEndDate");
  v_final_venue := COALESCE(p_venue, v_existing_event."venue");
  v_final_registration_fee := COALESCE(p_registration_fee, v_existing_event."registrationFee");

  IF p_event_type IS NULL THEN
    v_final_event_type := v_existing_event."eventType";
  ELSIF p_event_type = 'draft' THEN
    v_final_event_type := NULL;
  ELSE
    v_final_event_type := p_event_type::"EventType";
  END IF;

  -- 5. VALIDATION LOGIC

  -- SCENARIO A: DRAFT EVENTS (eventType IS NULL)
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

  -- SCENARIO B: FINISHED EVENTS (end date has passed)
  ELSIF v_is_finished THEN
    RAISE EXCEPTION 'Cannot edit finished events.';

  -- SCENARIO C: PUBLISHED EVENTS (Public/Private, not finished)
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

  -- 6. PERFORM UPDATE
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
    "updatedAt" = NOW(),
    "publishedAt" = CASE 
      WHEN v_is_draft AND v_final_event_type IS NOT NULL THEN NOW()
      ELSE "publishedAt"
    END
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event update failed. The event may have been deleted or you do not have permission to update it.';
  END IF;

  -- 7. Return Response
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
$function$
;


CREATE OR REPLACE FUNCTION public.get_registration_list(p_event_id uuid, p_search_text text DEFAULT NULL::text, p_payment_status public."PaymentStatus" DEFAULT NULL::public."PaymentStatus")
 RETURNS SETOF public.registration_list_item
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
declare
  v_search_pattern TEXT;
BEGIN
    -- 1. Set the fuzzy search threshold for this execution
    PERFORM set_limit(0.3);

    -- 2. Prepare the search pattern for ILIKE (surround with %)
    IF p_search_text IS NOT NULL THEN
        v_search_pattern := '%' || p_search_text || '%';
    END IF;

    RETURN QUERY
    SELECT 
        r."registrationId",
        COALESCE(bm."businessName", r."nonMemberName") AS affiliation, 
        r."registrationDate",
        r."paymentStatus",
        r."paymentMethod",
        bm."businessMemberId",
        bm."businessName",
        (bm."businessMemberId" IS NOT NULL) AS is_member,
        CASE 
            WHEN p_data.principal_id IS NOT NULL THEN
                jsonb_build_object(
                    'firstName', p_data.p_first_name,
                    'lastName', p_data.p_last_name,
                    'email', p_data.p_email
                )
            ELSE NULL 
        END,
        COALESCE(p_data.total_people, 0)::INTEGER AS people,
        r."identifier"
        AS registrant

    FROM "Registration" r
    LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"

    -- Join Principal Participant
    LEFT JOIN LATERAL (
        SELECT 
            COUNT(*) as total_people,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."participantId"::text END) as principal_id,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."firstName" END) as p_first_name,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."lastName" END) as p_last_name,
            MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p.email END) as p_email
        FROM "Participant" sub_p
        WHERE sub_p."registrationId" = r."registrationId"
    ) p_data ON true

    LEFT JOIN LATERAL (
        SELECT 
            COALESCE(bm."businessName", r."nonMemberName") as affiliation,
            
            -- Calculate Match Score (0 if no search text)
            CASE WHEN p_search_text IS NOT NULL THEN
                GREATEST(
                    similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text),
                    similarity(p_data.p_first_name || ' ' || p_data.p_last_name, p_search_text)
                )
            ELSE 0 END as sim_score,
            
            -- Calculate Exact Match Boolean
            CASE WHEN p_search_text IS NOT NULL THEN
                (
                  COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
                  OR (p_data.p_first_name || ' ' || p_data.p_last_name) ILIKE v_search_pattern
                  OR p_data.p_email ILIKE v_search_pattern
                )
            ELSE FALSE END as is_exact_match
    ) s ON true

    WHERE r."eventId" = p_event_id
      -- Ensure affiliation exists
      and s.affiliation is not null

      -- *** Filter By Status Logic ***
      AND (
        p_payment_status IS null
        OR
        r."paymentStatus" = p_payment_status::"PaymentStatus"
      )
      
      -- *** SEARCH LOGIC HERE ***
      AND (
          p_search_text IS NULL   -- If no search term, return everything

          -- Matches either Business Name OR Non-Member Name
          or s.is_exact_match
          or s.sim_score > 0.3
      )
      
    -- *** SORTING LOGIC ***
    ORDER BY
        -- Sort using the pre-calculated values (Super fast)
        CASE WHEN p_search_text IS NOT NULL THEN s.is_exact_match ELSE FALSE END DESC,
        CASE WHEN p_search_text IS NOT NULL THEN s.sim_score ELSE 0 END DESC,
        r."registrationDate" DESC;
END;
$function$
;


CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_payment_proof_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
  IF v_pay_method_enum = 'BPI' AND (p_payment_proof_url IS NULL OR p_payment_proof_url = '') THEN
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
    "paymentMethod",
    "websiteURL"
  ) VALUES (
    v_existing_member_id,
    v_sector_id,
    p_company_details->>'logoImageURL',
    NOW(),
    v_app_type_enum,
    p_company_details->>'name',
    p_company_details->>'address',
    p_company_details->>'landline',
    p_company_details->>'fax',
    p_company_details->>'mobile',
    p_company_details->>'email',
    v_pay_status_enum,
    v_pay_method_enum,
    p_company_details->>'websiteURL'
  )
  RETURNING "applicationId" INTO v_application_id;

  -- 3. Handle Proof of Payment
  IF v_pay_method_enum = 'BPI' THEN
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
        "applicationMemberType",
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
$function$
;

grant delete on table "public"."Interview" to "anon";

grant insert on table "public"."Interview" to "anon";

grant references on table "public"."Interview" to "anon";

grant select on table "public"."Interview" to "anon";

grant trigger on table "public"."Interview" to "anon";

grant truncate on table "public"."Interview" to "anon";

grant update on table "public"."Interview" to "anon";

grant delete on table "public"."Interview" to "authenticated";

grant insert on table "public"."Interview" to "authenticated";

grant references on table "public"."Interview" to "authenticated";

grant select on table "public"."Interview" to "authenticated";

grant trigger on table "public"."Interview" to "authenticated";

grant truncate on table "public"."Interview" to "authenticated";

grant update on table "public"."Interview" to "authenticated";

grant delete on table "public"."Interview" to "service_role";

grant insert on table "public"."Interview" to "service_role";

grant references on table "public"."Interview" to "service_role";

grant select on table "public"."Interview" to "service_role";

grant trigger on table "public"."Interview" to "service_role";

grant truncate on table "public"."Interview" to "service_role";

grant update on table "public"."Interview" to "service_role";


  create policy "Enable insert for everyone"
  on "public"."ApplicationMember"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."ApplicationMember"
  as permissive
  for select
  to public
using (true);



  create policy "Enable to approve application"
  on "public"."BusinessMember"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable to revoke member's membership"
  on "public"."BusinessMember"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable to update member's details"
  on "public"."BusinessMember"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Allow admins to do any operations"
  on "public"."CheckIn"
  as permissive
  for all
  to public
using (true);



  create policy "Update only auth"
  on "public"."Event"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "allow operations for admins"
  on "public"."EventDay"
  as permissive
  for all
  to authenticated
using (true);



  create policy "Admins can remove interviews"
  on "public"."Interview"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Admins can schedule interviews"
  on "public"."Interview"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Admins can updated interviews"
  on "public"."Interview"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "Admins can view all interviews"
  on "public"."Interview"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable insert for all users"
  on "public"."Participant"
  as permissive
  for insert
  to anon, authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."Participant"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Enable insert for all users"
  on "public"."ProofImage"
  as permissive
  for insert
  to public
with check (true);


CREATE TRIGGER trigger_set_membership_expiry BEFORE INSERT OR UPDATE OF "lastPaymentDate" ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.set_membership_expiry();

CREATE TRIGGER on_event_change AFTER INSERT OR UPDATE ON public."Event" FOR EACH ROW EXECUTE FUNCTION public.handle_event_days();


  create policy "insert for all 18vv14g_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'logoImage'::text));
