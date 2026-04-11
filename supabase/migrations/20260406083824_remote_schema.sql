drop trigger if exists "tr_update_event_available_slots" on "public"."Registration";

drop function if exists "public"."check_member_exists"(p_identifier text);

drop function if exists "public"."update_event_details"(p_event_id uuid, p_title text, p_description text, p_event_header_url text, p_event_poster text, p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_venue text, p_event_type text, p_registration_fee real);

drop function if exists "public"."update_event_details"(p_event_id uuid, p_title text, p_description text, p_event_header_url text, p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_venue text, p_event_type text, p_registration_fee real);

drop function if exists "public"."update_event_details"(p_event_id uuid, p_title text, p_description text, p_event_header_url text, p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_venue text, p_event_type text, p_registration_fee real, p_facebook_link text);

alter table "public"."Event" drop column "availableSlots";

alter table "public"."Event" drop column "maxGuest";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_member_exists_and_get(p_identifier text, p_application_type text DEFAULT 'renewal'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_member public."BusinessMember"%ROWTYPE;
  v_application public."Application"%ROWTYPE;
  v_normalized_identifier text;
  v_application_type text;
  v_has_application boolean := false;
  v_principal jsonb := NULL;
  v_alternate jsonb := NULL;
BEGIN
  v_normalized_identifier := lower(trim(p_identifier));
  v_application_type := lower(trim(p_application_type));

  IF v_normalized_identifier IS NULL OR v_normalized_identifier = '' THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier is required'
    );
  END IF;

  IF v_application_type NOT IN ('renewal', 'updating') THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Invalid application type. Expected renewal or updating'
    );
  END IF;

  SELECT *
  INTO v_member
  FROM public."BusinessMember" bm
  WHERE lower(bm."identifier") = v_normalized_identifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier not found'
    );
  END IF;

  IF v_application_type = 'renewal' THEN
    IF v_member."membershipStatus" != 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member."businessName",
        'membershipStatus', v_member."membershipStatus",
        'businessMemberIdentifier', v_member."identifier",
        'businessMemberId', v_member."businessMemberId",
        'message', 'Only cancelled memberships are eligible for renewal'
      );
    END IF;
  ELSE
    IF v_member."membershipStatus" = 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member."businessName",
        'membershipStatus', v_member."membershipStatus",
        'businessMemberIdentifier', v_member."identifier",
        'businessMemberId', v_member."businessMemberId",
        'message', 'cancelled memberships must renew first before updating information'
      );
    END IF;
  END IF;

  SELECT *
  INTO v_application
  FROM public."Application" a
  WHERE a."businessMemberId" = v_member."businessMemberId"
  ORDER BY a."applicationDate" DESC
  LIMIT 1;

  v_has_application := FOUND;

  IF v_has_application THEN
    SELECT jsonb_build_object(
      'firstName', am."firstName",
      'lastName', am."lastName",
      'emailAddress', am."emailAddress",
      'mobileNumber', am."mobileNumber",
      'landline', am."landline",
      'mailingAddress', am."mailingAddress",
      'companyDesignation', am."companyDesignation",
      'birthdate', am."birthdate",
      'nationality', am."nationality",
      'sex', am."sex"
    )
    INTO v_principal
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_application."applicationId"
      AND am."companyMemberType" = 'principal'
    LIMIT 1;

    SELECT jsonb_build_object(
      'firstName', am."firstName",
      'lastName', am."lastName",
      'emailAddress', am."emailAddress",
      'mobileNumber', am."mobileNumber",
      'landline', am."landline",
      'mailingAddress', am."mailingAddress",
      'companyDesignation', am."companyDesignation",
      'birthdate', am."birthdate",
      'nationality', am."nationality",
      'sex', am."sex"
    )
    INTO v_alternate
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_application."applicationId"
      AND am."companyMemberType" = 'alternate'
    LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'companyName', v_member."businessName",
    'membershipStatus', v_member."membershipStatus",
    'businessMemberIdentifier', v_member."identifier",
    'businessMemberId', v_member."businessMemberId",
    'companyAddress', CASE WHEN v_has_application THEN COALESCE(v_application."companyAddress", '') ELSE '' END,
    'emailAddress', CASE WHEN v_has_application THEN COALESCE(v_application."emailAddress", '') ELSE '' END,
    'landline', CASE WHEN v_has_application THEN COALESCE(v_application."landline", '') ELSE '' END,
    'mobileNumber', CASE WHEN v_has_application THEN COALESCE(v_application."mobileNumber", '') ELSE '' END,
    'websiteURL', COALESCE(v_member."websiteURL", ''),
    'logoImageURL', COALESCE(v_member."logoImageURL", ''),
    'sectorId', CASE WHEN v_has_application THEN COALESCE(v_application."sectorId", v_member."sectorId") ELSE v_member."sectorId" END,
    'principalRepresentative', v_principal,
    'alternateRepresentative', v_alternate
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Unable to validate Business Member Identifier at this time'
      -- for debugging temporarily add: ,'debug', SQLERRM
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_evaluations_by_event(event_id uuid, completed_only boolean DEFAULT false)
 RETURNS TABLE(evaluation_id uuid, event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, venue text, name text, q1_rating public."ratingScale", q2_rating public."ratingScale", q3_rating public."ratingScale", q4_rating public."ratingScale", q5_rating public."ratingScale", q6_rating public."ratingScale", additional_comments text, feedback text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
  select
    ef."evaluationId" as "evaluation_id",
    e."eventId" as "event_id",
    e."eventTitle" as "event_title",
    e."eventStartDate" as "event_start_date",
    e."eventEndDate" as "event_end_date",
    e."venue" as "venue",
    ef."name" as "name",
    ef."q1Rating" as "q1_rating",
    ef."q2Rating" as "q2_rating",
    ef."q3Rating" as "q3_rating",
    ef."q4Rating" as "q4_rating",
    ef."q5Rating" as "q5_rating",
    ef."q6Rating" as "q6_rating",
    ef."additionalComments" as "additional_comments",
    ef."feedback" as "feedback",
    ef."createdAt" as "created_at"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  where
    (e."eventId" = "event_id")
    and (
      not "completed_only" or (
        ef."q1Rating" is not null and
        ef."q2Rating" is not null and
        ef."q3Rating" is not null and
        ef."q4Rating" is not null and
        ef."q5Rating" is not null and
        ef."q6Rating" is not null
      )
    )
  order by
    ef."createdAt" desc;
$function$
;

CREATE OR REPLACE FUNCTION public.process_membership_statuses(p_reference_time timestamp with time zone DEFAULT now())
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_year_start date;
    next_year_start date;
BEGIN
    current_year_start := DATE_TRUNC('year', p_reference_time)::date;
    next_year_start := (current_year_start + INTERVAL '1 year')::date;

    -- Step 1: cancel members who were already unpaid and are now expired.
    UPDATE "BusinessMember"
    SET "membershipStatus" = 'cancelled'
    WHERE "membershipExpiryDate" IS NOT NULL
      AND "membershipExpiryDate" < p_reference_time
      AND "membershipStatus" = 'unpaid';

    -- Step 2: expired paid members enter grace period until next Jan 1.
    UPDATE "BusinessMember"
    SET "membershipStatus" = 'unpaid',
        "membershipExpiryDate" = next_year_start
    WHERE "membershipExpiryDate" IS NOT NULL
      AND "membershipExpiryDate" < p_reference_time
      AND "membershipStatus" = 'paid';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_event_details(p_event_id uuid, p_title text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_event_header_url text DEFAULT NULL::text, p_event_poster text DEFAULT NULL::text, p_start_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_end_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_venue text DEFAULT NULL::text, p_event_type text DEFAULT NULL::text, p_registration_fee real DEFAULT NULL::real, p_facebook_link text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_existing_event "Event"%ROWTYPE;
  v_final_title text;
  v_final_description text;
  v_final_header_url text;
  v_final_poster_url text;
  v_final_start_date timestamp;
  v_final_end_date timestamp;
  v_final_venue text;
  v_final_event_type "EventType";
  v_final_registration_fee float4;
  v_final_facebook_link text;
  v_is_draft boolean;
  v_is_finished boolean;
BEGIN
  -- 1) Fetch current event
  SELECT *
  INTO v_existing_event
  FROM "Event"
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id;
  END IF;

  -- 2) State flags
  v_is_draft := (v_existing_event."eventType" IS NULL);
  v_is_finished := (
    v_existing_event."eventEndDate" IS NOT NULL
    AND CURRENT_TIMESTAMP > v_existing_event."eventEndDate"
  );

  -- 3) Final values (default to existing when param is NULL)
  v_final_title := COALESCE(p_title, v_existing_event."eventTitle");
  v_final_description := COALESCE(p_description, v_existing_event."description");
  v_final_header_url := COALESCE(p_event_header_url, v_existing_event."eventHeaderUrl");
  v_final_poster_url := COALESCE(p_event_poster, v_existing_event."eventPoster");
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

  -- 4) Validation / edit rules

  -- A) Draft events
  IF v_is_draft THEN
    -- If publishing from draft, enforce required fields
    IF v_final_event_type IS NOT NULL THEN
      IF (v_final_title IS NULL OR v_final_title = '') OR
         (v_final_description IS NULL OR v_final_description = '') OR
         (v_final_start_date IS NULL) OR
         (v_final_end_date IS NULL) OR
         (v_final_venue IS NULL OR v_final_venue = '') THEN
        RAISE EXCEPTION
          'Publish Failed: Event Title, Description, Start Date, End Date, and Venue must all be populated.';
      END IF;
    END IF;

  -- B) Finished events: only facebookLink may be changed
  ELSIF v_is_finished THEN
    IF (p_title IS NOT NULL AND p_title IS DISTINCT FROM v_existing_event."eventTitle")
       OR (p_description IS NOT NULL AND p_description IS DISTINCT FROM v_existing_event."description")
       OR (p_event_header_url IS NOT NULL AND p_event_header_url IS DISTINCT FROM v_existing_event."eventHeaderUrl")
       OR (p_event_poster IS NOT NULL AND p_event_poster IS DISTINCT FROM v_existing_event."eventPoster")
       OR (p_start_date IS NOT NULL AND p_start_date IS DISTINCT FROM v_existing_event."eventStartDate")
       OR (p_end_date IS NOT NULL AND p_end_date IS DISTINCT FROM v_existing_event."eventEndDate")
       OR (p_venue IS NOT NULL AND p_venue IS DISTINCT FROM v_existing_event."venue")
       OR (p_event_type IS NOT NULL)
       OR (p_registration_fee IS NOT NULL AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee")
    THEN
      RAISE EXCEPTION 'Finished events: only Facebook Link can be edited.';
    END IF;

    -- Lock all non-facebook fields
    v_final_title := v_existing_event."eventTitle";
    v_final_description := v_existing_event."description";
    v_final_header_url := v_existing_event."eventHeaderUrl";
    v_final_poster_url := v_existing_event."eventPoster";
    v_final_start_date := v_existing_event."eventStartDate";
    v_final_end_date := v_existing_event."eventEndDate";
    v_final_venue := v_existing_event."venue";
    v_final_event_type := v_existing_event."eventType";
    v_final_registration_fee := v_existing_event."registrationFee";

  -- C) Published + not finished
  ELSE
    IF p_registration_fee IS NOT NULL
       AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for published events.';
    END IF;

    IF v_final_event_type IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot change Event Type for published events. Once published, the type is locked.';
    END IF;

    v_final_registration_fee := v_existing_event."registrationFee";
    v_final_event_type := v_existing_event."eventType";
  END IF;

  -- 5) Update
  UPDATE "Event"
  SET
    "eventTitle" = v_final_title,
    "description" = v_final_description,
    "eventHeaderUrl" = v_final_header_url,
    "eventPoster" = v_final_poster_url,
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
$function$
;

CREATE OR REPLACE FUNCTION public.approve_membership_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application record;
  v_member_id uuid;
  v_linked_count integer := 0;
BEGIN
  SELECT *
  INTO v_application
  FROM "public"."Application"
  WHERE "applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application."businessMemberId" IS NOT NULL THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application."sectorId" IS NULL THEN
    RAISE EXCEPTION 'Sector ID is required to approve application';
  END IF;

  INSERT INTO "public"."BusinessMember" (
    "businessName",
    "sectorId",
    "websiteURL",
    "logoImageURL",
    "joinDate",
    "primaryApplicationId"
  )
  VALUES (
    v_application."companyName",
    v_application."sectorId",
    COALESCE(v_application."websiteURL", ''),
    v_application."logoImageURL",
    CURRENT_DATE,
    v_application."applicationId"
  )
  RETURNING "businessMemberId" INTO v_member_id;

  -- Approve the current application
  UPDATE "public"."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  -- Link previous rejected applications to this business member history
  -- using both companyName and emailAddress to reduce false matches.
  UPDATE "public"."Application" a
  SET "businessMemberId" = v_member_id
  WHERE a."businessMemberId" IS NULL
    AND a."applicationStatus" = 'rejected'
    AND a."applicationId" <> p_application_id
    AND lower(trim(a."companyName")) = lower(trim(v_application."companyName"))
    AND lower(trim(a."emailAddress")) = lower(trim(v_application."emailAddress"));

  GET DIAGNOSTICS v_linked_count = ROW_COUNT;

  RETURN QUERY
  SELECT
    v_member_id,
    format(
      'Application approved successfully. Linked %s rejected application(s) to history.',
      v_linked_count
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_application_status(p_application_identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'applicationId', a."applicationId",
    'identifier', a.identifier,
    'applicationStatus', a."applicationStatus",
    'applicationDate', a."applicationDate",
    'companyName', a."companyName",
    'hasInterview', CASE WHEN a."interviewId" IS NOT NULL THEN true ELSE false END,
    'interview', CASE
      WHEN i."interviewId" IS NOT NULL THEN
        jsonb_build_object(
          'interviewId', i."interviewId",
          'interviewDate', i."interviewDate",
          'interviewVenue', i."interviewVenue",
          'status', i.status,
          'createdAt', i."createdAt"
        )
      ELSE NULL
    END
  )
  INTO v_result
  FROM "Application" a
  LEFT JOIN "Interview" i ON a."interviewId" = i."interviewId"
  WHERE a.identifier = p_application_identifier;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Application with identifier % does not exist.', p_application_identifier;
  END IF;
  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to check application status: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_member_exists(p_identifier text, p_application_type text DEFAULT 'renewal'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_member record;
  v_normalized_identifier text;
  v_application_type text;
BEGIN
  v_normalized_identifier := lower(trim(p_identifier));
  v_application_type := lower(trim(p_application_type));

  IF v_normalized_identifier IS NULL OR v_normalized_identifier = '' THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier is required'
    );
  END IF;

  IF v_application_type NOT IN ('renewal', 'updating') THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Invalid application type. Expected renewal or updating'
    );
  END IF;

  SELECT
    "businessMemberId",
    "identifier",
    "businessName",
    "membershipStatus"
  INTO v_member
  FROM "BusinessMember"
  WHERE lower("identifier") = v_normalized_identifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier not found'
    );
  END IF;

  IF v_application_type = 'renewal' THEN
    -- Renewal: only cancelled members are eligible
    IF v_member."membershipStatus" != 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member."businessName",
        'membershipStatus', v_member."membershipStatus",
        'businessMemberIdentifier', v_member."identifier",
        'businessMemberId', v_member."businessMemberId",
        'message', 'Only cancelled memberships are eligible for renewal'
      );
    END IF;
  ELSE
    -- Updating: member must not be cancelled
    IF v_member."membershipStatus" = 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member."businessName",
        'membershipStatus', v_member."membershipStatus",
        'businessMemberIdentifier', v_member."identifier",
        'businessMemberId', v_member."businessMemberId",
        'message', 'cancelled memberships must renew first before updating information'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'companyName', v_member."businessName",
    'membershipStatus', v_member."membershipStatus",
    'businessMemberIdentifier', v_member."identifier",
    'businessMemberId', v_member."businessMemberId"
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Unable to validate Business Member Identifier at this time'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_membership_expiry()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.process_membership_statuses(NOW());
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_primary_application_id(p_member_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT a."applicationId"
  FROM public."Application" a
  WHERE a."memberId" = p_member_id
  ORDER BY
    CASE a."applicationStatus"
      WHEN 'approved' THEN 3
      WHEN 'pending' THEN 2
      WHEN 'new' THEN 1
      ELSE 0
    END DESC,
    a."applicationDate" DESC
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.create_sponsored_registration(p_event_id uuid, p_sponsored_by text, p_fee_deduction numeric, p_max_sponsored_guests bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row public."SponsoredRegistration"%ROWTYPE;
BEGIN
  -- Validation: reject negative fee deduction
  IF p_fee_deduction IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'feeDeduction is required'
    );
  END IF;

  IF p_fee_deduction < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'feeDeduction cannot be negative'
    );
  END IF;

  INSERT INTO public."SponsoredRegistration" (
    "eventId",
    "sponsoredBy",
    "feeDeduction",
    "maxSponsoredGuests",
    "status",
    "uuid"
  )
  VALUES (
    p_event_id,
    p_sponsored_by,
    p_fee_deduction,
    p_max_sponsored_guests,
    'active'::public."SponsoredRegistrationStatus",
    gen_random_uuid()::text
  )
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'success', true,
    'data', to_jsonb(v_row)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_evaluation(eval_id uuid)
 RETURNS TABLE(success boolean, message text)
 LANGUAGE plpgsql
AS $function$
declare
  deleted_count int;
begin
  delete from "EvaluationForm"
  where "evaluationId" = eval_id;

  get diagnostics deleted_count = row_count;

  if deleted_count = 0 then
    return query select false, 'Evaluation not found'::text;
  else
    return query select true, 'Evaluation deleted successfully'::text;
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_sr(p_sponsored_registration_id uuid)
 RETURNS json
 LANGUAGE sql
AS $function$
  delete from public."SponsoredRegistration"
  where "sponsoredRegistrationId" = p_sponsored_registration_id
  returning json_build_object(
    'result', json_build_object(
      'success', true
    )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.generate_member_identifier()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW."identifier" IS NULL THEN
    NEW."identifier" := 'ibc-mem-' || left(replace(NEW."businessMemberId"::text, '-', ''), 8);
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_evaluations()
 RETURNS TABLE(evaluation_id uuid, event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, venue text, name text, q1_rating public."ratingScale", q2_rating public."ratingScale", q3_rating public."ratingScale", q4_rating public."ratingScale", q5_rating public."ratingScale", q6_rating public."ratingScale", additional_comments text, feedback text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
  select
    ef."evaluationId",
    e."eventId",
    e."eventTitle",
    e."eventStartDate",
    e."eventEndDate",
    e."venue",
    ef."name",
    ef."q1Rating",
    ef."q2Rating",
    ef."q3Rating",
    ef."q4Rating",
    ef."q5Rating",
    ef."q6Rating",
    ef."additionalComments",
    ef."feedback",
    ef."createdAt"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  order by
    ef."createdAt" desc;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_sponsored_registrations()
 RETURNS TABLE(sponsored_registration_id uuid, event_id uuid, event_name text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, sponsored_by text, uuid uuid, max_sponsored_guests integer, used_count integer, status text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    sr.sponsored_registration_id,
    sr.event_id,
    e.event_title,
    e.event_start_date,
    e.event_end_date,
    sr.sponsored_by,
    sr.uuid,
    sr.max_sponsored_guests,
    sr.used_count,
    sr.status,
    sr.created_at,
    sr.updated_at
  FROM "SponsoredRegistration" sr
  LEFT JOIN "Event" e ON sr.event_id = e.event_id
  ORDER BY sr.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_sponsored_registrations_with_event()
 RETURNS TABLE(sponsored_registration_id uuid, event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, sponsored_by text, uuid uuid, max_sponsored_guests bigint, used_count bigint, status public."SponsoredRegistrationStatus", created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
SELECT
  sr."sponsoredRegistrationId"::uuid,
  sr."eventId"::uuid,
  e."eventTitle",
  e."eventStartDate",
  e."eventEndDate",
  sr."sponsoredBy",
  sr."uuid"::uuid,
  sr."maxSponsoredGuests",
  sr."usedCount",
  sr."status"::"SponsoredRegistrationStatus",
  sr."createdAt",
  sr."updatedAt"
FROM "SponsoredRegistration" sr
LEFT JOIN "Event" e ON sr."eventId" = e."eventId"
ORDER BY sr."createdAt" DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_application_history(p_member_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_result jsonb;
  v_business_name text;
  v_applications jsonb;
BEGIN
  -- Get business name
  SELECT "businessName" INTO v_business_name
  FROM "BusinessMember"
  WHERE "businessMemberId" = p_member_id;

  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'Business member not found';
  END IF;

  -- Get all applications for this member with related data
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'applicationId', a."applicationId",
      'identifier', a."identifier",
      'companyName', a."companyName",
      'applicationDate', a."applicationDate",
      'applicationType', a."applicationType",
      'applicationStatus', a."applicationStatus",
      'applicationMemberType', a."applicationMemberType",
      'companyAddress', a."companyAddress",
      'emailAddress', a."emailAddress",
      'mobileNumber', a."mobileNumber",
      'landline', a."landline",
      'websiteURL', a."websiteURL",
      'paymentMethod', a."paymentMethod",
      'paymentProofStatus', a."paymentProofStatus",
      'sectorName', COALESCE(s."sectorName", 'N/A'),
      'members', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'applicationMemberId', am."applicationMemberId",
            'firstName', am."firstName",
            'lastName', am."lastName",
            'companyDesignation', am."companyDesignation",
            'companyMemberType', am."companyMemberType",
            'emailAddress', am."emailAddress"
          )
        ), '[]'::jsonb)
        FROM "ApplicationMember" am
        WHERE am."applicationId" = a."applicationId"
      )
    ) ORDER BY a."applicationDate" DESC
  ), '[]'::jsonb)
  INTO v_applications
  FROM "Application" a
  LEFT JOIN "Sector" s ON a."sectorId" = s."sectorId"
  WHERE a."businessMemberId" = p_member_id;

  v_result := jsonb_build_object(
    'businessName', v_business_name,
    'applications', v_applications
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to fetch application history: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_evaluation_by_id(eval_id uuid)
 RETURNS TABLE(evaluation_id uuid, event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone, venue text, name text, q1_rating public."ratingScale", q2_rating public."ratingScale", q3_rating public."ratingScale", q4_rating public."ratingScale", q5_rating public."ratingScale", q6_rating public."ratingScale", additional_comments text, feedback text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
  select
    ef."evaluationId",
    e."eventId",
    e."eventTitle",
    e."eventStartDate",
    e."eventEndDate",
    e."venue",
    ef."name",
    ef."q1Rating",
    ef."q2Rating",
    ef."q3Rating",
    ef."q4Rating",
    ef."q5Rating",
    ef."q6Rating",
    ef."additionalComments",
    ef."feedback",
    ef."createdAt"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  where
    ef."evaluationId" = eval_id;
$function$
;

CREATE OR REPLACE FUNCTION public.get_events_for_select()
 RETURNS TABLE(event_id uuid, event_title text, event_start_date timestamp with time zone, event_end_date timestamp with time zone)
 LANGUAGE sql
 STABLE
AS $function$
SELECT
  e."eventId"::uuid,
  e."eventTitle",
  e."eventStartDate",
  e."eventEndDate"
FROM "Event" e
WHERE e."eventStartDate" > now()
ORDER BY e."eventStartDate" ASC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_member_primary_application(p_member_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT public.compute_primary_application_id(p_member_id);
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

CREATE OR REPLACE FUNCTION public.get_sponsored_registration_by_id(registration_id uuid)
 RETURNS SETOF public."SponsoredRegistration"
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM "SponsoredRegistration"
  WHERE "sponsoredRegistrationId" = registration_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sponsored_registration_by_uuid(p_uuid text)
 RETURNS TABLE("sponsoredRegistrationId" uuid, uuid text, "eventId" uuid, "sponsoredBy" text, "feeDeduction" numeric, "maxSponsoredGuests" bigint, "usedCount" bigint, status public."SponsoredRegistrationStatus", "createdAt" timestamp with time zone, "updatedAt" timestamp with time zone)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    sr."sponsoredRegistrationId",
    sr."uuid",
    sr."eventId",
    sr."sponsoredBy",
    sr."feeDeduction",
    sr."maxSponsoredGuests",
    sr."usedCount",
    sr."status",
    sr."createdAt",
    sr."updatedAt"
  FROM public."SponsoredRegistration" sr
  WHERE sr."uuid" = p_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sponsored_registration_by_uuid(p_uuid uuid)
 RETURNS TABLE("sponsoredRegistrationId" uuid, uuid uuid, "eventId" uuid, "sponsoredBy" text, "feeDeduction" numeric, "maxSponsoredGuests" bigint, "usedCount" bigint, status public."SponsoredRegistrationStatus", "createdAt" timestamp with time zone, "updatedAt" timestamp with time zone)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    sr."sponsoredRegistrationId",
    sr."uuid",
    sr."eventId",
    sr."sponsoredBy",
    sr."feeDeduction",
    sr."maxSponsoredGuests",
    sr."usedCount",
    sr."status",
    sr."createdAt",
    sr."updatedAt"
  FROM public."SponsoredRegistration" sr
  WHERE sr."uuid" = p_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sponsored_registrations_with_details(p_event_id uuid)
 RETURNS TABLE(id uuid, event_id uuid, sponsor_id uuid, registration_id uuid, status text, created_at timestamp with time zone, updated_at timestamp with time zone, sponsor_name text, registration_email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.event_id,
    sr.sponsor_id,
    sr.registration_id,
    sr.status,
    sr.created_at,
    sr.updated_at,
    s.name as sponsor_name,
    r.email as registration_email
  FROM sponsored_registrations sr
  LEFT JOIN sponsors s ON sr.sponsor_id = s.id
  LEFT JOIN registrations r ON sr.registration_id = r.id
  WHERE sr.event_id = p_event_id
  ORDER BY sr.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sr_by_event_id(p_event_id uuid)
 RETURNS SETOF public."SponsoredRegistration"
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT *
  FROM "SponsoredRegistration"
  WHERE "eventId" = p_event_id
  ORDER BY "createdAt" DESC;
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
DECLARE
    one_year_ago date;
BEGIN
    -- Function is intended to run on January 1st via scheduler.
    -- New status terms:
    -- paid (joined < 1 year) -> unpaid
    -- unpaid (joined > 1 year) -> cancelled
    one_year_ago := (NOW() - INTERVAL '1 year')::date;

    UPDATE "BusinessMember"
    SET "membershipStatus" =
        CASE
            WHEN "membershipStatus" = 'paid'::"MembershipStatus"
                 AND "joinDate"::date > one_year_ago
            THEN 'unpaid'::"MembershipStatus"
            WHEN "membershipStatus" = 'unpaid'::"MembershipStatus"
                 AND "joinDate"::date <= one_year_ago
            THEN 'cancelled'::"MembershipStatus"
            ELSE "membershipStatus"
        END
    WHERE "membershipStatus" IN ('paid'::"MembershipStatus", 'unpaid'::"MembershipStatus");
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

CREATE OR REPLACE FUNCTION public.schedule_interviews_batch(p_interview_data jsonb)
 RETURNS TABLE(success boolean, message text, interview_count integer)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_interview_count integer := 0;
  v_updated_count integer := 0;
BEGIN
  -- Insert all interviews in a single operation
  INSERT INTO "public"."Interview" (
    "applicationId",
    "interviewDate",
    "interviewVenue",
    "status"
  )
  SELECT
    (item->>'applicationId')::uuid,
    (item->>'interviewDate')::timestamptz,
    item->>'interviewVenue',
    'scheduled'
  FROM jsonb_array_elements(p_interview_data) AS item
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_interview_count = ROW_COUNT;

  -- Link interviews to applications in a single bulk operation using a CTE
  -- This ensures all targeted Application rows receive their interviewId atomically
  WITH inserted_interviews AS (
    SELECT
      "interviewId",
      "applicationId"
    FROM "public"."Interview"
    WHERE "applicationId" IN (
      SELECT (item->>'applicationId')::uuid
      FROM jsonb_array_elements(p_interview_data) AS item
    )
    AND "status" = 'scheduled'
  )
  UPDATE "public"."Application" app
  SET "interviewId" = ii."interviewId"
  FROM inserted_interviews ii
  WHERE app."applicationId" = ii."applicationId";

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Verify row counts match to detect partial updates
  IF v_updated_count <> v_interview_count THEN
    RAISE EXCEPTION 'Interview linking mismatch: inserted %, updated %', v_interview_count, v_updated_count;
  END IF;

  RETURN QUERY SELECT
    true,
    format('Scheduled %s interview(s) and linked to applications', v_interview_count),
    v_interview_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_membership_expiry()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    IF NEW."lastPaymentDate" IS NOT NULL THEN
        NEW."membershipExpiryDate" =
            DATE_TRUNC('year', NEW."lastPaymentDate")
            + INTERVAL '1 year';
        NEW."membershipStatus" = 'paid'::"MembershipStatus";
    END IF;
    RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.submit_evaluation_form(p_event_id uuid, p_name text, p_q1_rating public."ratingScale", p_q2_rating public."ratingScale", p_q3_rating public."ratingScale", p_q4_rating public."ratingScale", p_q5_rating public."ratingScale", p_q6_rating public."ratingScale", p_additional_comments text DEFAULT NULL::text, p_feedback text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_evaluation_id uuid;
  v_name text;
BEGIN

  -- 1. Validate Inputs
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'Event ID is required.';
  END IF;

  v_name := COALESCE(NULLIF(TRIM(p_name), ''), 'Anonymous Participant');

  -- 2. Insert into "EvaluationForm" Table
  INSERT INTO "EvaluationForm" (
    "eventId",
    "name",
    "q1Rating",
    "q2Rating",
    "q3Rating",
    "q4Rating",
    "q5Rating",
    "q6Rating",
    "additionalComments",
    "feedback",
    "createdAt"
  ) VALUES (
    p_event_id,
    p_name,
    p_q1_rating,
    p_q2_rating,
    p_q3_rating,
    p_q4_rating,
    p_q5_rating,
    p_q6_rating,
    p_additional_comments,
    p_feedback,
    NOW()
  )
  RETURNING "evaluationId" INTO v_evaluation_id;  -- Change "id" to your actual PK column name

  -- 3. Return Success
  RETURN jsonb_build_object(
    'evaluationId', v_evaluation_id,
    'status', 'success',
    'message', 'Evaluation submitted successfully.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Evaluation submission failed: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_application_member_type text, p_payment_proof_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application_id uuid;
  v_identifier text;
  v_app_type_enum "ApplicationType";
  v_pay_method_enum "PaymentMethod";
  v_pay_status_enum "PaymentProofStatus";
  v_sector_id int;
  v_business_member_id uuid;
  v_member_exists boolean;
  representative jsonb;
  v_rep_type_text text;
BEGIN

  -- Generate UUID for application ID
  v_application_id := gen_random_uuid();

  -- Generate human-readable identifier: ibc-app-XXXXXXXX (first 8 chars of UUID)
  v_identifier := 'ibc-app-' || left(replace(v_application_id::text, '-', ''), 8);

  -- 1. Validate Inputs & Enums
  v_app_type_enum := p_application_type::"ApplicationType";
  v_pay_method_enum := p_payment_method::"PaymentMethod";
  v_pay_status_enum := 'pending'::"PaymentProofStatus";

  -- Validate: Online payment requires proof (Checking against 'BPI')
  IF v_pay_method_enum = 'BPI' AND (p_payment_proof_url IS NULL OR p_payment_proof_url = '') THEN
    RAISE EXCEPTION 'Proof of payment is required for online transactions.';
  END IF;

  -- Extract Sector ID
  v_sector_id := (p_company_details->>'sectorId')::int;

  -- Extract Business Member ID (for renewals and updates)
  IF p_company_details->>'businessMemberId' IS NOT NULL AND p_company_details->>'businessMemberId' != '' THEN
    v_business_member_id := (p_company_details->>'businessMemberId')::uuid;
  ELSE
    v_business_member_id := NULL;
  END IF;

  -- 2. Validate Business Member ID for Renewal and Update Info applications
  IF v_app_type_enum IN ('renewal', 'updating') THEN
    -- Business Member ID is required for renewal and updating
    IF v_business_member_id IS NULL THEN
      RAISE EXCEPTION 'Member ID is required for % applications.', p_application_type;
    END IF;

    -- Check if member exists in BusinessMember table
    SELECT EXISTS(
      SELECT 1 FROM "BusinessMember" WHERE "businessMemberId" = v_business_member_id
    ) INTO v_member_exists;

    IF NOT v_member_exists THEN
      RAISE EXCEPTION 'Member ID % does not exist. Please provide a valid IBC Member ID.', v_business_member_id;
    END IF;
  END IF;

  -- 3. Insert into "Application" Table
  INSERT INTO "Application" (
    "applicationId",
    "identifier",
    "businessMemberId",
    "sectorId",
    "logoImageURL",
    "applicationDate",
    "applicationType",
    "companyName",
    "companyAddress",
    "landline",
    "mobileNumber",
    "emailAddress",
    "paymentProofStatus",
    "paymentMethod",
    "websiteURL",
    "applicationMemberType"
  ) VALUES (
    v_application_id,
    v_identifier,
    v_business_member_id,
    v_sector_id,
    p_company_details->>'logoImageURL',
    NOW(),
    v_app_type_enum,
    p_company_details->>'name',
    p_company_details->>'address',
    p_company_details->>'landline',
    p_company_details->>'mobile',
    p_company_details->>'email',
    v_pay_status_enum,
    v_pay_method_enum,
    p_company_details->>'websiteURL',
    p_application_member_type::"ApplicationMemberType"
  );

  -- 4. Handle Proof of Payment
  IF v_pay_method_enum = 'BPI' THEN
    INSERT INTO "ProofImage" ("applicationId", "path")
    VALUES (v_application_id, p_payment_proof_url);
  END IF;

  -- 5. Insert Representatives
  IF jsonb_array_length(p_representatives) > 0 THEN
    FOR representative IN SELECT * FROM jsonb_array_elements(p_representatives)
    LOOP

      -- Extract the type (principal or alternate)
      v_rep_type_text := representative->>'memberType';

      INSERT INTO "ApplicationMember" (
        "applicationId",
        "companyMemberType",
        "firstName",
        "lastName",
        "mailingAddress",
        "sex",
        "nationality",
        "birthdate",
        "companyDesignation",
        "landline",
        "mobileNumber",
        "emailAddress"
      ) VALUES (
        v_application_id,
        v_rep_type_text::"CompanyMemberType",
        representative->>'firstName',
        representative->>'lastName',
        representative->>'mailingAddress',
        representative->>'sex',
        representative->>'nationality',
        (representative->>'birthdate')::timestamp,
        representative->>'position',
        representative->>'landline',
        representative->>'mobileNumber',
        representative->>'email'
      );
    END LOOP;
  END IF;

  -- 6. Return Success with application type info
  RETURN jsonb_build_object(
    'applicationId', v_application_id,
    'identifier', v_identifier,
    'applicationType', p_application_type,
    'businessMemberId', v_business_member_id,
    'status', 'success',
    'message', CASE v_app_type_enum
      WHEN 'newMember' THEN 'New membership application submitted successfully.'
      WHEN 'renewal' THEN 'Membership renewal application submitted successfully.'
      WHEN 'updating' THEN 'Information update request submitted successfully. Processing fee: ₱2,000.00'
      ELSE 'Application submitted successfully.'
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Application submission failed: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_sr_status(p_sponsored_registration_id uuid)
 RETURNS json
 LANGUAGE sql
AS $function$
  update public."SponsoredRegistration"
  set status = case
    when status = 'active'::"SponsoredRegistrationStatus" then 'disabled'::"SponsoredRegistrationStatus"
    else 'active'::"SponsoredRegistrationStatus"
  end,
  "updatedAt" = now() at time zone 'utc'
  where "sponsoredRegistrationId" = p_sponsored_registration_id
  returning json_build_object(
    'result', json_build_object(
      'sponsoredRegistrationId', "sponsoredRegistrationId",
      'uuid', uuid,
      'eventId', "eventId",
      'sponsoredBy', "sponsoredBy",
      'feeDeduction', "feeDeduction",
      'maxSponsoredGuests', "maxSponsoredGuests",
      'usedCount', "usedCount",
      'status', status,
      'createdAt', "createdAt",
      'updatedAt', "updatedAt"
    )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.update_event_available_slots_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_event_id UUID;
    v_total_participants BIGINT;
    v_max_guest INTEGER;
BEGIN
    -- Determine which event was affected
    IF (TG_OP = 'DELETE') THEN
        v_event_id := OLD."eventId";
    ELSE
        v_event_id := NEW."eventId";
    END IF;

    -- Get total participants for this event across all registrations
    SELECT COALESCE(SUM("numberOfParticipants"), 0)
    INTO v_total_participants
    FROM "Registration"
    WHERE "eventId" = v_event_id;

    -- Get maxGuest for this event
    SELECT COALESCE("maxGuest", 0)
    INTO v_max_guest
    FROM "Event"
    WHERE "eventId" = v_event_id;

    -- Update availableSlots: maxGuest - total participants, ensuring it doesn't go below 0
    UPDATE "Event"
    SET "availableSlots" = GREATEST(0, v_max_guest - v_total_participants)
    WHERE "eventId" = v_event_id;

    -- Return appropriate record
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_participant_count_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE "Registration"
        SET "numberOfParticipants" = (
            SELECT COUNT(*) FROM "Participant" WHERE "registrationId" = NEW."registrationId"
        )
        WHERE "registrationId" = NEW."registrationId";
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE "Registration"
        SET "numberOfParticipants" = (
            SELECT COUNT(*) FROM "Participant" WHERE "registrationId" = OLD."registrationId"
        )
        WHERE "registrationId" = OLD."registrationId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_primary_application_for_member()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  affected_member uuid;
BEGIN
  affected_member := COALESCE(NEW."businessMemberId", OLD."businessMemberId");

  IF affected_member IS NOT NULL THEN
    UPDATE "BusinessMember"
    SET "primaryApplicationId" = (
      SELECT "applicationId"
      FROM "Application"
      WHERE "businessMemberId" = affected_member
      ORDER BY "applicationDate" DESC
      LIMIT 1
    )
    WHERE "businessMemberId" = affected_member;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_sponsored_registration_used_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_sponsored_registration_id UUID;
  v_new_count INT;
BEGIN
  -- Determine which sponsored registration ID to update
  IF (TG_OP = 'DELETE') THEN
    v_sponsored_registration_id := OLD."sponsoredRegistrationId";
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle both old and new sponsored registration IDs if they differ
    IF OLD."sponsoredRegistrationId" IS DISTINCT FROM NEW."sponsoredRegistrationId" THEN
      -- Update count for old sponsored registration
      IF OLD."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(*)::INT
          FROM public."Registration"
          WHERE "sponsoredRegistrationId" = OLD."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = OLD."sponsoredRegistrationId";
      END IF;

      -- Update count for new sponsored registration
      IF NEW."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(*)::INT
          FROM public."Registration"
          WHERE "sponsoredRegistrationId" = NEW."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = NEW."sponsoredRegistrationId";
      END IF;

      RETURN NEW;
    END IF;
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  ELSE -- INSERT
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  END IF;

  -- Update the usedCount for the affected sponsored registration
  IF v_sponsored_registration_id IS NOT NULL THEN
    UPDATE public."SponsoredRegistration"
    SET "usedCount" = (
      SELECT COUNT(*)::INT
      FROM public."Registration"
      WHERE "sponsoredRegistrationId" = v_sponsored_registration_id
    )
    WHERE "sponsoredRegistrationId" = v_sponsored_registration_id;
  END IF;

  -- Return appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_sponsored_registration_used_count_from_participant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_sponsored_registration_id UUID;
  v_registration_id UUID;
BEGIN
  -- Get the registration ID
  IF (TG_OP = 'DELETE') THEN
    v_registration_id := OLD."registrationId";
  ELSE
    v_registration_id := NEW."registrationId";
  END IF;

  -- Get the sponsored registration ID from the registration
  SELECT "sponsoredRegistrationId" INTO v_sponsored_registration_id
  FROM public."Registration"
  WHERE "registrationId" = v_registration_id;

  -- Update the usedCount if this registration is sponsored
  IF v_sponsored_registration_id IS NOT NULL THEN
    UPDATE public."SponsoredRegistration"
    SET "usedCount" = (
      SELECT COUNT(p."participantId")::INT
      FROM public."Registration" r
      INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
      WHERE r."sponsoredRegistrationId" = v_sponsored_registration_id
    )
    WHERE "sponsoredRegistrationId" = v_sponsored_registration_id;
  END IF;

  -- Return appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_sponsored_registration_used_count_from_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_sponsored_registration_id UUID;
BEGIN
  -- Determine which sponsored registration ID to update
  IF (TG_OP = 'DELETE') THEN
    v_sponsored_registration_id := OLD."sponsoredRegistrationId";
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle both old and new sponsored registration IDs if they differ
    IF OLD."sponsoredRegistrationId" IS DISTINCT FROM NEW."sponsoredRegistrationId" THEN
      -- Update count for old sponsored registration (count participants)
      IF OLD."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(p."participantId")::INT
          FROM public."Registration" r
          INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
          WHERE r."sponsoredRegistrationId" = OLD."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = OLD."sponsoredRegistrationId";
      END IF;

      -- Update count for new sponsored registration (count participants)
      IF NEW."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(p."participantId")::INT
          FROM public."Registration" r
          INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
          WHERE r."sponsoredRegistrationId" = NEW."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = NEW."sponsoredRegistrationId";
      END IF;

      RETURN NEW;
    END IF;
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  ELSE -- INSERT
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  END IF;

  -- Update the usedCount for the affected sponsored registration (count participants)
  IF v_sponsored_registration_id IS NOT NULL THEN
    UPDATE public."SponsoredRegistration"
    SET "usedCount" = (
      SELECT COUNT(p."participantId")::INT
      FROM public."Registration" r
      INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
      WHERE r."sponsoredRegistrationId" = v_sponsored_registration_id
    )
    WHERE "sponsoredRegistrationId" = v_sponsored_registration_id;
  END IF;

  -- Return appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$
;


  create policy "Give anon users access to images in folder 19dgg40_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using (((bucket_id = 'logoimage'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));
