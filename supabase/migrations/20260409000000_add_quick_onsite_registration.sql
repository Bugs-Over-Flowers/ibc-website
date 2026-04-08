CREATE OR REPLACE FUNCTION "public"."quick_onsite_registration"(
  "p_event_day_id" "uuid",
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid" DEFAULT NULL::"uuid",
  "p_non_member_name" "text" DEFAULT NULL::"text",
  "p_payment_method" "text" DEFAULT 'onsite'::"text",
  "p_payment_path" "text" DEFAULT NULL::"text",
  "p_registrant" "jsonb" DEFAULT '{}'::"jsonb",
  "p_remark" "text" DEFAULT NULL::"text"
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_registration_id UUID;
  v_participant_id UUID;
  v_payment_proof_status "PaymentProofStatus";
  v_payment_method_enum "PaymentMethod";
BEGIN
  v_payment_method_enum := (
    CASE
      WHEN p_payment_method = 'online' THEN 'BPI'
      ELSE 'ONSITE'
    END
  )::"PaymentMethod";

  v_payment_proof_status := (
    CASE
      WHEN p_payment_method = 'online' THEN 'pending'
      ELSE 'accepted'
    END
  )::"PaymentProofStatus";

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
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

  IF p_payment_method = 'online' THEN
    INSERT INTO "ProofImage" (path, "registrationId")
    VALUES (p_payment_path, v_registration_id);
  END IF;

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


ALTER FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_remark" "text") OWNER TO "postgres";


GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_remark" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_remark" "text") TO "service_role";
