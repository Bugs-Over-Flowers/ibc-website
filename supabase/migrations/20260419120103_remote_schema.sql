drop trigger if exists "on_application_sync_primary" on "public"."Application";

drop trigger if exists "set_member_identifier" on "public"."BusinessMember";

drop trigger if exists "trigger_set_membership_expiry" on "public"."BusinessMember";

drop trigger if exists "on_event_change" on "public"."Event";

drop trigger if exists "tr_update_participant_count" on "public"."Participant";

drop trigger if exists "tr_update_sponsored_registration_used_count_from_participant" on "public"."Participant";

drop trigger if exists "tr_update_sponsored_registration_used_count" on "public"."Registration";

drop trigger if exists "set_website_content_updated_at" on "public"."WebsiteContent";

drop policy "Event admin can delete sponsored registrations" on "public"."SponsoredRegistration";

drop policy "Event admin can update sponsored registrations" on "public"."SponsoredRegistration";

alter table "public"."Application" drop constraint "Application_sectorId_fkey";

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

drop function if exists "public"."submit_evaluation_form"(p_event_id uuid, p_name text, p_q1_rating "ratingScale", p_q2_rating "ratingScale", p_q3_rating "ratingScale", p_q4_rating "ratingScale", p_q5_rating "ratingScale", p_q6_rating "ratingScale", p_additional_comments text, p_feedback text);

drop function if exists "public"."upsert_website_content"(p_section "WebsiteContentSection", p_entry_key text, p_text_type "WebsiteContentTextType", p_text_value text, p_icon text, p_image_url text, p_card_placement integer, p_is_active boolean);

drop function if exists "public"."upsert_website_content"(p_section "WebsiteContentSection", p_entry_key text, p_text_type "WebsiteContentTextType", p_text_value text, p_icon text, p_image_url text, p_group text, p_card_placement integer, p_is_active boolean);

drop function if exists "public"."get_all_evaluations"();

drop function if exists "public"."get_all_sponsored_registrations_with_event"();

drop function if exists "public"."get_evaluation_by_id"(eval_id uuid);

drop function if exists "public"."get_evaluations_by_event"(event_id uuid, completed_only boolean);

drop function if exists "public"."get_registrations_by_sponsored_id"(p_sponsored_registration_id uuid);

drop function if exists "public"."get_sponsored_registration_by_uuid"(p_uuid text);

drop function if exists "public"."get_sponsored_registration_by_uuid"(p_uuid uuid);

drop type "public"."registration_list_item";

create type "public"."registration_list_item" as ("registration_id" uuid, "affiliation" text, "registration_date" timestamp with time zone, "payment_proof_status" public."PaymentProofStatus", "payment_method" public."PaymentMethod", "business_member_id" uuid, "business_name" text, "is_member" boolean, "registrant" jsonb, "people" integer, "registration_identifier" text);


alter table "public"."Application" drop column "sectorId";

alter table "public"."Application" add column "sectorName" text;

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

alter table "public"."BusinessMember" alter column "primaryApplicationId" set not null;

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

CREATE OR REPLACE FUNCTION public.update_event_published_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF new."eventType" IS NULL then
        new."publishedAt" = now();
    else
        new."publishedAt" = null;
    end if;

    return NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_website_content(p_section public."WebsiteContentSection", p_entry_key text, p_text_type public."WebsiteContentTextType", p_text_value text DEFAULT NULL::text, p_icon text DEFAULT NULL::text, p_image_url text DEFAULT NULL::text, p_card_placement integer DEFAULT NULL::integer, p_is_active boolean DEFAULT true)
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

CREATE OR REPLACE FUNCTION public.approve_membership_update_application(p_application_id uuid)
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

  IF v_application_type <> 'updating' THEN
    RAISE EXCEPTION 'Invalid application type for update-info approval';
  END IF;

  IF v_application_status = 'approved' THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application_business_member_id IS NULL THEN
    RAISE EXCEPTION 'Update-info application must be linked to an existing business member';
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

  IF v_member_membership_status = 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled memberships must renew first before updating information';
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
    "logoImageURL" = COALESCE(NULLIF(v_application_logo_image_url, ''), "logoImageURL")
  WHERE "businessMemberId" = v_member_id;

  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
  SELECT
    v_member_id,
    'Update-info application approved successfully. Member information updated.'::text;
END;$function$
;

CREATE OR REPLACE FUNCTION public.check_member_exists_and_get(p_identifier text, p_application_type text DEFAULT 'renewal'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE
  -- Member
  v_member_business_member_id uuid;
  v_member_identifier text;
  v_member_business_name text;
  v_member_membership_status text;
  v_member_sector_id bigint;
  v_member_website_url text;
  v_member_logo_image_url text;

  -- Latest application
  v_latest_application_id uuid;
  v_latest_company_address text;
  v_latest_email_address text;
  v_latest_landline text;
  v_latest_mobile_number text;
  v_latest_sector_name text;

  -- Resolved sector
  v_resolved_sector_id bigint;

  -- Principal representative
  v_principal_first_name text;
  v_principal_last_name text;
  v_principal_email text;
  v_principal_mobile text;
  v_principal_landline text;
  v_principal_mailing_address text;
  v_principal_designation text;
  v_principal_birthdate text;
  v_principal_nationality text;
  v_principal_sex text;

  -- Alternate representative
  v_alternate_first_name text;
  v_alternate_last_name text;
  v_alternate_email text;
  v_alternate_mobile text;
  v_alternate_landline text;
  v_alternate_mailing_address text;
  v_alternate_designation text;
  v_alternate_birthdate text;
  v_alternate_nationality text;
  v_alternate_sex text;

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
    bm."businessMemberId",
    bm."identifier",
    bm."businessName",
    bm."membershipStatus"::text,
    bm."sectorId",
    bm."websiteURL",
    bm."logoImageURL"
  INTO
    v_member_business_member_id,
    v_member_identifier,
    v_member_business_name,
    v_member_membership_status,
    v_member_sector_id,
    v_member_website_url,
    v_member_logo_image_url
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
    IF v_member_membership_status <> 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member_business_name,
        'membershipStatus', v_member_membership_status,
        'businessMemberIdentifier', v_member_identifier,
        'businessMemberId', v_member_business_member_id,
        'message', 'Only cancelled memberships are eligible for renewal'
      );
    END IF;
  ELSE
    IF v_member_membership_status = 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member_business_name,
        'membershipStatus', v_member_membership_status,
        'businessMemberIdentifier', v_member_identifier,
        'businessMemberId', v_member_business_member_id,
        'message', 'cancelled memberships must renew first before updating information'
      );
    END IF;
  END IF;

  SELECT
    a."applicationId",
    a."companyAddress",
    a."emailAddress",
    a."landline",
    a."mobileNumber",
    a."sectorName"
  INTO
    v_latest_application_id,
    v_latest_company_address,
    v_latest_email_address,
    v_latest_landline,
    v_latest_mobile_number,
    v_latest_sector_name
  FROM public."Application" a
  WHERE a."businessMemberId" = v_member_business_member_id
  ORDER BY a."applicationDate" DESC
  LIMIT 1;

  IF v_latest_application_id IS NOT NULL THEN
    SELECT
      am."firstName",
      am."lastName",
      am."emailAddress",
      am."mobileNumber",
      am."landline",
      am."mailingAddress",
      am."companyDesignation",
      am."birthdate"::text,
      am."nationality",
      am."sex"
    INTO
      v_principal_first_name,
      v_principal_last_name,
      v_principal_email,
      v_principal_mobile,
      v_principal_landline,
      v_principal_mailing_address,
      v_principal_designation,
      v_principal_birthdate,
      v_principal_nationality,
      v_principal_sex
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_latest_application_id
      AND am."companyMemberType" = 'principal'
    LIMIT 1;

    SELECT
      am."firstName",
      am."lastName",
      am."emailAddress",
      am."mobileNumber",
      am."landline",
      am."mailingAddress",
      am."companyDesignation",
      am."birthdate"::text,
      am."nationality",
      am."sex"
    INTO
      v_alternate_first_name,
      v_alternate_last_name,
      v_alternate_email,
      v_alternate_mobile,
      v_alternate_landline,
      v_alternate_mailing_address,
      v_alternate_designation,
      v_alternate_birthdate,
      v_alternate_nationality,
      v_alternate_sex
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_latest_application_id
      AND am."companyMemberType" = 'alternate'
    LIMIT 1;
  END IF;

  v_resolved_sector_id := NULL;

  IF v_latest_sector_name IS NOT NULL AND btrim(v_latest_sector_name) <> '' THEN
    SELECT s."sectorId"
    INTO v_resolved_sector_id
    FROM public."Sector" s
    WHERE lower(btrim(s."sectorName")) = lower(btrim(v_latest_sector_name))
    ORDER BY s."sectorId"
    LIMIT 1;
  END IF;

  IF v_resolved_sector_id IS NULL THEN
    v_resolved_sector_id := v_member_sector_id;
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'companyName', v_member_business_name,
    'membershipStatus', v_member_membership_status,
    'businessMemberIdentifier', v_member_identifier,
    'businessMemberId', v_member_business_member_id,
    'companyAddress', COALESCE(v_latest_company_address, ''),
    'emailAddress', COALESCE(v_latest_email_address, ''),
    'landline', COALESCE(v_latest_landline, ''),
    'mobileNumber', COALESCE(v_latest_mobile_number, ''),
    'websiteURL', COALESCE(v_member_website_url, ''),
    'logoImageURL', COALESCE(v_member_logo_image_url, ''),
    'sectorId', v_resolved_sector_id,
    'principalRepresentative',
      CASE
        WHEN v_principal_first_name IS NULL THEN NULL
        ELSE jsonb_build_object(
          'firstName', v_principal_first_name,
          'lastName', v_principal_last_name,
          'emailAddress', v_principal_email,
          'mobileNumber', v_principal_mobile,
          'landline', v_principal_landline,
          'mailingAddress', v_principal_mailing_address,
          'companyDesignation', v_principal_designation,
          'birthdate', v_principal_birthdate,
          'nationality', v_principal_nationality,
          'sex', v_principal_sex
        )
      END,
    'alternateRepresentative',
      CASE
        WHEN v_alternate_first_name IS NULL THEN NULL
        ELSE jsonb_build_object(
          'firstName', v_alternate_first_name,
          'lastName', v_alternate_last_name,
          'emailAddress', v_alternate_email,
          'mobileNumber', v_alternate_mobile,
          'landline', v_alternate_landline,
          'mailingAddress', v_alternate_mailing_address,
          'companyDesignation', v_alternate_designation,
          'birthdate', v_alternate_birthdate,
          'nationality', v_alternate_nationality,
          'sex', v_alternate_sex
        )
      END
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Unable to validate Business Member Identifier at this time'
    );
END;$function$
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
  v_sector_name text;
  v_business_member_id uuid;
  representative jsonb;
  v_rep_type_text text;
BEGIN
  v_application_id := gen_random_uuid();
  v_identifier := 'ibc-app-' || left(replace(v_application_id::text, '-', ''), 8);

  v_app_type_enum := p_application_type::"ApplicationType";
  v_pay_method_enum := p_payment_method::"PaymentMethod";
  v_pay_status_enum := 'pending'::"PaymentProofStatus";

  IF v_pay_method_enum = 'BPI'
     AND (p_payment_proof_url IS NULL OR btrim(p_payment_proof_url) = '') THEN
    RAISE EXCEPTION 'Proof of payment is required for online transactions.';
  END IF;

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
      SELECT 1
      FROM "BusinessMember"
      WHERE "businessMemberId" = v_business_member_id
    ) THEN
      RAISE EXCEPTION
        'Member ID % does not exist. Please provide a valid IBC Member ID.',
        v_business_member_id;
    END IF;
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
    p_application_member_type::"ApplicationMemberType"
  );

  IF v_pay_method_enum = 'BPI' THEN
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


  create policy "Event admin can delete sponsored registrations"
  on "public"."SponsoredRegistration"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public."Event" e
  WHERE (e."eventId" = "SponsoredRegistration"."eventId"))));



  create policy "Event admin can update sponsored registrations"
  on "public"."SponsoredRegistration"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public."Event" e
  WHERE (e."eventId" = "SponsoredRegistration"."eventId"))))
with check ((EXISTS ( SELECT 1
   FROM public."Event" e
  WHERE (e."eventId" = "SponsoredRegistration"."eventId"))));


CREATE TRIGGER on_event_publish AFTER INSERT OR UPDATE ON public."Event" FOR EACH ROW EXECUTE FUNCTION public.update_event_published_at();

CREATE TRIGGER on_application_sync_primary AFTER INSERT OR DELETE OR UPDATE ON public."Application" FOR EACH ROW EXECUTE FUNCTION public.update_primary_application_for_member();

CREATE TRIGGER set_member_identifier BEFORE INSERT ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.generate_member_identifier();

CREATE TRIGGER trigger_set_membership_expiry BEFORE INSERT OR UPDATE OF "lastPaymentDate" ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.set_membership_expiry();

CREATE TRIGGER on_event_change AFTER INSERT OR UPDATE ON public."Event" FOR EACH ROW EXECUTE FUNCTION public.handle_event_days();

CREATE TRIGGER tr_update_participant_count AFTER INSERT OR DELETE OR UPDATE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_participant_count_trigger();

CREATE TRIGGER tr_update_sponsored_registration_used_count_from_participant AFTER INSERT OR DELETE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_participant();

CREATE TRIGGER tr_update_sponsored_registration_used_count AFTER INSERT OR DELETE OR UPDATE OF "sponsoredRegistrationId" ON public."Registration" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_registration();

CREATE TRIGGER set_website_content_updated_at BEFORE UPDATE ON public."WebsiteContent" FOR EACH ROW EXECUTE FUNCTION public.update_website_content_updated_at();
