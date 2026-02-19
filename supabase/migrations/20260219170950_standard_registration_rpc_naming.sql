drop function if exists "public"."submit_event_registration"(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid, p_non_member_name text, p_payment_method text, p_payment_path text, p_registrant jsonb, p_other_participants jsonb);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.submit_event_registration_standard(p_event_id uuid, p_member_type text, p_identifier text, p_business_member_id uuid DEFAULT NULL::uuid, p_non_member_name text DEFAULT NULL::text, p_payment_method text DEFAULT 'onsite'::text, p_payment_path text DEFAULT NULL::text, p_registrant jsonb DEFAULT '{}'::jsonb, p_other_participants jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
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
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW()
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
END;$function$
;


