-- Fix: Recreate registration_list_item type and get_registration_list function
-- The remote_schema migration recreated the type with wrong enum (PaymentStatus instead of PaymentProofStatus)

-- Drop the type with CASCADE to remove dependent function
DROP TYPE IF EXISTS "public"."registration_list_item" CASCADE;

-- Recreate the composite type with correct PaymentProofStatus enum
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

ALTER TYPE "public"."registration_list_item" OWNER TO "postgres";

-- Recreate get_registration_list function
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

-- Grant permissions
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
