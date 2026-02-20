drop function if exists "public"."create_sponsored_registration"(p_event_id uuid, p_sponsored_by text, p_fee_deduction double precision, p_max_sponsored_guests integer);

alter table "public"."SponsoredRegistration" add constraint "SponsoredRegistration_uuid_unique" UNIQUE using index "SponsoredRegistration_uuid_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_membership_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application record;
  v_member_id uuid;
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

  UPDATE "public"."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
    SELECT v_member_id, 'Application approved successfully';
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

DO $$
BEGIN
  IF to_regprocedure('storage.protect_delete()') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = 'protect_buckets_delete'
        AND tgrelid = 'storage.buckets'::regclass
    ) THEN
      EXECUTE 'CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete()';
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regprocedure('storage.protect_delete()') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = 'protect_objects_delete'
        AND tgrelid = 'storage.objects'::regclass
    ) THEN
      EXECUTE 'CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete()';
    END IF;
  END IF;
END
$$;

