alter table if exists "public"."SponsoredRegistration"
  drop constraint if exists "SponsoredRegistration_uuid_unique";

drop index if exists "public"."SponsoredRegistration_uuid_unique";

alter table "public"."Registration" add column "sponsoredRegistrationId" uuid;

alter table "public"."SponsoredRegistration" alter column "uuid" set data type text using "uuid"::text;

CREATE INDEX idx_registration_sponsored ON public."Registration" USING btree ("sponsoredRegistrationId");

CREATE INDEX idx_registration_sponsored_registration_id ON public."Registration" USING btree ("sponsoredRegistrationId");

CREATE UNIQUE INDEX "SponsoredRegistration_uuid_unique" ON public."SponsoredRegistration" USING btree (uuid);

alter table "public"."Registration" add constraint "Registration_sponsoredRegistrationId_fkey" FOREIGN KEY ("sponsoredRegistrationId") REFERENCES public."SponsoredRegistration"("sponsoredRegistrationId") ON DELETE CASCADE not valid;

alter table "public"."Registration" validate constraint "Registration_sponsoredRegistrationId_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_sponsored_registration(p_event_id uuid, p_sponsored_by text, p_fee_deduction double precision, p_max_sponsored_guests integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  v_sponsored_registration_id uuid;
  v_uuid text;
begin
  -- Generate UUID for sponsored registration
  v_sponsored_registration_id := gen_random_uuid();
  v_uuid := v_sponsored_registration_id::text;

  -- Insert the sponsored registration
  insert into "SponsoredRegistration" (
    "sponsoredRegistrationId",
    "eventId",
    "sponsoredBy",
    "feeDeduction",
    "maxSponsoredGuests",
    "status",
    "uuid",
    "createdAt",
    "updatedAt"
  ) values (
    v_sponsored_registration_id,
    p_event_id,
    p_sponsored_by,
    p_fee_deduction,
    p_max_sponsored_guests,
    'active'::"SponsoredRegistrationStatus",
    v_uuid,
    now(),
    now()
  );

  -- Return success response
  return jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'sponsoredRegistrationId', v_sponsored_registration_id,
      'eventId', p_event_id,
      'sponsoredBy', p_sponsored_by,
      'feeDeduction', p_fee_deduction,
      'maxSponsoredGuests', p_max_sponsored_guests,
      'status', 'active'::"SponsoredRegistrationStatus",
      'uuid', v_uuid,
      'createdAt', now()::text,
      'updatedAt', now()::text
    )
  );

exception when others then
  return jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
end;$function$
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

CREATE OR REPLACE FUNCTION public.get_registrations_by_sponsored_id(p_sponsored_registration_id uuid)
 RETURNS TABLE("registrationId" uuid, "eventId" uuid, "businessMemberId" uuid, "sponsoredRegistrationId" uuid, "nonMemberName" text, "numberOfParticipants" integer, "paymentStatus" public."PaymentStatus", "paymentMethod" public."PaymentMethod", "registrationDate" timestamp with time zone, identifier text, participants jsonb)
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
    r."paymentStatus",
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

CREATE OR REPLACE FUNCTION public.get_sponsored_registration_by_uuid(p_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
BEGIN
  SELECT to_jsonb(sr.*)
  INTO result
  FROM public."SponsoredRegistration" sr
  WHERE sr.uuid = p_uuid;
  
  RETURN result;
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

CREATE OR REPLACE FUNCTION public.submit_event_registration(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_path text DEFAULT NULL::text, p_registrant jsonb DEFAULT '{}'::jsonb, p_other_participants jsonb DEFAULT '[]'::jsonb, p_sponsored_registration_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_registration_id UUID;
  v_event_title TEXT;
  v_payment_status "PaymentStatus";
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
    "registrationDate",
    "sponsoredRegistrationId"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW(),
    p_sponsored_registration_id
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
      SELECT ed."eventDayId" AS day_id, ed."label" AS day_label, ed."eventDate" AS day_date
      FROM "EventDay" ed
      WHERE ed."eventId" = p_event_id
      ORDER BY ed."eventDate", ed."eventDayId"
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
    'total_registrations', coalesce(total_regs, 0),
    'verified_registrations', coalesce(verified_regs, 0),
    'pending_registrations', coalesce(pending_regs, 0),
    'total_participants', coalesce(participants_total, 0),
    'total_attended', coalesce(attended_total, 0),
    'event_days', days_arr
  );
END;
$function$
;

CREATE TRIGGER tr_update_sponsored_registration_used_count_from_participant AFTER INSERT OR DELETE ON public."Participant" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_participant();

CREATE TRIGGER tr_update_sponsored_registration_used_count AFTER INSERT OR DELETE OR UPDATE OF "sponsoredRegistrationId" ON public."Registration" FOR EACH ROW EXECUTE FUNCTION public.update_sponsored_registration_used_count_from_registration();

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

