-- Align RPCs with Registration.paymentProofStatus
-- Fix: The composite type registration_list_item had payment_status column
-- of type PaymentStatus, but it should be payment_proof_status of type PaymentProofStatus

-- Drop dependent function first (it references the type)
DROP FUNCTION IF EXISTS "public"."get_registration_list"(
  "p_event_id" "uuid",
  "p_search_text" "text",
  "p_payment_status" "public"."PaymentStatus"
);

-- Drop the old type and recreate with correct column type
DROP TYPE IF EXISTS "public"."registration_list_item";

CREATE TYPE "public"."registration_list_item" AS (
  "registration_id" "uuid",
  "affiliation" "text",
  "registration_date" timestamp with time zone,
  "payment_proof_status" "public"."PaymentProofStatus",
  "payment_method" "public"."PaymentMethod",
  "business_member_id" "uuid",
  "business_name" "text",
  "is_member" boolean,
  "registrant" "jsonb",
  "people" integer,
  "registration_identifier" "text"
);

CREATE OR REPLACE FUNCTION "public"."get_registration_list"(
  "p_event_id" "uuid",
  "p_search_text" "text" DEFAULT NULL::"text",
  "p_payment_proof_status" "public"."PaymentProofStatus" DEFAULT NULL::"public"."PaymentProofStatus"
) RETURNS SETOF "public"."registration_list_item"
LANGUAGE "plpgsql" STABLE SECURITY DEFINER
AS $$
DECLARE
  v_search_pattern TEXT;
BEGIN
  PERFORM set_limit(0.3);

  IF p_search_text IS NOT NULL THEN
    v_search_pattern := '%' || p_search_text || '%';
  END IF;

  RETURN QUERY
  SELECT
    r."registrationId",
    COALESCE(bm."businessName", r."nonMemberName") AS affiliation,
    r."registrationDate",
    r."paymentProofStatus",
    r."paymentMethod",
    bm."businessMemberId",
    bm."businessName",
    (bm."businessMemberId" IS NOT NULL) AS is_member,
    CASE
      WHEN p_data.principal_id IS NOT NULL THEN
        jsonb_build_object(
          'firstName', p_data.p_first_name,
          'lastName', p_data.p_last_name,
          'email', p_data.p_email
        )
      ELSE NULL
    END,
    COALESCE(p_data.total_people, 0)::INTEGER AS people,
    r."identifier" AS registration_identifier
  FROM "Registration" r
  LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS total_people,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."participantId"::text END) AS principal_id,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."firstName" END) AS p_first_name,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p."lastName" END) AS p_last_name,
      MAX(CASE WHEN sub_p."isPrincipal" THEN sub_p.email END) AS p_email
    FROM "Participant" sub_p
    WHERE sub_p."registrationId" = r."registrationId"
  ) p_data ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(bm."businessName", r."nonMemberName") AS affiliation,
      CASE
        WHEN p_search_text IS NOT NULL THEN
          GREATEST(
            similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text),
            similarity(p_data.p_first_name || ' ' || p_data.p_last_name, p_search_text)
          )
        ELSE 0
      END AS sim_score,
      CASE
        WHEN p_search_text IS NOT NULL THEN
          (
            COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
            OR (p_data.p_first_name || ' ' || p_data.p_last_name) ILIKE v_search_pattern
            OR p_data.p_email ILIKE v_search_pattern
          )
        ELSE FALSE
      END AS is_exact_match
  ) s ON true
  WHERE r."eventId" = p_event_id
    AND s.affiliation IS NOT NULL
    AND (
      p_payment_proof_status IS NULL
      OR r."paymentProofStatus" = p_payment_proof_status::"PaymentProofStatus"
    )
    AND (
      p_search_text IS NULL
      OR s.is_exact_match
      OR s.sim_score > 0.3
    )
  ORDER BY
    CASE WHEN p_search_text IS NOT NULL THEN s.is_exact_match ELSE FALSE END DESC,
    CASE WHEN p_search_text IS NOT NULL THEN s.sim_score ELSE 0 END DESC,
    r."registrationDate" DESC;
END;
$$;

ALTER FUNCTION "public"."get_registration_list"(
  "p_event_id" "uuid",
  "p_search_text" "text",
  "p_payment_proof_status" "public"."PaymentProofStatus"
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_event_participant_list"(
  "p_event_id" "uuid",
  "p_search_text" "text" DEFAULT NULL::"text"
) RETURNS SETOF "public"."participant_list_item"
LANGUAGE "plpgsql" STABLE SECURITY DEFINER
AS $$
DECLARE
  v_search_pattern TEXT;
BEGIN
  PERFORM set_limit(0.3);

  IF p_search_text IS NOT NULL THEN
    v_search_pattern := '%' || p_search_text || '%';
  END IF;

  RETURN QUERY
  SELECT
    p."participantId",
    p."firstName",
    p."lastName",
    p."email",
    p."contactNumber",
    COALESCE(bm."businessName", r."nonMemberName") AS "affiliation",
    r."registrationDate",
    r."registrationId"
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    AND (
      p_search_text IS NULL
      OR p_search_text = ''
      OR (p."firstName" % p_search_text OR p."firstName" ILIKE v_search_pattern)
      OR (p."lastName" % p_search_text OR p."lastName" ILIKE v_search_pattern)
      OR ((p."firstName" || ' ' || p."lastName") % p_search_text OR (p."firstName" || ' ' || p."lastName") ILIKE v_search_pattern)
      OR (p.email <% p_search_text OR p.email ILIKE v_search_pattern)
      OR (COALESCE(bm."businessName", r."nonMemberName") <% p_search_text OR COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern)
    )
  ORDER BY
    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
      CASE
        WHEN (
          p."firstName" ILIKE v_search_pattern
          OR p."lastName" ILIKE v_search_pattern
          OR (p."firstName" || ' ' || p."lastName") ILIKE v_search_pattern
          OR p."email" ILIKE v_search_pattern
          OR COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
        ) THEN 1
        ELSE 0
      END
    ELSE 0 END DESC,
    CASE WHEN p_search_text IS NOT NULL AND p_search_text <> '' THEN
      GREATEST(
        similarity(p."firstName", p_search_text),
        similarity(p."lastName", p_search_text),
        similarity(p."firstName" || ' ' || p."lastName", p_search_text),
        similarity(p."email", p_search_text),
        similarity(COALESCE(bm."businessName", r."nonMemberName"), p_search_text)
      )
    ELSE 0 END DESC,
    r."registrationDate" DESC;
END;
$$;

ALTER FUNCTION "public"."get_event_participant_list"(
  "p_event_id" "uuid",
  "p_search_text" "text"
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_event_status"("p_event_id" "uuid") RETURNS "jsonb"
LANGUAGE "plpgsql" STABLE
AS $$
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
  SELECT COUNT(*) INTO total_regs
  FROM "Registration" r
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(*) INTO verified_regs
  FROM "Registration" r
  WHERE r."eventId" = p_event_id
    AND lower(coalesce(r."paymentProofStatus"::text, '')) = 'accepted';

  SELECT COUNT(*) INTO pending_regs
  FROM "Registration" r
  WHERE r."eventId" = p_event_id
    AND lower(coalesce(r."paymentProofStatus"::text, '')) = 'pending';

  SELECT COUNT(DISTINCT p."participantId") INTO participants_total
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id)
  INTO has_event_days;

  IF has_event_days THEN
    FOR day_rec IN
      SELECT ed."eventDayId" AS day_id, ed."label" AS day_label, ed."eventDate" AS day_date
      FROM "EventDay" ed
      WHERE ed."eventId" = p_event_id
      ORDER BY ed."eventDate", ed."eventDayId"
    LOOP
      SELECT COUNT(DISTINCT ci."participantId") INTO participants_day
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND ci."eventDayId" = day_rec.day_id;

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
        'day_id', NULL,
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
$$;

ALTER FUNCTION "public"."get_event_status"("p_event_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_registration_list_stats"("p_event_id" "uuid") RETURNS "public"."registration_stats"
LANGUAGE "plpgsql" STABLE SECURITY DEFINER
AS $$
DECLARE
  v_result registration_stats;
BEGIN
  SELECT
    COUNT(DISTINCT r."registrationId")::INTEGER AS "totalRegistrations",
    COUNT(DISTINCT r."registrationId") FILTER (WHERE r."paymentProofStatus" = 'accepted')::INTEGER AS "verifiedRegistrations",
    COUNT(DISTINCT r."registrationId") FILTER (WHERE r."paymentProofStatus" = 'pending')::INTEGER AS "pendingRegistrations",
    COUNT(p."participantId") FILTER (WHERE r."paymentProofStatus" = 'accepted')::INTEGER AS "totalParticipants"
  INTO v_result
  FROM "Registration" r
  LEFT JOIN "Participant" p ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id;

  RETURN v_result;
END;
$$;

ALTER FUNCTION "public"."get_registration_list_stats"("p_event_id" "uuid") OWNER TO "postgres";

DROP FUNCTION IF EXISTS "public"."get_registrations_by_sponsored_id"("p_sponsored_registration_id" "uuid");

CREATE OR REPLACE FUNCTION "public"."get_registrations_by_sponsored_id"("p_sponsored_registration_id" "uuid") RETURNS TABLE(
  "registrationId" "uuid",
  "eventId" "uuid",
  "businessMemberId" "uuid",
  "sponsoredRegistrationId" "uuid",
  "nonMemberName" "text",
  "numberOfParticipants" integer,
  "paymentProofStatus" "public"."PaymentProofStatus",
  "paymentMethod" "public"."PaymentMethod",
  "registrationDate" timestamp with time zone,
  "identifier" "text",
  "participants" "jsonb"
)
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT
    r."registrationId",
    r."eventId",
    r."businessMemberId",
    r."sponsoredRegistrationId",
    r."nonMemberName",
    r."numberOfParticipants",
    r."paymentProofStatus",
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
$$;

ALTER FUNCTION "public"."get_registrations_by_sponsored_id"("p_sponsored_registration_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."submit_event_registration"(
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid" DEFAULT NULL::"uuid",
  "p_non_member_name" "text" DEFAULT NULL::"text",
  "p_payment_method" "text" DEFAULT 'onsite'::"text",
  "p_payment_path" "text" DEFAULT NULL::"text",
  "p_registrant" "jsonb" DEFAULT '{}'::"jsonb",
  "p_other_participants" "jsonb" DEFAULT '[]'::"jsonb",
  "p_sponsored_registration_id" "uuid" DEFAULT NULL::"uuid"
) RETURNS "jsonb"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
  v_registration_id UUID;
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
    "registrationDate",
    "sponsoredRegistrationId"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW(),
    p_sponsored_registration_id
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
  );

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

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );
END;
$$;

ALTER FUNCTION "public"."submit_event_registration"(
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid",
  "p_non_member_name" "text",
  "p_payment_method" "text",
  "p_payment_path" "text",
  "p_registrant" "jsonb",
  "p_other_participants" "jsonb",
  "p_sponsored_registration_id" "uuid"
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."submit_event_registration_standard"(
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid" DEFAULT NULL::"uuid",
  "p_non_member_name" "text" DEFAULT NULL::"text",
  "p_payment_method" "text" DEFAULT 'onsite'::"text",
  "p_payment_path" "text" DEFAULT NULL::"text",
  "p_registrant" "jsonb" DEFAULT '{}'::"jsonb",
  "p_other_participants" "jsonb" DEFAULT '[]'::"jsonb"
) RETURNS "jsonb"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
  v_registration_id UUID;
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
  );

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

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );
END;
$$;

ALTER FUNCTION "public"."submit_event_registration_standard"(
  "p_event_id" "uuid",
  "p_member_type" "text",
  "p_identifier" "text",
  "p_business_member_id" "uuid",
  "p_non_member_name" "text",
  "p_payment_method" "text",
  "p_payment_path" "text",
  "p_registrant" "jsonb",
  "p_other_participants" "jsonb"
) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_registration_list"(
  "p_event_id" "uuid",
  "p_search_text" "text",
  "p_payment_proof_status" "public"."PaymentProofStatus"
) TO "anon";

GRANT ALL ON FUNCTION "public"."get_registration_list"(
  "p_event_id" "uuid",
  "p_search_text" "text",
  "p_payment_proof_status" "public"."PaymentProofStatus"
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_registration_list"(
  "p_event_id" "uuid",
  "p_search_text" "text",
  "p_payment_proof_status" "public"."PaymentProofStatus"
) TO "service_role";
