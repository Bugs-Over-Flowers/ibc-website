CREATE OR REPLACE FUNCTION "public"."quick_onsite_registration"(
  "p_event_day_id" "uuid",
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid" DEFAULT NULL::"uuid",
  "p_non_member_name" "text" DEFAULT NULL::"text",
  "p_registrant" "jsonb" DEFAULT '{}'::"jsonb",
  "p_remark" "text" DEFAULT NULL::"text"
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_registration_id UUID;
  v_participant_id UUID;
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
    "registrationDate"
  ) VALUES (
    p_event_id,
    'ONSITE',
    'accepted',
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email'
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
    'message', 'Registration created successfully'
  );
END;
$$;

ALTER FUNCTION "public"."quick_onsite_registration"(
  "p_event_day_id" "uuid",
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid",
  "p_non_member_name" "text",
  "p_registrant" "jsonb",
  "p_remark" "text"
) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."quick_onsite_registration"(
  "p_event_day_id" "uuid",
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid",
  "p_non_member_name" "text",
  "p_registrant" "jsonb",
  "p_remark" "text"
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."quick_onsite_registration"(
  "p_event_day_id" "uuid",
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid",
  "p_non_member_name" "text",
  "p_registrant" "jsonb",
  "p_remark" "text"
) TO "service_role";
