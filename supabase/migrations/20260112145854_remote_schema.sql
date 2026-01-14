drop policy "Enable delete for authenticated users" on "public"."Event";

drop index if exists "public"."idx_interview_application";

alter table "public"."Application" add column "interviewId" uuid;

alter table "public"."Application" alter column "sectorId" drop not null;

alter table "public"."Interview" drop column "applicationId";

CREATE UNIQUE INDEX "Application_applicationId_key" ON public."Application" USING btree ("applicationId");

CREATE UNIQUE INDEX "Application_pkey" ON public."Application" USING btree ("applicationId");

alter table "public"."Application" add constraint "Application_pkey" PRIMARY KEY using index "Application_pkey";

alter table "public"."Application" add constraint "Application_applicationId_key" UNIQUE using index "Application_applicationId_key";

alter table "public"."Application" add constraint "Application_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES public."Interview"("interviewId") ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Application" validate constraint "Application_interviewId_fkey";

alter table "public"."Application" add constraint "Application_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Application" validate constraint "Application_memberId_fkey";

alter table "public"."Application" add constraint "Application_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public."Sector"("sectorId") ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."Application" validate constraint "Application_sectorId_fkey";

alter table "public"."ApplicationMember" add constraint "ApplicationMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."ApplicationMember" validate constraint "ApplicationMember_applicationId_fkey";

alter table "public"."ProofImage" add constraint "ProofImage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."ProofImage" validate constraint "ProofImage_applicationId_fkey";

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


  create policy "Enable all for authenticated users only"
  on "public"."Application"
  as permissive
  for all
  to authenticated
using (true);



  create policy "Enable delete for authenticated users"
  on "public"."Event"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "admin can access logoImage 18vv14g_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'logoImage'::text));



