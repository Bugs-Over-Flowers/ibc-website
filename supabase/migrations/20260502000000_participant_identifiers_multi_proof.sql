-- Migration: Add participant identifiers, multi-proof support, orderIndex
-- 2026-05-02

-- ============================================================
-- 1. Add participantIdentifier to Participant table
-- ============================================================
ALTER TABLE "public"."Participant"
ADD COLUMN "participantIdentifier" TEXT;

UPDATE "public"."Participant"
SET "participantIdentifier" = 'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
WHERE "participantIdentifier" IS NULL;

ALTER TABLE "public"."Participant"
ALTER COLUMN "participantIdentifier" SET NOT NULL;

ALTER TABLE "public"."Participant"
ADD CONSTRAINT "Participant_identifier_key" UNIQUE ("participantIdentifier");

CREATE INDEX IF NOT EXISTS "Participant_participantIdentifier_idx"
ON "public"."Participant" ("participantIdentifier");

-- ============================================================
-- 2. Add orderIndex to ProofImage for multi-proof ordering
-- ============================================================
ALTER TABLE "public"."ProofImage"
ADD COLUMN "orderIndex" INTEGER DEFAULT 0;

-- ============================================================
-- 3. Update participant_list_item type to include identifier
-- ============================================================
ALTER TYPE "public"."participant_list_item"
ADD ATTRIBUTE "participant_identifier" TEXT;

-- ============================================================
-- 4. Replace submit_event_registration RPC
--    - p_payment_paths (JSONB array) replaces p_payment_path
--    - Generates participantIdentifier for each participant
--    - Returns participants array with IDs + identifiers
--    - Includes p_sponsored_registration_id support
--    - Sets numberOfParticipants on Registration
-- ============================================================
DROP FUNCTION IF EXISTS "public"."submit_event_registration";

CREATE OR REPLACE FUNCTION "public"."submit_event_registration"(
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID DEFAULT NULL,
  p_non_member_name TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'onsite',
  p_payment_paths JSONB DEFAULT '[]'::jsonb,
  p_registrant JSONB DEFAULT '{}'::jsonb,
  p_note TEXT DEFAULT NULL,
  p_other_participants JSONB DEFAULT '[]'::jsonb,
  p_sponsored_registration_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_registration_id UUID;
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

  v_payment_proof_status := (
    CASE
      WHEN p_payment_method = 'online' THEN 'pending'
      ELSE 'accepted'
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
$$;

ALTER FUNCTION "public"."submit_event_registration"(
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_payment_method TEXT,
  p_payment_paths JSONB,
  p_registrant JSONB,
  p_note TEXT,
  p_other_participants JSONB,
  p_sponsored_registration_id UUID
) OWNER TO "postgres";

-- ============================================================
-- 5. Replace quick_onsite_registration RPC
--    - Generates participantIdentifier for registered participant
-- ============================================================
DROP FUNCTION IF EXISTS "public"."quick_onsite_registration";

CREATE OR REPLACE FUNCTION "public"."quick_onsite_registration"(
  p_event_day_id UUID,
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID DEFAULT NULL,
  p_non_member_name TEXT DEFAULT NULL,
  p_registrant JSONB DEFAULT '{}'::jsonb,
  p_remark TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_registration_id UUID;
  v_participant_id UUID;
  v_participant_identifier TEXT;
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
    "registrationDate",
    "numberOfParticipants"
  ) VALUES (
    p_event_id,
    'ONSITE',
    'accepted',
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW(),
    1
  )
  RETURNING "registrationId" INTO v_registration_id;

  v_participant_identifier := 'ibc-par-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);

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
    v_participant_identifier
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
    'participantId', v_participant_id,
    'participantIdentifier', v_participant_identifier,
    'message', 'Registration created successfully'
  );
END;
$$;

ALTER FUNCTION "public"."quick_onsite_registration"(
  p_event_day_id UUID,
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_registrant JSONB,
  p_remark TEXT
) OWNER TO "postgres";

-- ============================================================
-- 6. Replace get_event_participant_list RPC
--    - Returns participantIdentifier in results
-- ============================================================
DROP FUNCTION IF EXISTS "public"."get_event_participant_list";

CREATE OR REPLACE FUNCTION "public"."get_event_participant_list"(
  p_event_id UUID,
  p_search_text TEXT DEFAULT NULL
) RETURNS SETOF "public"."participant_list_item"
LANGUAGE plpgsql STABLE SECURITY DEFINER
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
    r."registrationId",
    p."participantIdentifier"
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
  p_event_id UUID,
  p_search_text TEXT
) OWNER TO "postgres";

-- ============================================================
-- 7. Grant permissions for the updated functions
-- ============================================================
GRANT ALL ON FUNCTION "public"."submit_event_registration"(
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_payment_method TEXT,
  p_payment_paths JSONB,
  p_registrant JSONB,
  p_note TEXT,
  p_other_participants JSONB,
  p_sponsored_registration_id UUID
) TO "anon";

GRANT ALL ON FUNCTION "public"."submit_event_registration"(
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_payment_method TEXT,
  p_payment_paths JSONB,
  p_registrant JSONB,
  p_note TEXT,
  p_other_participants JSONB,
  p_sponsored_registration_id UUID
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."submit_event_registration"(
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_payment_method TEXT,
  p_payment_paths JSONB,
  p_registrant JSONB,
  p_note TEXT,
  p_other_participants JSONB,
  p_sponsored_registration_id UUID
) TO "service_role";

GRANT ALL ON FUNCTION "public"."quick_onsite_registration"(
  p_event_day_id UUID,
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_registrant JSONB,
  p_remark TEXT
) TO "anon";

GRANT ALL ON FUNCTION "public"."quick_onsite_registration"(
  p_event_day_id UUID,
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_registrant JSONB,
  p_remark TEXT
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."quick_onsite_registration"(
  p_event_day_id UUID,
  p_event_id UUID,
  p_member_type TEXT,
  p_identifier TEXT,
  p_business_member_id UUID,
  p_non_member_name TEXT,
  p_registrant JSONB,
  p_remark TEXT
) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_event_participant_list"(
  p_event_id UUID,
  p_search_text TEXT
) TO "anon";

GRANT ALL ON FUNCTION "public"."get_event_participant_list"(
  p_event_id UUID,
  p_search_text TEXT
) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_event_participant_list"(
  p_event_id UUID,
  p_search_text TEXT
) TO "service_role";
