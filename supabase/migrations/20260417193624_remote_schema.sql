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
alter table "public"."Application" drop constraint "Application_businessMemberId_fkey";
alter table "public"."Application" drop constraint "Application_interviewId_fkey";
alter table "public"."Application" drop constraint "Application_sectorId_fkey";
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
drop function if exists "public"."get_all_evaluations"();
drop function if exists "public"."get_all_sponsored_registrations_with_event"();
drop function if exists "public"."get_evaluation_by_id"(eval_id uuid);
drop function if exists "public"."get_evaluations_by_event"(event_id uuid, completed_only boolean);
drop function if exists "public"."get_registrations_by_sponsored_id"(p_sponsored_registration_id uuid);
drop function if exists "public"."get_sponsored_registration_by_uuid"(p_uuid text);
drop function if exists "public"."get_sponsored_registration_by_uuid"(p_uuid uuid);
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
alter table "public"."Event" alter column "publishedAt" set data type timestamp with time zone using "publishedAt"::timestamp with time zone;
alter table "public"."Event" alter column "updatedAt" set data type timestamp with time zone using "updatedAt"::timestamp with time zone;
alter table "public"."Interview" alter column "status" set default 'scheduled'::public."InterviewStatus";
alter table "public"."Interview" alter column "status" set data type public."InterviewStatus" using "status"::text::public."InterviewStatus";
alter table "public"."Registration" alter column "paymentMethod" set data type public."PaymentMethod" using "paymentMethod"::text::public."PaymentMethod";
alter table "public"."Registration" alter column "paymentProofStatus" set default 'pending'::public."PaymentProofStatus";
alter table "public"."Registration" alter column "paymentProofStatus" set data type public."PaymentProofStatus" using "paymentProofStatus"::text::public."PaymentProofStatus";
alter table "public"."SponsoredRegistration" alter column "status" set default 'active'::public."SponsoredRegistrationStatus";
alter table "public"."SponsoredRegistration" alter column "status" set data type public."SponsoredRegistrationStatus" using "status"::text::public."SponsoredRegistrationStatus";
alter table "public"."WebsiteContent" add column if not exists "group" text;
alter table "public"."WebsiteContent" alter column "section" set data type public."WebsiteContentSection" using "section"::text::public."WebsiteContentSection";
alter table "public"."WebsiteContent" alter column "textType" set data type public."WebsiteContentTextType" using "textType"::text::public."WebsiteContentTextType";
alter table "public"."Application" add constraint "Application_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES public."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE CASCADE not valid;
alter table "public"."Application" validate constraint "Application_businessMemberId_fkey";
alter table "public"."Application" add constraint "Application_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES public."Interview"("interviewId") ON UPDATE CASCADE ON DELETE SET NULL not valid;
alter table "public"."Application" validate constraint "Application_interviewId_fkey";
alter table "public"."Application" add constraint "Application_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public."Sector"("sectorId") ON UPDATE CASCADE ON DELETE SET NULL not valid;
alter table "public"."Application" validate constraint "Application_sectorId_fkey";
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
CREATE OR REPLACE FUNCTION public.approve_membership_renewal_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application record;
  v_member record;
  v_member_id uuid;
BEGIN
  -- Lock target application
  SELECT *
  INTO v_application
  FROM public."Application"
  WHERE "applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application."applicationType" <> 'renewal' THEN
    RAISE EXCEPTION 'Invalid application type for renewal approval';
  END IF;

  IF v_application."applicationStatus" = 'approved' THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application."businessMemberId" IS NULL THEN
    RAISE EXCEPTION 'Renewal application must be linked to an existing business member';
  END IF;

  -- Lock linked member
  SELECT *
  INTO v_member
  FROM public."BusinessMember"
  WHERE "businessMemberId" = v_application."businessMemberId"
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked business member not found';
  END IF;

  -- Renewal rule: only cancelled members can renew
  IF v_member."membershipStatus" <> 'cancelled' THEN
    RAISE EXCEPTION 'Only cancelled memberships are eligible for renewal';
  END IF;

  v_member_id := v_member."businessMemberId";

  -- Apply updates from application + reactivate membership
  UPDATE public."BusinessMember"
  SET
    "businessName" = COALESCE(NULLIF(v_application."companyName", ''), "businessName"),
    "sectorId" = COALESCE(v_application."sectorId", "sectorId"),
    "websiteURL" = COALESCE(NULLIF(v_application."websiteURL", ''), "websiteURL"),
    "logoImageURL" = COALESCE(NULLIF(v_application."logoImageURL", ''), "logoImageURL"),
    "membershipStatus" = 'paid'
  WHERE "businessMemberId" = v_member_id;

  -- Mark application approved
  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
  SELECT
    v_member_id,
    'Renewal approved successfully. Member status updated to paid.'::text;
END;
$function$;
CREATE OR REPLACE FUNCTION public.approve_membership_update_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application record;
  v_member record;
  v_member_id uuid;
BEGIN
  -- Lock target application
  SELECT *
  INTO v_application
  FROM public."Application"
  WHERE "applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application."applicationType" <> 'updating' THEN
    RAISE EXCEPTION 'Invalid application type for update-info approval';
  END IF;

  IF v_application."applicationStatus" = 'approved' THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application."businessMemberId" IS NULL THEN
    RAISE EXCEPTION 'Update-info application must be linked to an existing business member';
  END IF;

  -- Lock linked member
  SELECT *
  INTO v_member
  FROM public."BusinessMember"
  WHERE "businessMemberId" = v_application."businessMemberId"
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked business member not found';
  END IF;

  -- Updating rule: cancelled members must renew first
  IF v_member."membershipStatus" = 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled memberships must renew first before updating information';
  END IF;

  v_member_id := v_member."businessMemberId";

  -- Apply updates from application (membershipStatus unchanged)
  UPDATE public."BusinessMember"
  SET
    "businessName" = COALESCE(NULLIF(v_application."companyName", ''), "businessName"),
    "sectorId" = COALESCE(v_application."sectorId", "sectorId"),
    "websiteURL" = COALESCE(NULLIF(v_application."websiteURL", ''), "websiteURL"),
    "logoImageURL" = COALESCE(NULLIF(v_application."logoImageURL", ''), "logoImageURL")
  WHERE "businessMemberId" = v_member_id;

  -- Mark application approved
  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
  SELECT
    v_member_id,
    'Update-info application approved successfully. Member information updated.'::text;
END;
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
CREATE OR REPLACE FUNCTION public.get_member_primary_application(p_member_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT public.compute_primary_application_id(p_member_id);
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
CREATE OR REPLACE FUNCTION public.get_sr_by_event_id(p_event_id uuid)
 RETURNS SETOF public."SponsoredRegistration"
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT *
  FROM "SponsoredRegistration"
  WHERE "eventId" = p_event_id
  ORDER BY "createdAt" DESC;
$function$;
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
$function$;
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
$function$;
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
$function$;
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
END;$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
CREATE OR REPLACE FUNCTION public.update_website_content_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$function$;
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
CREATE TRIGGER on_application_sync_primary AFTER INSERT OR DELETE OR UPDATE ON public."Application" FOR EACH ROW EXECUTE FUNCTION public.update_primary_application_for_member();
CREATE TRIGGER set_member_identifier BEFORE INSERT ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.generate_member_identifier();
CREATE TRIGGER trigger_set_membership_expiry BEFORE INSERT OR UPDATE OF "lastPaymentDate" ON public."BusinessMember" FOR EACH ROW EXECUTE FUNCTION public.set_membership_expiry();
CREATE TRIGGER on_event_change AFTER INSERT OR UPDATE ON public."Event" FOR EACH ROW EXECUTE FUNCTION public.handle_event_days();
CREATE TRIGGER tr_update_participant_count AFTER INSERT OR DELETE OR UPDATE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_participant_count_trigger();
CREATE TRIGGER tr_update_sponsored_registration_used_count_from_participant AFTER INSERT OR DELETE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_participant();
CREATE TRIGGER tr_update_sponsored_registration_used_count AFTER INSERT OR DELETE OR UPDATE OF "sponsoredRegistrationId" ON public."Registration" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_registration();
CREATE TRIGGER set_website_content_updated_at BEFORE UPDATE ON public."WebsiteContent" FOR EACH ROW EXECUTE FUNCTION public.update_website_content_updated_at();
