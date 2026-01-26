drop function if exists "public"."submit_membership_application"(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_payment_proof_url text);

alter table "public"."Application" add column "identifier" text;

CREATE UNIQUE INDEX "Application_identifier_key" ON public."Application" USING btree (identifier);

alter table "public"."Application" add constraint "Application_identifier_key" UNIQUE using index "Application_identifier_key";

set check_function_bodies = off;

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

create type "public"."registration_details_result" as ("registration_details" jsonb, "event_details" jsonb, "check_in_list" jsonb, "event_days" jsonb, "all_is_checked_in" boolean, "is_event_day" boolean);

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

    -- Update availableSlots: maxGuest - total participants
    UPDATE "Event"
    SET "availableSlots" = v_max_guest - v_total_participants
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

CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_application_member_type text, p_payment_proof_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application_id uuid;
  v_identifier text;
  v_app_type_enum "ApplicationType";
  v_pay_method_enum "PaymentMethod";
  v_pay_status_enum "PaymentStatus";
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
  v_pay_status_enum := 'pending'::"PaymentStatus";

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
    "faxNumber",
    "mobileNumber",
    "emailAddress",
    "paymentStatus",
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
    p_company_details->>'fax',
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
        "faxNumber",
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
        representative->>'fax',
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

CREATE TRIGGER tr_update_event_available_slots AFTER INSERT OR DELETE OR UPDATE OF "numberOfParticipants" ON public."Registration" FOR EACH ROW EXECUTE FUNCTION public.update_event_available_slots_trigger();
