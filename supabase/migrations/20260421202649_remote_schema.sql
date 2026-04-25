drop trigger if exists "on_application_sync_primary" on "public"."Application";

drop trigger if exists "set_member_identifier" on "public"."BusinessMember";

drop trigger if exists "trigger_set_membership_expiry" on "public"."BusinessMember";

drop trigger if exists "on_event_change" on "public"."Event";

drop trigger if exists "on_event_publish" on "public"."Event";

drop trigger if exists "tr_update_participant_count" on "public"."Participant";

drop trigger if exists "tr_update_sponsored_registration_used_count_from_participant" on "public"."Participant";

drop trigger if exists "tr_update_sponsored_registration_used_count" on "public"."Registration";

drop trigger if exists "set_website_content_updated_at" on "public"."WebsiteContent";

drop policy "Event admin can delete sponsored registrations" on "public"."SponsoredRegistration";

drop policy "Event admin can update sponsored registrations" on "public"."SponsoredRegistration";

alter table "public"."Application" drop constraint "Application_businessMemberId_fkey";

alter table "public"."Application" drop constraint "Application_interviewId_fkey";

alter table "public"."ApplicationMember" drop constraint "ApplicationMember_applicationId_fkey";

alter table "public"."BusinessMember" drop constraint "BusinessMember_sectorId_fkey";

alter table "public"."CheckIn" drop constraint "CheckIn_eventDayId_fkey";

alter table "public"."CheckIn" drop constraint "CheckIn_participantId_fkey";

alter table "public"."EvaluationForm" drop constraint "evaluationform_eventid_fkey";

alter table "public"."EventDay" drop constraint "EventDay_eventId_fkey";

alter table "public"."Interview" drop constraint "Interview_applicationId_fkey";

alter table "public"."Participant" drop constraint "Participant_registrationId_fkey";

alter table "public"."ProofImage" drop constraint "ProofImage_applicationId_fkey";

alter table "public"."ProofImage" drop constraint "ProofImage_registrationId_fkey";

alter table "public"."Registration" drop constraint "Registration_businessMemberId_fkey";

alter table "public"."Registration" drop constraint "Registration_eventId_fkey";

alter table "public"."Registration" drop constraint "Registration_sponsoredRegistrationId_fkey";

alter table "public"."SponsoredRegistration" drop constraint "SponsoredRegistration_event_fkey";

drop function if exists "public"."get_registration_list"(p_event_id uuid, p_search_text text, p_payment_proof_status "PaymentProofStatus");

drop function if exists "public"."get_evaluations_by_event"(event_id uuid, completed_only boolean);

drop function if exists "public"."get_registrations_by_sponsored_id"(p_sponsored_registration_id uuid);

  create table "public"."Networks" (
    "id" uuid not null default gen_random_uuid(),
    "organization" text not null,
    "about" text not null,
    "location_type" text not null,
    "representative_name" text not null,
    "representative_position" text not null,
    "logo_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."Networks" enable row level security;

alter table "public"."Application" alter column "applicationMemberType" set data type public."ApplicationMemberType" using "applicationMemberType"::text::public."ApplicationMemberType";

alter table "public"."Application" alter column "applicationStatus" set default 'new'::public."ApplicationStatus";

alter table "public"."Application" alter column "applicationStatus" set data type public."ApplicationStatus" using "applicationStatus"::text::public."ApplicationStatus";

alter table "public"."Application" alter column "applicationType" set data type public."ApplicationType" using "applicationType"::text::public."ApplicationType";

alter table "public"."Application" alter column "paymentMethod" set data type public."PaymentMethod" using "paymentMethod"::text::public."PaymentMethod";

alter table "public"."Application" alter column "paymentProofStatus" set default 'pending'::public."PaymentProofStatus";

alter table "public"."Application" alter column "paymentProofStatus" set data type public."PaymentProofStatus" using "paymentProofStatus"::text::public."PaymentProofStatus";

alter table "public"."ApplicationMember" alter column "companyMemberType" set data type public."CompanyMemberType" using "companyMemberType"::text::public."CompanyMemberType";

alter table "public"."BusinessMember" alter column "membershipStatus" set default 'paid'::public."MembershipStatus";

alter table "public"."BusinessMember" alter column "membershipStatus" set data type public."MembershipStatus" using "membershipStatus"::text::public."MembershipStatus";

alter table "public"."EvaluationForm" alter column "q1Rating" set data type public."ratingScale" using "q1Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q2Rating" set data type public."ratingScale" using "q2Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q3Rating" set data type public."ratingScale" using "q3Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q4Rating" set data type public."ratingScale" using "q4Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q5Rating" set data type public."ratingScale" using "q5Rating"::text::public."ratingScale";

alter table "public"."EvaluationForm" alter column "q6Rating" set data type public."ratingScale" using "q6Rating"::text::public."ratingScale";

alter table "public"."Event" alter column "eventType" set data type public."EventType" using "eventType"::text::public."EventType";

alter table "public"."Interview" alter column "status" set default 'scheduled'::public."InterviewStatus";

alter table "public"."Interview" alter column "status" set data type public."InterviewStatus" using "status"::text::public."InterviewStatus";

alter table "public"."Registration" alter column "paymentMethod" set data type public."PaymentMethod" using "paymentMethod"::text::public."PaymentMethod";

alter table "public"."Registration" alter column "paymentProofStatus" set default 'pending'::public."PaymentProofStatus";

alter table "public"."Registration" alter column "paymentProofStatus" set data type public."PaymentProofStatus" using "paymentProofStatus"::text::public."PaymentProofStatus";

alter table "public"."SponsoredRegistration" alter column "status" set default 'active'::public."SponsoredRegistrationStatus";

alter table "public"."SponsoredRegistration" alter column "status" set data type public."SponsoredRegistrationStatus" using "status"::text::public."SponsoredRegistrationStatus";

alter table "public"."WebsiteContent" alter column "section" set data type public."WebsiteContentSection" using "section"::text::public."WebsiteContentSection";

alter table "public"."WebsiteContent" alter column "textType" set data type public."WebsiteContentTextType" using "textType"::text::public."WebsiteContentTextType";

CREATE UNIQUE INDEX networks_pkey ON public."Networks" USING btree (id);

alter table "public"."Networks" add constraint "networks_pkey" PRIMARY KEY using index "networks_pkey";

alter table "public"."Application" add constraint "Application_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES public."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Application" validate constraint "Application_businessMemberId_fkey";

alter table "public"."Application" add constraint "Application_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES public."Interview"("interviewId") ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Application" validate constraint "Application_interviewId_fkey";

alter table "public"."ApplicationMember" add constraint "ApplicationMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."ApplicationMember" validate constraint "ApplicationMember_applicationId_fkey";

alter table "public"."BusinessMember" add constraint "BusinessMember_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public."Sector"("sectorId") ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."BusinessMember" validate constraint "BusinessMember_sectorId_fkey";

alter table "public"."CheckIn" add constraint "CheckIn_eventDayId_fkey" FOREIGN KEY ("eventDayId") REFERENCES public."EventDay"("eventDayId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."CheckIn" validate constraint "CheckIn_eventDayId_fkey";

alter table "public"."CheckIn" add constraint "CheckIn_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES public."Participant"("participantId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."CheckIn" validate constraint "CheckIn_participantId_fkey";

alter table "public"."EvaluationForm" add constraint "evaluationform_eventid_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") ON DELETE CASCADE not valid;

alter table "public"."EvaluationForm" validate constraint "evaluationform_eventid_fkey";

alter table "public"."EventDay" add constraint "EventDay_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."EventDay" validate constraint "EventDay_eventId_fkey";

alter table "public"."Interview" add constraint "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"("applicationId") ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Interview" validate constraint "Interview_applicationId_fkey";

alter table "public"."Participant" add constraint "Participant_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"("registrationId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Participant" validate constraint "Participant_registrationId_fkey";

alter table "public"."ProofImage" add constraint "ProofImage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."ProofImage" validate constraint "ProofImage_applicationId_fkey";

alter table "public"."ProofImage" add constraint "ProofImage_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"("registrationId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."ProofImage" validate constraint "ProofImage_registrationId_fkey";

alter table "public"."Registration" add constraint "Registration_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES public."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."Registration" validate constraint "Registration_businessMemberId_fkey";

alter table "public"."Registration" add constraint "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") ON UPDATE CASCADE not valid;

alter table "public"."Registration" validate constraint "Registration_eventId_fkey";

alter table "public"."Registration" add constraint "Registration_sponsoredRegistrationId_fkey" FOREIGN KEY ("sponsoredRegistrationId") REFERENCES public."SponsoredRegistration"("sponsoredRegistrationId") ON DELETE CASCADE not valid;

alter table "public"."Registration" validate constraint "Registration_sponsoredRegistrationId_fkey";

alter table "public"."SponsoredRegistration" add constraint "SponsoredRegistration_event_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") not valid;

alter table "public"."SponsoredRegistration" validate constraint "SponsoredRegistration_event_fkey";

set check_function_bodies = off;

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

CREATE OR REPLACE FUNCTION public.get_event_participant_list(p_event_id uuid, p_search_text text DEFAULT NULL::text)
 RETURNS SETOF public.participant_list_item
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
    p."participantId",
    p."firstName",
    p."lastName",
    p."email",
    p."contactNumber",
    COALESCE(bm."businessName", r."nonMemberName") AS "affiliation",
    r."registrationDate",
    r."registrationId"
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    AND (
      p_search_text IS NULL
      OR p_search_text = ''
      OR (p."firstName" % p_search_text OR p."firstName" ILIKE v_search_pattern)
      OR (p."lastName" % p_search_text OR p."lastName" ILIKE v_search_pattern)
      OR ((p."firstName" || ' ' || p."lastName") % p_search_text OR (p."firstName" || ' ' || p."lastName") ILIKE v_search_pattern)
      OR (p.email <% p_search_text OR p.email ILIKE v_search_pattern)
      OR (COALESCE(bm."businessName", r."nonMemberName") <% p_search_text OR COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern)
    )
  ORDER BY
    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
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
      GREATEST(
        similarity(p."firstName", p_search_text),
        similarity(p."lastName", p_search_text),
        similarity(p."firstName" || ' ' || p."lastName", p_search_text),
        similarity(p."email", p_search_text),
        similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text)
      )
    ELSE 0 END DESC,
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
  days_arr jsonb := '[]'::jsonb;
  has_event_days boolean;
BEGIN
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (
      WHERE r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    )::bigint,
    COUNT(*) FILTER (
      WHERE r."paymentProofStatus" = 'pending'::"PaymentProofStatus"
    )::bigint
  INTO total_regs, verified_regs, pending_regs
  FROM "Registration" r
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(DISTINCT p."participantId") INTO participants_total
  FROM "Participant" p
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus";

  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus";

  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id)
  INTO has_event_days;

  IF has_event_days THEN
    WITH accepted_checkins AS (
      SELECT
        ci."eventDayId",
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    ),
    day_counts AS (
      SELECT
        ed."eventDayId" AS day_id,
        ed."label" AS day_label,
        ed."eventDate" AS day_date,
        COUNT(DISTINCT ac."participantId") AS participants
      FROM "EventDay" ed
      LEFT JOIN accepted_checkins ac ON ac."eventDayId" = ed."eventDayId"
      WHERE ed."eventId" = p_event_id
      GROUP BY ed."eventDayId", ed."label", ed."eventDate"
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_id', day_id,
          'day_label', coalesce(day_label, to_char(day_date, 'YYYY-MM-DD')),
          'day_date', day_date,
          'participants', participants,
          'attended', participants
        )
        ORDER BY day_date, day_id
      ),
      '[]'::jsonb
    ) INTO days_arr
    FROM day_counts;
  ELSE
    WITH accepted_checkins AS (
      SELECT
        ci."checkInTime"::date AS day_date,
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    ),
    day_counts AS (
      SELECT
        day_date,
        COUNT(DISTINCT "participantId") AS participants
      FROM accepted_checkins
      GROUP BY day_date
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_id', null,
          'day_label', to_char(day_date, 'YYYY-MM-DD'),
          'day_date', day_date,
          'participants', participants,
          'attended', participants
        )
        ORDER BY day_date
      ),
      '[]'::jsonb
    ) INTO days_arr
    FROM day_counts;
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

CREATE OR REPLACE FUNCTION public.get_registration_list_stats(p_event_id uuid)
 RETURNS public.registration_stats
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_result registration_stats;
BEGIN
  SELECT
    COUNT(DISTINCT r."registrationId")::INTEGER AS "totalRegistrations",
    COUNT(DISTINCT r."registrationId") FILTER (WHERE r."paymentProofStatus" = 'accepted')::INTEGER AS "verifiedRegistrations",
    COUNT(DISTINCT r."registrationId") FILTER (WHERE r."paymentProofStatus" = 'pending')::INTEGER AS "pendingRegistrations",
    COUNT(p."participantId") FILTER (WHERE r."paymentProofStatus" = 'accepted')::INTEGER AS "totalParticipants"
  INTO v_result
  FROM "Registration" r
  LEFT JOIN "Participant" p ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_registrations_by_sponsored_id(p_sponsored_registration_id uuid)
 RETURNS TABLE("registrationId" uuid, "eventId" uuid, "businessMemberId" uuid, "sponsoredRegistrationId" uuid, "nonMemberName" text, "numberOfParticipants" integer, "paymentProofStatus" public."PaymentProofStatus", "paymentMethod" public."PaymentMethod", "registrationDate" timestamp with time zone, identifier text, participants jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT
    r."registrationId",
    r."eventId",
    r."businessMemberId",
    r."sponsoredRegistrationId",
    r."nonMemberName",
    r."numberOfParticipants",
    r."paymentProofStatus",
    r."paymentMethod",
    r."registrationDate",
    r."identifier",
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'participantId', p."participantId",
            'firstName', p."firstName",
            'lastName', p."lastName",
            'email', p."email",
            'contactNumber', p."contactNumber",
            'isPrincipal', p."isPrincipal",
            'registrationId', p."registrationId"
          )
        )
        FROM "Participant" p
        WHERE p."registrationId" = r."registrationId"
      ),
      '[]'::jsonb
    ) AS participants
  FROM "Registration" r
  WHERE r."sponsoredRegistrationId" = p_sponsored_registration_id
  ORDER BY r."registrationDate" DESC;
$function$
;
