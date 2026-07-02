set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.submit_event_registration(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_paths jsonb DEFAULT '[]'::jsonb, p_registrant jsonb DEFAULT '{}'::jsonb, p_note text DEFAULT NULL::text, p_other_participants jsonb DEFAULT '[]'::jsonb, p_sponsored_registration_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_registration_id UUID;
  v_registration_fee REAL;
  v_payment_proof_status "PaymentProofStatus";
  v_payment_method_enum "PaymentMethod";
  v_principal_participant_id UUID;
  v_principal_identifier TEXT;
  v_all_participants JSONB;
  v_other_count INTEGER;
BEGIN
  v_payment_method_enum := (
    CASE
      WHEN p_payment_method = 'online' THEN 'BPI'
      ELSE 'ONSITE'
    END
  )::"PaymentMethod";

  SELECT COALESCE("registrationFee", 0)
  INTO v_registration_fee
  FROM "Event"
  WHERE "eventId" = p_event_id;

  v_payment_proof_status := (
    CASE
      WHEN v_registration_fee = 0 THEN 'accepted'
      ELSE 'pending'
    END
  )::"PaymentProofStatus";

  v_other_count := jsonb_array_length(p_other_participants);

  INSERT INTO "Registration" (
    "eventId",
    "paymentMethod",
    "paymentProofStatus",
    "businessMemberId",
    "nonMemberName",
    "identifier",
    "note",
    "registrationDate",
    "sponsoredRegistrationId",
    "numberOfParticipants"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    p_note,
    NOW(),
    p_sponsored_registration_id,
    v_other_count + 1
  )
  RETURNING "registrationId" INTO v_registration_id;

  -- Insert multiple proof images with order index
  IF p_payment_method = 'online' AND jsonb_array_length(p_payment_paths) > 0 THEN
    INSERT INTO "ProofImage" (path, "registrationId", "orderIndex")
    SELECT
      path_item->>'path',
      v_registration_id,
      (row_number() OVER ()) - 1
    FROM jsonb_array_elements(p_payment_paths) AS path_item;
  END IF;

  -- Insert principal participant with generated identifier
  v_principal_identifier := 'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "lastName",
    "contactNumber",
    email,
    "participantIdentifier"
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    p_registrant->>'lastName',
    p_registrant->>'contactNumber',
    p_registrant->>'email',
    v_principal_identifier
  )
  RETURNING "participantId" INTO v_principal_participant_id;

  v_all_participants := jsonb_build_array(
    jsonb_build_object(
      'participantId', v_principal_participant_id,
      'participantIdentifier', v_principal_identifier
    )
  );

  -- Insert additional participants with identifiers
  IF v_other_count > 0 THEN
    WITH inserted AS (
      INSERT INTO "Participant" (
        "registrationId",
        "isPrincipal",
        "firstName",
        "lastName",
        "contactNumber",
        email,
        "participantIdentifier"
      )
      SELECT
        v_registration_id,
        FALSE,
        registrant->>'firstName',
        registrant->>'lastName',
        registrant->>'contactNumber',
        registrant->>'email',
        'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
      FROM jsonb_array_elements(p_other_participants) AS registrant
      RETURNING "participantId", "participantIdentifier"
    )
    SELECT v_all_participants || jsonb_agg(
      jsonb_build_object(
        'participantId', "participantId",
        'participantIdentifier', "participantIdentifier"
      )
    )
    INTO v_all_participants
    FROM inserted;
  END IF;

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully',
    'participants', v_all_participants
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$function$
;
