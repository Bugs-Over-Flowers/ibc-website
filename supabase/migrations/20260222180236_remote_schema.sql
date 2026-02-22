drop extension if exists "pg_net";

drop policy "Enable insert for all users" on "public"."Participant";

drop policy "Enable read access for all users" on "public"."Participant";

drop function if exists "public"."get_sponsored_registration_by_uuid"(p_uuid uuid);

set check_function_bodies = off;

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


drop policy "Allow all operations for anyone 11d98ol_0" on "storage"."objects";

drop policy "Allow all operations for anyone 11d98ol_1" on "storage"."objects";

drop policy "Allow all operations for anyone 11d98ol_2" on "storage"."objects";

drop policy "Allow all operations for anyone 11d98ol_3" on "storage"."objects";


  create policy "Allow all operations for anyone 11d98ol_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon, authenticated
with check ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_1"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_2"
  on "storage"."objects"
  as permissive
  for delete
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_3"
  on "storage"."objects"
  as permissive
  for update
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));


CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


