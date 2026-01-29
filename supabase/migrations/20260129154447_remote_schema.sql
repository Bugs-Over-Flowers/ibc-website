alter table "public"."Application" alter column "identifier" set not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_member_exists(p_identifier text, p_application_type text DEFAULT 'renewal'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_member_exists boolean;
  v_member_info jsonb;
BEGIN
  IF p_identifier IS NULL OR p_identifier = '' THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Member ID is required');
  END IF;

  -- For updating, member must not be cancelled
  -- For renewal, any status is allowed
  IF p_application_type = 'updating' THEN
    SELECT EXISTS(
      SELECT 1 FROM "BusinessMember" 
      WHERE "identifier" = p_identifier 
        AND "membershipStatus" != 'cancelled'
    ) INTO v_member_exists;
  ELSE
    -- Renewal allows any status
    SELECT EXISTS(
      SELECT 1 FROM "BusinessMember" 
      WHERE "identifier" = p_identifier
    ) INTO v_member_exists;
  END IF;

  IF v_member_exists THEN
    SELECT jsonb_build_object(
      'exists', true,
      'companyName', "businessName",
      'membershipStatus', "membershipStatus",
      'businessMemberId', "businessMemberId"
    ) INTO v_member_info
    FROM "BusinessMember" WHERE "identifier" = p_identifier;
    RETURN v_member_info;
  ELSE
    IF p_application_type = 'updating' THEN
      RETURN jsonb_build_object('exists', false, 'message', 'Member ID not found or membership is cancelled. Cancelled members must renew first.');
    ELSE
      RETURN jsonb_build_object('exists', false, 'message', 'Member ID not found');
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Unable to validate member ID at this time');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_member_exists(p_identifier text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_member_exists boolean;
  v_member_info jsonb;
BEGIN
  IF p_identifier IS NULL OR p_identifier = '' THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Member ID is required');
  END IF;

  -- Check if member exists and is not cancelled
  SELECT EXISTS(
    SELECT 1 FROM "BusinessMember" 
    WHERE "identifier" = p_identifier 
      AND "membershipStatus" != 'cancelled'
  ) INTO v_member_exists;

  IF v_member_exists THEN
    SELECT jsonb_build_object(
      'exists', true,
      'companyName', "businessName",
      'membershipStatus', "membershipStatus",
      'businessMemberId', "businessMemberId"
    ) INTO v_member_info
    FROM "BusinessMember" WHERE "identifier" = p_identifier;
    RETURN v_member_info;
  ELSE
    RETURN jsonb_build_object('exists', false, 'message', 'Member ID not found or membership is cancelled');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Unable to validate member ID at this time');
END;
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

drop policy "Allow admins to to operations m7tc2d_0" on "storage"."objects";

drop policy "Allow admins to to operations m7tc2d_1" on "storage"."objects";

drop policy "Allow admins to to operations m7tc2d_2" on "storage"."objects";

drop policy "Allow admins to to operations m7tc2d_3" on "storage"."objects";

drop policy "Allow anyone to delete m7tc2d_0" on "storage"."objects";

drop policy "Allow anyone to insert m7tc2d_0" on "storage"."objects";


