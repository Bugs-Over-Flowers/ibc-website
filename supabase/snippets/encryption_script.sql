-- Encryption related schema changes. Do not touch for now.

BEGIN;

ALTER TABLE "public"."Application"
  ADD COLUMN IF NOT EXISTS "companyNameEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "companyAddressEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "landlineEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "mobileNumberEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "emailAddressEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "websiteURLEncrypted" bytea;

ALTER TABLE "public"."ApplicationMember"
  ADD COLUMN IF NOT EXISTS "firstNameEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "lastNameEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "mailingAddressEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "sexEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "nationalityEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "birthdateEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "companyDesignationEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "landlineEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "mobileNumberEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "emailAddressEncrypted" bytea;

ALTER TABLE "public"."Registration"
  ADD COLUMN IF NOT EXISTS "nonMemberNameEncrypted" bytea;

ALTER TABLE "public"."Participant"
  ADD COLUMN IF NOT EXISTS "firstNameEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "lastNameEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "contactNumberEncrypted" bytea,
  ADD COLUMN IF NOT EXISTS "emailEncrypted" bytea;

ALTER TABLE "public"."SponsoredRegistration"
  ADD COLUMN IF NOT EXISTS "sponsoredByEncrypted" bytea;

CREATE OR REPLACE FUNCTION "public"."encrypt_text"("p_plain_text" text, "p_encryption_key" text) RETURNS bytea
  LANGUAGE "sql"
  IMMUTABLE
  STRICT
  PARALLEL SAFE
  AS $$
    SELECT CASE
      WHEN btrim(p_plain_text) = '' THEN NULL
      ELSE extensions.pgp_sym_encrypt(
        p_plain_text,
        p_encryption_key,
        'cipher-algo=aes256, compress-algo=1'
      )
    END;
  $$;

CREATE OR REPLACE FUNCTION "public"."decrypt_text"("p_cipher_text" bytea, "p_encryption_key" text) RETURNS text
  LANGUAGE "plpgsql"
  STABLE
  AS $$
BEGIN
  IF p_cipher_text IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN extensions.pgp_sym_decrypt(p_cipher_text, p_encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."backfill_sensitive_encryption"("p_encryption_key" text) RETURNS void
  LANGUAGE "plpgsql"
  SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required for backfill';
  END IF;

  UPDATE "Application"
  SET
    "companyNameEncrypted" = "public"."encrypt_text"("companyName", p_encryption_key),
    "companyAddressEncrypted" = "public"."encrypt_text"("companyAddress", p_encryption_key),
    "landlineEncrypted" = "public"."encrypt_text"("landline", p_encryption_key),
    "mobileNumberEncrypted" = "public"."encrypt_text"("mobileNumber", p_encryption_key),
    "emailAddressEncrypted" = "public"."encrypt_text"("emailAddress", p_encryption_key),
    "websiteURLEncrypted" = "public"."encrypt_text"("websiteURL", p_encryption_key)
  WHERE
    "companyNameEncrypted" IS NULL
    OR "companyAddressEncrypted" IS NULL
    OR "landlineEncrypted" IS NULL
    OR "mobileNumberEncrypted" IS NULL
    OR "emailAddressEncrypted" IS NULL
    OR "websiteURLEncrypted" IS NULL;

  UPDATE "ApplicationMember"
  SET
    "firstNameEncrypted" = "public"."encrypt_text"("firstName", p_encryption_key),
    "lastNameEncrypted" = "public"."encrypt_text"("lastName", p_encryption_key),
    "mailingAddressEncrypted" = "public"."encrypt_text"("mailingAddress", p_encryption_key),
    "sexEncrypted" = "public"."encrypt_text"("sex", p_encryption_key),
    "nationalityEncrypted" = "public"."encrypt_text"("nationality", p_encryption_key),
    "birthdateEncrypted" = "public"."encrypt_text"("birthdate"::text, p_encryption_key),
    "companyDesignationEncrypted" = "public"."encrypt_text"("companyDesignation", p_encryption_key),
    "landlineEncrypted" = "public"."encrypt_text"("landline", p_encryption_key),
    "mobileNumberEncrypted" = "public"."encrypt_text"("mobileNumber", p_encryption_key),
    "emailAddressEncrypted" = "public"."encrypt_text"("emailAddress", p_encryption_key)
  WHERE
    "firstNameEncrypted" IS NULL
    OR "lastNameEncrypted" IS NULL
    OR "mailingAddressEncrypted" IS NULL
    OR "sexEncrypted" IS NULL
    OR "nationalityEncrypted" IS NULL
    OR "birthdateEncrypted" IS NULL
    OR "companyDesignationEncrypted" IS NULL
    OR "landlineEncrypted" IS NULL
    OR "mobileNumberEncrypted" IS NULL
    OR "emailAddressEncrypted" IS NULL;

  UPDATE "Registration"
  SET "nonMemberNameEncrypted" = "public"."encrypt_text"("nonMemberName", p_encryption_key)
  WHERE "nonMemberName" IS NOT NULL AND "nonMemberNameEncrypted" IS NULL;

  UPDATE "Participant"
  SET
    "firstNameEncrypted" = "public"."encrypt_text"("firstName", p_encryption_key),
    "lastNameEncrypted" = "public"."encrypt_text"("lastName", p_encryption_key),
    "contactNumberEncrypted" = "public"."encrypt_text"("contactNumber", p_encryption_key),
    "emailEncrypted" = "public"."encrypt_text"("email", p_encryption_key)
  WHERE
    "firstNameEncrypted" IS NULL
    OR "lastNameEncrypted" IS NULL
    OR "contactNumberEncrypted" IS NULL
    OR "emailEncrypted" IS NULL;

UPDATE "SponsoredRegistration"
  SET "sponsoredByEncrypted" = "public"."encrypt_text"("sponsoredBy", p_encryption_key)
  WHERE "sponsoredByEncrypted" IS NULL;
END;
$$;

DROP FUNCTION IF EXISTS "public"."create_sponsored_registration"("uuid", "text", "numeric", "bigint", "text");

CREATE OR REPLACE FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint DEFAULT NULL::bigint, "p_encryption_key" "text" DEFAULT NULL::text) RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
DECLARE
  v_row public."SponsoredRegistration"%ROWTYPE;
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'encryption key is required'
    );
  END IF;

  IF p_fee_deduction IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'feeDeduction is required'
    );
  END IF;

  IF p_fee_deduction < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'feeDeduction cannot be negative'
    );
  END IF;

  INSERT INTO public."SponsoredRegistration" (
    "eventId",
    "sponsoredBy",
    "sponsoredByEncrypted",
    "feeDeduction",
    "maxSponsoredGuests",
    "status",
    "uuid"
  )
  VALUES (
    p_event_id,
    p_sponsored_by,
    "public"."encrypt_text"(p_sponsored_by, p_encryption_key),
    p_fee_deduction,
    p_max_sponsored_guests,
    'active'::public."SponsoredRegistrationStatus",
    gen_random_uuid()::text
  )
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'success', true,
    'data', to_jsonb(v_row)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_sponsored_registration_sponsor_name"("p_sponsored_registration_id" "uuid", "p_sponsored_by" "text", "p_encryption_key" "text" DEFAULT NULL::text) RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
DECLARE
  v_row public."SponsoredRegistration"%ROWTYPE;
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'encryption key is required'
    );
  END IF;

  UPDATE public."SponsoredRegistration"
  SET
    "sponsoredBy" = p_sponsored_by,
    "sponsoredByEncrypted" = "public"."encrypt_text"(p_sponsored_by, p_encryption_key)
  WHERE "sponsoredRegistrationId" = p_sponsored_registration_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Sponsored registration not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', to_jsonb(v_row)
  );
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_sponsored_registration_by_id"("registration_id" "uuid", "p_encryption_key" "text" DEFAULT NULL::text) RETURNS SETOF "public"."SponsoredRegistration"
  LANGUAGE "plpgsql"
  SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

  RETURN QUERY
  SELECT
    sr."sponsoredRegistrationId",
    sr."uuid",
    sr."eventId",
    COALESCE("public"."decrypt_text"(sr."sponsoredByEncrypted", p_encryption_key), sr."sponsoredBy") AS "sponsoredBy",
    sr."sponsoredByEncrypted",
    sr."feeDeduction",
    sr."maxSponsoredGuests",
    sr."usedCount",
    sr."status",
    sr."createdAt",
    sr."updatedAt"
  FROM "SponsoredRegistration" sr
  WHERE sr."sponsoredRegistrationId" = registration_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_sr_by_event_id"("p_event_id" "uuid", "p_encryption_key" "text" DEFAULT NULL::text) RETURNS SETOF "public"."SponsoredRegistration"
  LANGUAGE "plpgsql"
  STABLE SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

  RETURN QUERY
  SELECT
    sr."sponsoredRegistrationId",
    sr."uuid",
    sr."eventId",
    COALESCE("public"."decrypt_text"(sr."sponsoredByEncrypted", p_encryption_key), sr."sponsoredBy") AS "sponsoredBy",
    sr."sponsoredByEncrypted",
    sr."feeDeduction",
    sr."maxSponsoredGuests",
    sr."usedCount",
    sr."status",
    sr."createdAt",
    sr."updatedAt"
  FROM "SponsoredRegistration" sr
  WHERE sr."eventId" = p_event_id
  ORDER BY sr."createdAt" DESC;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_all_sponsored_registrations_with_event"("p_encryption_key" "text" DEFAULT NULL::text) RETURNS TABLE("created_at" timestamp with time zone, "event_end_date" timestamp with time zone, "event_id" uuid, "event_start_date" timestamp with time zone, "event_title" text, "max_sponsored_guests" bigint, "sponsored_by" text, "sponsored_registration_id" uuid, "status" public."SponsoredRegistrationStatus", "updated_at" timestamp with time zone, "used_count" bigint, "uuid" text)
  LANGUAGE "plpgsql"
  STABLE SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

  RETURN QUERY
  SELECT
    sr."createdAt",
    e."eventEndDate",
    sr."eventId",
    e."eventStartDate",
    e."eventTitle",
    sr."maxSponsoredGuests",
    COALESCE("public"."decrypt_text"(sr."sponsoredByEncrypted", p_encryption_key), sr."sponsoredBy") AS "sponsored_by",
    sr."sponsoredRegistrationId",
    sr."status",
    sr."updatedAt",
    sr."usedCount",
    sr."uuid"
  FROM "SponsoredRegistration" sr
  LEFT JOIN "Event" e ON e."eventId" = sr."eventId"
  ORDER BY sr."createdAt" DESC;
END;
$$;

DROP FUNCTION IF EXISTS "public"."quick_onsite_registration"("uuid", "uuid", "text", "text", "uuid", "text", "jsonb", "text");

CREATE OR REPLACE FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid" DEFAULT NULL::"uuid", "p_non_member_name" "text" DEFAULT NULL::"text", "p_registrant" "jsonb" DEFAULT '{}'::"jsonb", "p_remark" "text" DEFAULT NULL::"text", "p_encryption_key" "text" DEFAULT NULL::"text") RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER
  AS $$
DECLARE
  v_registration_id UUID;
  v_participant_id UUID;
  v_event_day_belongs_to_event BOOLEAN;
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

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
    "nonMemberNameEncrypted",
    "identifier",
    "registrationDate"
  ) VALUES (
    p_event_id,
    'ONSITE',
    'accepted',
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN "public"."encrypt_text"(p_non_member_name, p_encryption_key) ELSE NULL END,
    p_identifier,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

  INSERT INTO "Participant" (
    "registrationId",
    "isPrincipal",
    "firstName",
    "firstNameEncrypted",
    "lastName",
    "lastNameEncrypted",
    "contactNumber",
    "contactNumberEncrypted",
    email,
    "emailEncrypted"
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    "public"."encrypt_text"(p_registrant->>'firstName', p_encryption_key),
    p_registrant->>'lastName',
    "public"."encrypt_text"(p_registrant->>'lastName', p_encryption_key),
    p_registrant->>'contactNumber',
    "public"."encrypt_text"(p_registrant->>'contactNumber', p_encryption_key),
    p_registrant->>'email',
    "public"."encrypt_text"(p_registrant->>'email', p_encryption_key)
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

DROP FUNCTION IF EXISTS "public"."submit_event_registration"("uuid", "text", "text", "uuid", "text", "text", "text", "jsonb", "jsonb", "uuid");

CREATE OR REPLACE FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid" DEFAULT NULL::"uuid", "p_non_member_name" "text" DEFAULT NULL::"text", "p_payment_method" "text" DEFAULT 'onsite'::"text", "p_payment_path" "text" DEFAULT NULL::"text", "p_registrant" "jsonb" DEFAULT '{}'::"jsonb", "p_other_participants" "jsonb" DEFAULT '[]'::"jsonb", "p_sponsored_registration_id" "uuid" DEFAULT NULL::"uuid", "p_encryption_key" "text" DEFAULT NULL::"text") RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER
  AS $$
DECLARE
  v_registration_id UUID;
  v_payment_proof_status "PaymentProofStatus";
  v_payment_method_enum "PaymentMethod";
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

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
    "nonMemberNameEncrypted",
    "identifier",
    "registrationDate",
    "sponsoredRegistrationId"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN "public"."encrypt_text"(p_non_member_name, p_encryption_key) ELSE NULL END,
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
    "firstNameEncrypted",
    "lastName",
    "lastNameEncrypted",
    "contactNumber",
    "contactNumberEncrypted",
    email,
    "emailEncrypted"
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    "public"."encrypt_text"(p_registrant->>'firstName', p_encryption_key),
    p_registrant->>'lastName',
    "public"."encrypt_text"(p_registrant->>'lastName', p_encryption_key),
    p_registrant->>'contactNumber',
    "public"."encrypt_text"(p_registrant->>'contactNumber', p_encryption_key),
    p_registrant->>'email',
    "public"."encrypt_text"(p_registrant->>'email', p_encryption_key)
  );

  IF jsonb_array_length(p_other_participants) > 0 THEN
    INSERT INTO "Participant" (
      "registrationId",
      "isPrincipal",
      "firstName",
      "firstNameEncrypted",
      "lastName",
      "lastNameEncrypted",
      "contactNumber",
      "contactNumberEncrypted",
      email,
      "emailEncrypted"
    )
    SELECT
      v_registration_id,
      FALSE,
      registrant->>'firstName',
      "public"."encrypt_text"(registrant->>'firstName', p_encryption_key),
      registrant->>'lastName',
      "public"."encrypt_text"(registrant->>'lastName', p_encryption_key),
      registrant->>'contactNumber',
      "public"."encrypt_text"(registrant->>'contactNumber', p_encryption_key),
      registrant->>'email',
      "public"."encrypt_text"(registrant->>'email', p_encryption_key)
    FROM jsonb_array_elements(p_other_participants) AS registrant;
  END IF;

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );
END;
$$;

DROP FUNCTION IF EXISTS "public"."submit_event_registration_standard"("uuid", "text", "text", "uuid", "text", "text", "text", "jsonb", "jsonb");

CREATE OR REPLACE FUNCTION "public"."submit_event_registration_standard"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid" DEFAULT NULL::"uuid", "p_non_member_name" "text" DEFAULT NULL::"text", "p_payment_method" "text" DEFAULT 'onsite'::"text", "p_payment_path" "text" DEFAULT NULL::"text", "p_registrant" "jsonb" DEFAULT '{}'::"jsonb", "p_other_participants" "jsonb" DEFAULT '[]'::"jsonb", "p_encryption_key" "text" DEFAULT NULL::"text") RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER
  AS $$
DECLARE
  v_registration_id UUID;
  v_payment_proof_status "PaymentProofStatus";
  v_payment_method_enum "PaymentMethod";
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

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
    "nonMemberNameEncrypted",
    "identifier",
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN "public"."encrypt_text"(p_non_member_name, p_encryption_key) ELSE NULL END,
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
    "firstNameEncrypted",
    "lastName",
    "lastNameEncrypted",
    "contactNumber",
    "contactNumberEncrypted",
    email,
    "emailEncrypted"
  ) VALUES (
    v_registration_id,
    TRUE,
    p_registrant->>'firstName',
    "public"."encrypt_text"(p_registrant->>'firstName', p_encryption_key),
    p_registrant->>'lastName',
    "public"."encrypt_text"(p_registrant->>'lastName', p_encryption_key),
    p_registrant->>'contactNumber',
    "public"."encrypt_text"(p_registrant->>'contactNumber', p_encryption_key),
    p_registrant->>'email',
    "public"."encrypt_text"(p_registrant->>'email', p_encryption_key)
  );

  IF jsonb_array_length(p_other_participants) > 0 THEN
    INSERT INTO "Participant" (
      "registrationId",
      "isPrincipal",
      "firstName",
      "firstNameEncrypted",
      "lastName",
      "lastNameEncrypted",
      "contactNumber",
      "contactNumberEncrypted",
      email,
      "emailEncrypted"
    )
    SELECT
      v_registration_id,
      FALSE,
      registrant->>'firstName',
      "public"."encrypt_text"(registrant->>'firstName', p_encryption_key),
      registrant->>'lastName',
      "public"."encrypt_text"(registrant->>'lastName', p_encryption_key),
      registrant->>'contactNumber',
      "public"."encrypt_text"(registrant->>'contactNumber', p_encryption_key),
      registrant->>'email',
      "public"."encrypt_text"(registrant->>'email', p_encryption_key)
    FROM jsonb_array_elements(p_other_participants) AS registrant;
  END IF;

  RETURN jsonb_build_object(
    'registrationId', v_registration_id,
    'message', 'Registration created successfully'
  );
END;
$$;

DROP FUNCTION IF EXISTS "public"."submit_membership_application"("text", "jsonb", "jsonb", "text", "text", "text");

CREATE OR REPLACE FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text" DEFAULT NULL::"text", "p_encryption_key" "text" DEFAULT NULL::"text") RETURNS "jsonb"
  LANGUAGE "plpgsql"
  AS $$
DECLARE
  v_application_id uuid;
  v_identifier text;
  v_app_type_enum "ApplicationType";
  v_pay_method_enum "PaymentMethod";
  v_pay_status_enum "PaymentProofStatus";
  v_sector_id int;
  v_business_member_id uuid;
  v_member_exists boolean;
  representative jsonb;
  v_rep_type_text text;
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

  v_application_id := gen_random_uuid();
  v_identifier := 'ibc-app-' || left(replace(v_application_id::text, '-', ''), 8);

  v_app_type_enum := p_application_type::"ApplicationType";
  v_pay_method_enum := p_payment_method::"PaymentMethod";
  v_pay_status_enum := 'pending'::"PaymentProofStatus";

  IF v_pay_method_enum = 'BPI' AND (p_payment_proof_url IS NULL OR p_payment_proof_url = '') THEN
    RAISE EXCEPTION 'Proof of payment is required for online transactions.';
  END IF;

  v_sector_id := (p_company_details->>'sectorId')::int;

  IF p_company_details->>'businessMemberId' IS NOT NULL AND p_company_details->>'businessMemberId' != '' THEN
    v_business_member_id := (p_company_details->>'businessMemberId')::uuid;
  ELSE
    v_business_member_id := NULL;
  END IF;

  IF v_app_type_enum IN ('renewal', 'updating') THEN
    IF v_business_member_id IS NULL THEN
      RAISE EXCEPTION 'Member ID is required for % applications.', p_application_type;
    END IF;

    SELECT EXISTS(
      SELECT 1 FROM "BusinessMember" WHERE "businessMemberId" = v_business_member_id
    ) INTO v_member_exists;

    IF NOT v_member_exists THEN
      RAISE EXCEPTION 'Member ID % does not exist. Please provide a valid IBC Member ID.', v_business_member_id;
    END IF;
  END IF;

  INSERT INTO "Application" (
    "applicationId",
    "identifier",
    "businessMemberId",
    "sectorId",
    "logoImageURL",
    "applicationDate",
    "applicationType",
    "companyName",
    "companyNameEncrypted",
    "companyAddress",
    "companyAddressEncrypted",
    "landline",
    "landlineEncrypted",
    "mobileNumber",
    "mobileNumberEncrypted",
    "emailAddress",
    "emailAddressEncrypted",
    "paymentProofStatus",
    "paymentMethod",
    "websiteURL",
    "websiteURLEncrypted",
    "applicationMemberType"
  ) VALUES (
    v_application_id,
    v_identifier,
    v_business_member_id,
    v_sector_id,
    p_company_details->>'logoImageURL',
    NOW(),
    v_app_type_enum,
    p_company_details->>'name',
    "public"."encrypt_text"(p_company_details->>'name', p_encryption_key),
    p_company_details->>'address',
    "public"."encrypt_text"(p_company_details->>'address', p_encryption_key),
    p_company_details->>'landline',
    "public"."encrypt_text"(p_company_details->>'landline', p_encryption_key),
    p_company_details->>'mobile',
    "public"."encrypt_text"(p_company_details->>'mobile', p_encryption_key),
    p_company_details->>'email',
    "public"."encrypt_text"(p_company_details->>'email', p_encryption_key),
    v_pay_status_enum,
    v_pay_method_enum,
    p_company_details->>'websiteURL',
    "public"."encrypt_text"(p_company_details->>'websiteURL', p_encryption_key),
    p_application_member_type::"ApplicationMemberType"
  );

  IF v_pay_method_enum = 'BPI' THEN
    INSERT INTO "ProofImage" ("applicationId", "path")
    VALUES (v_application_id, p_payment_proof_url);
  END IF;

  IF jsonb_array_length(p_representatives) > 0 THEN
    FOR representative IN SELECT * FROM jsonb_array_elements(p_representatives)
    LOOP
      v_rep_type_text := representative->>'memberType';

      INSERT INTO "ApplicationMember" (
        "applicationId",
        "companyMemberType",
        "firstName",
        "firstNameEncrypted",
        "lastName",
        "lastNameEncrypted",
        "mailingAddress",
        "mailingAddressEncrypted",
        "sex",
        "sexEncrypted",
        "nationality",
        "nationalityEncrypted",
        "birthdate",
        "birthdateEncrypted",
        "companyDesignation",
        "companyDesignationEncrypted",
        "landline",
        "landlineEncrypted",
        "mobileNumber",
        "mobileNumberEncrypted",
        "emailAddress",
        "emailAddressEncrypted"
      ) VALUES (
        v_application_id,
        v_rep_type_text::"CompanyMemberType",
        representative->>'firstName',
        "public"."encrypt_text"(representative->>'firstName', p_encryption_key),
        representative->>'lastName',
        "public"."encrypt_text"(representative->>'lastName', p_encryption_key),
        representative->>'mailingAddress',
        "public"."encrypt_text"(representative->>'mailingAddress', p_encryption_key),
        representative->>'sex',
        "public"."encrypt_text"(representative->>'sex', p_encryption_key),
        representative->>'nationality',
        "public"."encrypt_text"(representative->>'nationality', p_encryption_key),
        (representative->>'birthdate')::timestamp,
        "public"."encrypt_text"(representative->>'birthdate', p_encryption_key),
        representative->>'position',
        "public"."encrypt_text"(representative->>'position', p_encryption_key),
        representative->>'landline',
        "public"."encrypt_text"(representative->>'landline', p_encryption_key),
        representative->>'mobileNumber',
        "public"."encrypt_text"(representative->>'mobileNumber', p_encryption_key),
        representative->>'email',
        "public"."encrypt_text"(representative->>'email', p_encryption_key)
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'applicationId', v_application_id,
    'identifier', v_identifier,
    'applicationType', p_application_type,
    'businessMemberId', v_business_member_id,
    'status', 'success',
    'message', CASE v_app_type_enum
      WHEN 'newMember' THEN 'New membership application submitted successfully.'
      WHEN 'renewal' THEN 'Membership renewal application submitted successfully.'
      WHEN 'updating' THEN 'Information update request submitted successfully. Processing fee: ₱2,000.00'
      ELSE 'Application submitted successfully.'
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Application submission failed: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text", "p_encryption_key" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."participant_list_item"
  LANGUAGE "plpgsql" STABLE SECURITY DEFINER
  AS $$
DECLARE
  v_search_pattern TEXT;
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

  IF p_search_text IS NOT NULL AND btrim(p_search_text) <> '' THEN
    v_search_pattern := '%' || btrim(p_search_text) || '%';
  END IF;

  RETURN QUERY
  SELECT
    p."participantId",
    COALESCE("public"."decrypt_text"(p."firstNameEncrypted", p_encryption_key), p."firstName") AS "first_name",
    COALESCE("public"."decrypt_text"(p."lastNameEncrypted", p_encryption_key), p."lastName") AS "last_name",
    COALESCE("public"."decrypt_text"(p."emailEncrypted", p_encryption_key), p."email") AS "email",
    COALESCE("public"."decrypt_text"(p."contactNumberEncrypted", p_encryption_key), p."contactNumber") AS "contact_number",
    COALESCE(bm."businessName", COALESCE("public"."decrypt_text"(r."nonMemberNameEncrypted", p_encryption_key), r."nonMemberName")) AS "affiliation",
    r."registrationDate",
    r."registrationId"
  FROM "Participant" p
  JOIN "Registration" r ON p."registrationId" = r."registrationId"
  LEFT JOIN "BusinessMember" bm ON r."businessMemberId" = bm."businessMemberId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    AND (
      p_search_text IS NULL
      OR btrim(p_search_text) = ''
      OR COALESCE("public"."decrypt_text"(p."firstNameEncrypted", p_encryption_key), p."firstName") ILIKE v_search_pattern
      OR COALESCE("public"."decrypt_text"(p."lastNameEncrypted", p_encryption_key), p."lastName") ILIKE v_search_pattern
      OR COALESCE("public"."decrypt_text"(p."emailEncrypted", p_encryption_key), p."email") ILIKE v_search_pattern
      OR COALESCE("public"."decrypt_text"(p."contactNumberEncrypted", p_encryption_key), p."contactNumber") ILIKE v_search_pattern
      OR COALESCE(bm."businessName", COALESCE("public"."decrypt_text"(r."nonMemberNameEncrypted", p_encryption_key), r."nonMemberName")) ILIKE v_search_pattern
    )
  ORDER BY r."registrationDate" DESC;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text", "p_payment_proof_status" "public"."PaymentProofStatus" DEFAULT NULL::"public"."PaymentProofStatus", "p_encryption_key" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."registration_list_item"
  LANGUAGE "plpgsql" STABLE SECURITY DEFINER
  AS $$
DECLARE
  v_search_pattern TEXT;
BEGIN
  IF p_encryption_key IS NULL OR btrim(p_encryption_key) = '' THEN
    RAISE EXCEPTION 'Encryption key is required';
  END IF;

  IF p_search_text IS NOT NULL AND btrim(p_search_text) <> '' THEN
    v_search_pattern := '%' || btrim(p_search_text) || '%';
  END IF;

  RETURN QUERY
  SELECT
    r."registrationId",
    COALESCE(bm."businessName", COALESCE("public"."decrypt_text"(r."nonMemberNameEncrypted", p_encryption_key), r."nonMemberName")) AS affiliation,
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
      MAX(CASE WHEN sub_p."isPrincipal" THEN COALESCE("public"."decrypt_text"(sub_p."firstNameEncrypted", p_encryption_key), sub_p."firstName") END) AS p_first_name,
      MAX(CASE WHEN sub_p."isPrincipal" THEN COALESCE("public"."decrypt_text"(sub_p."lastNameEncrypted", p_encryption_key), sub_p."lastName") END) AS p_last_name,
      MAX(CASE WHEN sub_p."isPrincipal" THEN COALESCE("public"."decrypt_text"(sub_p."emailEncrypted", p_encryption_key), sub_p."email") END) AS p_email
    FROM "Participant" sub_p
    WHERE sub_p."registrationId" = r."registrationId"
  ) p_data ON true
  WHERE r."eventId" = p_event_id
    AND COALESCE(bm."businessName", COALESCE("public"."decrypt_text"(r."nonMemberNameEncrypted", p_encryption_key), r."nonMemberName")) IS NOT NULL
    AND (
      p_payment_proof_status IS NULL
      OR r."paymentProofStatus" = p_payment_proof_status::"PaymentProofStatus"
    )
    AND (
      p_search_text IS NULL
      OR btrim(p_search_text) = ''
      OR COALESCE(bm."businessName", COALESCE("public"."decrypt_text"(r."nonMemberNameEncrypted", p_encryption_key), r."nonMemberName")) ILIKE v_search_pattern
      OR p_data.p_first_name ILIKE v_search_pattern
      OR p_data.p_last_name ILIKE v_search_pattern
      OR p_data.p_email ILIKE v_search_pattern
      OR r."identifier" ILIKE v_search_pattern
    )
  ORDER BY r."registrationDate" DESC;
END;
$$;

REVOKE ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb", "p_sponsored_registration_id" "uuid", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."submit_event_registration_standard"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."encrypt_text"("p_plain_text" "text", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."encrypt_text"("p_plain_text" "text", "p_encryption_key" "text") FROM "authenticated";
REVOKE ALL ON FUNCTION "public"."encrypt_text"("p_plain_text" "text", "p_encryption_key" "text") FROM "service_role";
REVOKE ALL ON FUNCTION "public"."decrypt_text"("p_cipher_text" "bytea", "p_encryption_key" "text") FROM "anon";
REVOKE ALL ON FUNCTION "public"."decrypt_text"("p_cipher_text" "bytea", "p_encryption_key" "text") FROM "authenticated";
REVOKE ALL ON FUNCTION "public"."decrypt_text"("p_cipher_text" "bytea", "p_encryption_key" "text") FROM "service_role";

GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text", "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus", "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text", "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb", "p_sponsored_registration_id" "uuid", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb", "p_sponsored_registration_id" "uuid", "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_event_registration_standard"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_event_registration_standard"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_other_participants" "jsonb", "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text", "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint, "p_encryption_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint, "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint, "p_encryption_key" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_sponsor_name"("p_sponsored_registration_id" "uuid", "p_sponsored_by" "text", "p_encryption_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_sponsor_name"("p_sponsored_registration_id" "uuid", "p_sponsored_by" "text", "p_encryption_key" "text") TO "service_role";

COMMIT;
