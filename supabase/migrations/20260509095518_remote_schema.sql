drop index if exists "public"."Sector_sectorName_normalized_unique";

drop index if exists "public"."idx_registration_exceeded_sponsored_slots";

alter table "public"."Registration" alter column "sponsorshipType" type "public"."SponsorshipType" using "sponsorshipType"::text::"public"."SponsorshipType";

alter table "public"."Registration" alter column "exceededSponsoredSlots" drop default;

alter table "public"."Registration" alter column "sponsorshipType" drop default;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_membership_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$DECLARE
  v_existing_business_member_id uuid;
  v_company_name text;
  v_email_address text;
  v_sector_name text;
  v_website_url text;
  v_logo_image_url text;
  v_member_id uuid;
  v_linked_count integer := 0;
  v_sector_id bigint;
BEGIN
  SELECT
    a."businessMemberId",
    a."companyName",
    a."emailAddress",
    a."sectorName",
    a."websiteURL",
    a."logoImageURL"
  INTO
    v_existing_business_member_id,
    v_company_name,
    v_email_address,
    v_sector_name,
    v_website_url,
    v_logo_image_url
  FROM public."Application" a
  WHERE a."applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_existing_business_member_id IS NOT NULL THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_sector_name IS NULL OR btrim(v_sector_name) = '' THEN
    RAISE EXCEPTION 'Sector name is required to approve application';
  END IF;

  SELECT s."sectorId"
  INTO v_sector_id
  FROM public."Sector" s
  WHERE lower(btrim(s."sectorName")) = lower(btrim(v_sector_name))
  ORDER BY s."sectorId"
  LIMIT 1;

  IF v_sector_id IS NULL THEN
    RAISE EXCEPTION
      'Sector "%" is not available. Please update the application to a valid sector before approval.',
      v_sector_name;
  END IF;

  INSERT INTO public."BusinessMember" (
    "businessName",
    "sectorId",
    "websiteURL",
    "logoImageURL",
    "joinDate",
    "primaryApplicationId"
  )
  VALUES (
    v_company_name,
    v_sector_id,
    COALESCE(v_website_url, ''),
    v_logo_image_url,
    CURRENT_DATE,
    p_application_id
  )
  RETURNING "businessMemberId" INTO v_member_id;

  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  UPDATE public."Application" a
  SET "businessMemberId" = v_member_id
  WHERE a."businessMemberId" IS NULL
    AND a."applicationStatus" = 'rejected'
    AND a."applicationId" <> p_application_id
    AND lower(trim(a."companyName")) = lower(trim(v_company_name))
    AND lower(trim(a."emailAddress")) = lower(trim(v_email_address));

  GET DIAGNOSTICS v_linked_count = ROW_COUNT;

  RETURN QUERY
  SELECT
    v_member_id,
    format(
      'Application approved successfully. Linked %s rejected application(s) to history.',
      v_linked_count
    );
END;$function$
;

CREATE OR REPLACE FUNCTION public.approve_membership_renewal_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$DECLARE
  v_application_business_member_id uuid;
  v_application_type text;
  v_application_status text;
  v_application_company_name text;
  v_application_sector_name text;
  v_application_website_url text;
  v_application_logo_image_url text;

  v_member_membership_status text;
  v_member_id uuid;
  v_sector_id bigint;
BEGIN
  SELECT
    a."businessMemberId",
    a."applicationType"::text,
    a."applicationStatus"::text,
    a."companyName",
    a."sectorName",
    a."websiteURL",
    a."logoImageURL"
  INTO
    v_application_business_member_id,
    v_application_type,
    v_application_status,
    v_application_company_name,
    v_application_sector_name,
    v_application_website_url,
    v_application_logo_image_url
  FROM public."Application" a
  WHERE a."applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application_type <> 'renewal' THEN
    RAISE EXCEPTION 'Invalid application type for renewal approval';
  END IF;

  IF v_application_status = 'approved' THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application_business_member_id IS NULL THEN
    RAISE EXCEPTION 'Renewal application must be linked to an existing business member';
  END IF;

  SELECT
    bm."businessMemberId",
    bm."membershipStatus"::text
  INTO
    v_member_id,
    v_member_membership_status
  FROM public."BusinessMember" bm
  WHERE bm."businessMemberId" = v_application_business_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked business member not found';
  END IF;

  IF v_member_membership_status <> 'cancelled' THEN
    RAISE EXCEPTION 'Only cancelled memberships are eligible for renewal';
  END IF;

  IF v_application_sector_name IS NOT NULL AND btrim(v_application_sector_name) <> '' THEN
    SELECT s."sectorId"
    INTO v_sector_id
    FROM public."Sector" s
    WHERE lower(btrim(s."sectorName")) = lower(btrim(v_application_sector_name))
    ORDER BY s."sectorId"
    LIMIT 1;

    IF v_sector_id IS NULL THEN
      RAISE EXCEPTION
        'Sector "%" is not available. Please update the application to a valid sector before approval.',
        v_application_sector_name;
    END IF;
  ELSE
    v_sector_id := NULL;
  END IF;

  UPDATE public."BusinessMember"
  SET
    "businessName" = COALESCE(NULLIF(v_application_company_name, ''), "businessName"),
    "sectorId" = COALESCE(v_sector_id, "sectorId"),
    "websiteURL" = COALESCE(NULLIF(v_application_website_url, ''), "websiteURL"),
    "logoImageURL" = COALESCE(NULLIF(v_application_logo_image_url, ''), "logoImageURL"),
    "membershipStatus" = 'paid'
  WHERE "businessMemberId" = v_member_id;

  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
  SELECT
    v_member_id,
    'Renewal approved successfully. Member status updated to paid.'::text;
END;$function$
;

CREATE OR REPLACE FUNCTION public.check_application_status(p_application_identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'applicationId', a."applicationId",
    'identifier', a."identifier",
    'applicationType', a."applicationType",
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
          'status', i."status",
          'createdAt', i."createdAt"
        )
      ELSE NULL
    END
  )
  INTO v_result
  FROM public."Application" a
  LEFT JOIN public."Interview" i
    ON a."interviewId" = i."interviewId"
  WHERE a."identifier" = p_application_identifier
  LIMIT 1;

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
AS $function$DECLARE
  v_result jsonb;
  v_business_name text;
  v_applications jsonb;
BEGIN
  SELECT "businessName"
  INTO v_business_name
  FROM "BusinessMember"
  WHERE "businessMemberId" = p_member_id;

  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'Business member not found';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
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
        'sectorName', COALESCE(NULLIF(a."sectorName", ''), 'N/A'),
        'members', (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'applicationMemberId', am."applicationMemberId",
                'firstName', am."firstName",
                'lastName', am."lastName",
                'companyDesignation', am."companyDesignation",
                'companyMemberType', am."companyMemberType",
                'emailAddress', am."emailAddress"
              )
            ),
            '[]'::jsonb
          )
          FROM "ApplicationMember" am
          WHERE am."applicationId" = a."applicationId"
        )
      )
      ORDER BY a."applicationDate" DESC
    ),
    '[]'::jsonb
  )
  INTO v_applications
  FROM "Application" a
  WHERE a."businessMemberId" = p_member_id;

  v_result := jsonb_build_object(
    'businessName', v_business_name,
    'applications', v_applications
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to fetch application history: %', SQLERRM;
END;$function$
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

CREATE OR REPLACE FUNCTION public.get_registration_list(p_event_id uuid, p_search_text text DEFAULT NULL::text, p_payment_proof_status public."PaymentProofStatus" DEFAULT NULL::public."PaymentProofStatus")
 RETURNS SETOF public.registration_list_item
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_search_pattern TEXT;
BEGIN
  PERFORM set_limit(0.3);

  IF p_search_text IS NOT NULL THEN
    v_search_pattern := '%' || p_search_text || '%';
  END IF;

  RETURN QUERY
  SELECT
    r."registrationId",
    COALESCE(bm."businessName", r."nonMemberName") AS affiliation,
    r."registrationDate",
    r."paymentProofStatus",
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
    r."identifier" AS registration_identifier
  FROM "Registration" r
  LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS total_people,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."participantId"::text END) AS principal_id,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."firstName" END) AS p_first_name,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."lastName" END) AS p_last_name,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p.email END) AS p_email
    FROM "Participant" sub_p
    WHERE sub_p."registrationId" = r."registrationId"
  ) p_data ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(bm."businessName", r."nonMemberName") AS affiliation,
      CASE
        WHEN p_search_text IS NOT NULL THEN
          GREATEST(
            similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text),
            similarity(p_data.p_first_name || ' ' || p_data.p_last_name, p_search_text),
            similarity(r."identifier", p_search_text)
          )
        ELSE 0
      END AS sim_score,
      CASE
        WHEN p_search_text IS NOT NULL THEN
          (
            COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
            OR (p_data.p_first_name || ' ' || p_data.p_last_name) ILIKE v_search_pattern
            OR p_data.p_email ILIKE v_search_pattern
            OR r."identifier" ILIKE v_search_pattern
          )
        ELSE FALSE
      END AS is_exact_match
  ) s ON true
  WHERE r."eventId" = p_event_id
    AND s.affiliation IS NOT NULL
    AND (
      p_payment_proof_status IS NULL
      OR r."paymentProofStatus" = p_payment_proof_status::"PaymentProofStatus"
    )
    AND (
      p_search_text IS NULL
      OR s.is_exact_match
      OR s.sim_score > 0.3
    )
  ORDER BY
    CASE WHEN p_search_text IS NOT NULL THEN s.is_exact_match ELSE FALSE END DESC,
    CASE WHEN p_search_text IS NOT NULL THEN s.sim_score ELSE 0 END DESC,
    r."registrationDate" DESC;
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
    ph_now timestamp;
    ph_year_start timestamptz;
BEGIN
    -- Compute Jan 1 using PH local time to avoid UTC boundary issues.
    ph_now := timezone('Asia/Manila', NOW());
    ph_year_start := (DATE_TRUNC('year', ph_now) AT TIME ZONE 'Asia/Manila');

    PERFORM public.process_membership_statuses(ph_year_start);
END;
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

CREATE OR REPLACE FUNCTION public.quick_onsite_registration(p_event_day_id uuid, p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_registrant jsonb DEFAULT '{}'::jsonb, p_remark text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_registration_id UUID;
  v_participant_id UUID;
  v_participant_identifier TEXT;
  v_event_day_belongs_to_event BOOLEAN;
BEGIN
  -- Ensure the event day exists and belongs to the provided event.
  SELECT EXISTS (
    SELECT 1
    FROM "EventDay" ed
    WHERE ed."eventDayId" = p_event_day_id
      AND ed."eventId" = p_event_id
  )
  INTO v_event_day_belongs_to_event;

  IF NOT v_event_day_belongs_to_event THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'Invalid event day for event',
      DETAIL = format(
        'event_day_id %s is not associated with event_id %s',
        p_event_day_id,
        p_event_id
      );
  END IF;

  INSERT INTO "Registration" (
    "eventId",
    "paymentMethod",
    "paymentProofStatus",
    "businessMemberId",
    "nonMemberName",
    "identifier",
    "registrationDate",
    "numberOfParticipants"
  ) VALUES (
    p_event_id,
    'ONSITE',
    'accepted',
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW(),
    1
  )
  RETURNING "registrationId" INTO v_registration_id;

  v_participant_identifier := 'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email,
    "participantIdentifier"
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email',
    v_participant_identifier
  )
  RETURNING "participantId" INTO v_participant_id;

  INSERT INTO "CheckIn" (
    "eventDayId",
    "participantId",
    "remarks",
    "checkInTime"
  ) VALUES (
    p_event_day_id,
    v_participant_id,
    p_remark,
    NOW()
  );

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'participantId', v_participant_id,
    'participantIdentifier', v_participant_identifier,
    'message', 'Registration created successfully'
  );
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

CREATE OR REPLACE FUNCTION public.submit_event_registration(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_paths jsonb DEFAULT '[]'::jsonb, p_registrant jsonb DEFAULT '{}'::jsonb, p_note text DEFAULT NULL::text, p_other_participants jsonb DEFAULT '[]'::jsonb, p_sponsored_registration_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_registration_id UUID;
  v_payment_proof_status "PaymentProofStatus";
  v_payment_method_enum "PaymentMethod";
  v_principal_participant_id UUID;
  v_principal_identifier TEXT;
  v_all_participants JSONB;
  v_other_count INTEGER;
BEGIN
  v_payment_method_enum := (
    CASE
      WHEN p_payment_method = 'online' THEN 'BPI'
      ELSE 'ONSITE'
    END
  )::"PaymentMethod";

  v_payment_proof_status := (
    CASE
      WHEN p_payment_method = 'online' THEN 'pending'
      ELSE 'accepted'
    END
  )::"PaymentProofStatus";

  v_other_count := jsonb_array_length(p_other_participants);

  INSERT INTO "Registration" (
    "eventId",
    "paymentMethod",
    "paymentProofStatus",
    "businessMemberId",
    "nonMemberName",
    "identifier",
    "note",
    "registrationDate",
    "sponsoredRegistrationId",
    "numberOfParticipants"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    p_note,
    NOW(),
    p_sponsored_registration_id,
    v_other_count + 1
  )
  RETURNING "registrationId" INTO v_registration_id;

  -- Insert multiple proof images with order index
  IF p_payment_method = 'online' AND jsonb_array_length(p_payment_paths) > 0 THEN
    INSERT INTO "ProofImage" (path, "registrationId", "orderIndex")
    SELECT
      path_item->>'path',
      v_registration_id,
      (row_number() OVER ()) - 1
    FROM jsonb_array_elements(p_payment_paths) AS path_item;
  END IF;

  -- Insert principal participant with generated identifier
  v_principal_identifier := 'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email,
    "participantIdentifier"
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email',
    v_principal_identifier
  )
  RETURNING "participantId" INTO v_principal_participant_id;

  v_all_participants := jsonb_build_array(
    jsonb_build_object(
      'participantId', v_principal_participant_id,
      'participantIdentifier', v_principal_identifier
    )
  );

  -- Insert additional participants with identifiers
  IF v_other_count > 0 THEN
    WITH inserted AS (
      INSERT INTO "Participant" (
        "registrationId",
        "isPrincipal",
        "firstName",
        "lastName",
        "contactNumber",
        email,
        "participantIdentifier"
      )
      SELECT
        v_registration_id,
        FALSE,
        registrant->>'firstName',
        registrant->>'lastName',
        registrant->>'contactNumber',
        registrant->>'email',
        'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
      FROM jsonb_array_elements(p_other_participants) AS registrant
      RETURNING "participantId", "participantIdentifier"
    )
    SELECT v_all_participants || jsonb_agg(
      jsonb_build_object(
        'participantId', "participantId",
        'participantIdentifier', "participantIdentifier"
      )
    )
    INTO v_all_participants
    FROM inserted;
  END IF;

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully',
    'participants', v_all_participants
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_application_member_type text, p_payment_proof_url text DEFAULT NULL::text, p_company_profile_type text DEFAULT 'website'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_application_id uuid;
  v_identifier text;
  v_app_type_enum "ApplicationType";
  v_pay_method_enum "PaymentMethod";
  v_pay_status_enum "PaymentProofStatus";
  v_requested_member_type "ApplicationMemberType";
  v_existing_member_type "ApplicationMemberType";
  v_requires_payment boolean := true;
  v_sector_name text;
  v_business_member_id uuid;
  v_profile_type "CompanyProfileType";
  representative jsonb;
  v_rep_type_text text;
BEGIN
  v_application_id := gen_random_uuid();
  v_identifier := 'ibc-app-' || left(replace(v_application_id::text, '-', ''), 8);

  v_app_type_enum := p_application_type::"ApplicationType";
  v_requested_member_type := p_application_member_type::"ApplicationMemberType";
  v_profile_type := COALESCE(p_company_profile_type, 'website')::"CompanyProfileType";

  v_sector_name := NULLIF(btrim(p_company_details->>'sectorName'), '');
  IF v_sector_name IS NULL THEN
    RAISE EXCEPTION 'Industry/Sector is required.';
  END IF;

  IF p_company_details->>'businessMemberId' IS NOT NULL
     AND btrim(p_company_details->>'businessMemberId') <> '' THEN
    v_business_member_id := (p_company_details->>'businessMemberId')::uuid;
  ELSE
    v_business_member_id := NULL;
  END IF;

  IF v_app_type_enum IN ('renewal', 'updating') THEN
    IF v_business_member_id IS NULL THEN
      RAISE EXCEPTION 'Member ID is required for % applications.', p_application_type;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM "BusinessMember"
      WHERE "businessMemberId" = v_business_member_id
    ) THEN
      RAISE EXCEPTION 'Member ID % does not exist.', v_business_member_id;
    END IF;
  END IF;

  IF v_app_type_enum = 'updating' THEN
    SELECT a."applicationMemberType"
    INTO v_existing_member_type
    FROM public."Application" a
    WHERE a."businessMemberId" = v_business_member_id
    ORDER BY a."applicationDate" DESC
    LIMIT 1;

    IF v_existing_member_type = 'corporate'::"ApplicationMemberType"
       AND v_requested_member_type = 'personal'::"ApplicationMemberType" THEN
      RAISE EXCEPTION 'Corporate memberships cannot be downgraded to personal.';
    END IF;

    v_requires_payment :=
      v_existing_member_type = 'personal'::"ApplicationMemberType"
      AND v_requested_member_type = 'corporate'::"ApplicationMemberType";
  ELSE
    v_requires_payment := true;
  END IF;

  v_pay_method_enum := (
    CASE
      WHEN v_app_type_enum = 'updating' AND NOT v_requires_payment THEN 'ONSITE'
      ELSE p_payment_method
    END
  )::"PaymentMethod";

  v_pay_status_enum := (
    CASE
      WHEN v_pay_method_enum = 'BPI' THEN 'pending'
      ELSE 'accepted'
    END
  )::"PaymentProofStatus";

  IF v_requires_payment
     AND v_pay_method_enum = 'BPI'
     AND (p_payment_proof_url IS NULL OR btrim(p_payment_proof_url) = '') THEN
    RAISE EXCEPTION 'Proof of payment is required for online transactions.';
  END IF;

  INSERT INTO "Application" (
    "applicationId",
    "identifier",
    "businessMemberId",
    "sectorName",
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
    "companyProfileType",
    "applicationMemberType"
  )
  VALUES (
    v_application_id,
    v_identifier,
    v_business_member_id,
    v_sector_name,
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
    v_profile_type,
    v_requested_member_type
  );

  IF v_requires_payment AND v_pay_method_enum = 'BPI' THEN
    INSERT INTO "ProofImage" ("applicationId", "path")
    VALUES (v_application_id, p_payment_proof_url);
  END IF;

  IF jsonb_array_length(COALESCE(p_representatives, '[]'::jsonb)) > 0 THEN
    FOR representative IN
      SELECT * FROM jsonb_array_elements(COALESCE(p_representatives, '[]'::jsonb))
    LOOP
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
      )
      VALUES (
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

  RETURN jsonb_build_object(
    'applicationId', v_application_id,
    'identifier', v_identifier,
    'applicationType', p_application_type,
    'businessMemberId', v_business_member_id,
    'requiresPayment', v_requires_payment,
    'status', 'success',
    'message', CASE
      WHEN v_app_type_enum = 'newMember' THEN 'New membership application submitted successfully.'
      WHEN v_app_type_enum = 'renewal' THEN 'Membership renewal application submitted successfully.'
      WHEN v_app_type_enum = 'updating' AND v_requires_payment THEN 'Corporate upgrade request submitted successfully. Upgrade fee: â‚±5,000.00'
      WHEN v_app_type_enum = 'updating' THEN 'Information update request submitted successfully. No payment is required.'
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
  v_is_finished := (
    v_existing_event."eventEndDate" IS NOT NULL
    AND CURRENT_TIMESTAMP > v_existing_event."eventEndDate"
  );

  -- 4. Calculate final values using COALESCE
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

  -- SCENARIO C: PUBLISHED EVENTS (Public/Private, not finished)
  ELSE
    IF p_registration_fee IS NOT NULL AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for published events.';
    END IF;

    -- Allow only one-way conversion from private to public for published events.
    IF v_final_event_type IS DISTINCT FROM v_existing_event."eventType" THEN
      IF NOT (
        v_existing_event."eventType" = 'private'
        AND v_final_event_type = 'public'
      ) THEN
        RAISE EXCEPTION 'Cannot change Event Type for published events. Only private-to-public conversion is allowed.';
      END IF;
    END IF;

    v_final_registration_fee := v_existing_event."registrationFee";
  END IF;

  -- 6. PERFORM UPDATE
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

CREATE OR REPLACE FUNCTION public.update_event_published_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF new."eventType" IS NULL then
        new."publishedAt" = null;
    else
        new."publishedAt" = now();
    end if;

    return NEW;
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_website_content_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_website_content(p_section public."WebsiteContentSection", p_entry_key text, p_text_type public."WebsiteContentTextType", p_text_value text DEFAULT NULL::text, p_icon text DEFAULT NULL::text, p_image_url text DEFAULT NULL::text, p_group text DEFAULT NULL::text, p_card_placement integer DEFAULT NULL::integer, p_is_active boolean DEFAULT true)
 RETURNS public."WebsiteContent"
 LANGUAGE plpgsql
AS $function$
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
$function$
;
