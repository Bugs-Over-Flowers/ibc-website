set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_member_exists_and_get(p_identifier text, p_application_type text DEFAULT 'renewal'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_member_business_member_id uuid;
  v_member_identifier text;
  v_member_business_name text;
  v_member_membership_status text;
  v_member_sector_id bigint;
  v_member_website_url text;
  v_member_logo_image_url text;

  v_latest_application_id uuid;
  v_latest_application_member_type text;
  v_latest_company_address text;
  v_latest_email_address text;
  v_latest_landline text;
  v_latest_mobile_number text;
  v_latest_sector_name text;

  v_resolved_sector_id bigint;

  v_principal_first_name text;
  v_principal_last_name text;
  v_principal_email text;
  v_principal_mobile text;
  v_principal_landline text;
  v_principal_mailing_address text;
  v_principal_designation text;
  v_principal_birthdate text;
  v_principal_nationality text;
  v_principal_sex text;

  v_alternate_first_name text;
  v_alternate_last_name text;
  v_alternate_email text;
  v_alternate_mobile text;
  v_alternate_landline text;
  v_alternate_mailing_address text;
  v_alternate_designation text;
  v_alternate_birthdate text;
  v_alternate_nationality text;
  v_alternate_sex text;

  v_normalized_identifier text;
  v_application_type text;
BEGIN
  v_normalized_identifier := lower(trim(p_identifier));
  v_application_type := lower(trim(p_application_type));

  IF v_normalized_identifier IS NULL OR v_normalized_identifier = '' THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier is required'
    );
  END IF;

  IF v_application_type NOT IN ('renewal', 'updating') THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Invalid application type. Expected renewal or updating'
    );
  END IF;

  SELECT
    bm."businessMemberId",
    bm."identifier",
    bm."businessName",
    bm."membershipStatus"::text,
    bm."sectorId",
    bm."websiteURL",
    bm."logoImageURL"
  INTO
    v_member_business_member_id,
    v_member_identifier,
    v_member_business_name,
    v_member_membership_status,
    v_member_sector_id,
    v_member_website_url,
    v_member_logo_image_url
  FROM public."BusinessMember" bm
  WHERE lower(bm."identifier") = v_normalized_identifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier not found'
    );
  END IF;

  IF v_application_type = 'renewal' THEN
    IF v_member_membership_status <> 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member_business_name,
        'membershipStatus', v_member_membership_status,
        'businessMemberIdentifier', v_member_identifier,
        'businessMemberId', v_member_business_member_id,
        'message', 'Only cancelled memberships are eligible for renewal'
      );
    END IF;
  ELSE
    IF v_member_membership_status = 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member_business_name,
        'membershipStatus', v_member_membership_status,
        'businessMemberIdentifier', v_member_identifier,
        'businessMemberId', v_member_business_member_id,
        'message', 'cancelled memberships must renew first before updating information'
      );
    END IF;
  END IF;

  SELECT
    a."applicationId",
    a."applicationMemberType"::text,
    a."companyAddress",
    a."emailAddress",
    a."landline",
    a."mobileNumber",
    a."sectorName"
  INTO
    v_latest_application_id,
    v_latest_application_member_type,
    v_latest_company_address,
    v_latest_email_address,
    v_latest_landline,
    v_latest_mobile_number,
    v_latest_sector_name
  FROM public."Application" a
  WHERE a."businessMemberId" = v_member_business_member_id
  ORDER BY a."applicationDate" DESC
  LIMIT 1;

  IF v_latest_application_id IS NOT NULL THEN
    SELECT
      am."firstName",
      am."lastName",
      am."emailAddress",
      am."mobileNumber",
      am."landline",
      am."mailingAddress",
      am."companyDesignation",
      am."birthdate"::text,
      am."nationality",
      am."sex"
    INTO
      v_principal_first_name,
      v_principal_last_name,
      v_principal_email,
      v_principal_mobile,
      v_principal_landline,
      v_principal_mailing_address,
      v_principal_designation,
      v_principal_birthdate,
      v_principal_nationality,
      v_principal_sex
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_latest_application_id
      AND am."companyMemberType" = 'principal'
    LIMIT 1;

    SELECT
      am."firstName",
      am."lastName",
      am."emailAddress",
      am."mobileNumber",
      am."landline",
      am."mailingAddress",
      am."companyDesignation",
      am."birthdate"::text,
      am."nationality",
      am."sex"
    INTO
      v_alternate_first_name,
      v_alternate_last_name,
      v_alternate_email,
      v_alternate_mobile,
      v_alternate_landline,
      v_alternate_mailing_address,
      v_alternate_designation,
      v_alternate_birthdate,
      v_alternate_nationality,
      v_alternate_sex
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_latest_application_id
      AND am."companyMemberType" = 'alternate'
    LIMIT 1;
  END IF;

  v_resolved_sector_id := NULL;

  IF v_latest_sector_name IS NOT NULL AND btrim(v_latest_sector_name) <> '' THEN
    SELECT s."sectorId"
    INTO v_resolved_sector_id
    FROM public."Sector" s
    WHERE lower(btrim(s."sectorName")) = lower(btrim(v_latest_sector_name))
    ORDER BY s."sectorId"
    LIMIT 1;
  END IF;

  IF v_resolved_sector_id IS NULL THEN
    v_resolved_sector_id := v_member_sector_id;
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'companyName', v_member_business_name,
    'membershipStatus', v_member_membership_status,
    'applicationMemberType', v_latest_application_member_type,
    'businessMemberIdentifier', v_member_identifier,
    'businessMemberId', v_member_business_member_id,
    'companyAddress', COALESCE(v_latest_company_address, ''),
    'emailAddress', COALESCE(v_latest_email_address, ''),
    'landline', COALESCE(v_latest_landline, ''),
    'mobileNumber', COALESCE(v_latest_mobile_number, ''),
    'websiteURL', COALESCE(v_member_website_url, ''),
    'logoImageURL', COALESCE(v_member_logo_image_url, ''),
    'sectorId', v_resolved_sector_id,
    'principalRepresentative',
      CASE
        WHEN v_principal_first_name IS NULL THEN NULL
        ELSE jsonb_build_object(
          'firstName', v_principal_first_name,
          'lastName', v_principal_last_name,
          'emailAddress', v_principal_email,
          'mobileNumber', v_principal_mobile,
          'landline', v_principal_landline,
          'mailingAddress', v_principal_mailing_address,
          'companyDesignation', v_principal_designation,
          'birthdate', v_principal_birthdate,
          'nationality', v_principal_nationality,
          'sex', v_principal_sex
        )
      END,
    'alternateRepresentative',
      CASE
        WHEN v_alternate_first_name IS NULL THEN NULL
        ELSE jsonb_build_object(
          'firstName', v_alternate_first_name,
          'lastName', v_alternate_last_name,
          'emailAddress', v_alternate_email,
          'mobileNumber', v_alternate_mobile,
          'landline', v_alternate_landline,
          'mailingAddress', v_alternate_mailing_address,
          'companyDesignation', v_alternate_designation,
          'birthdate', v_alternate_birthdate,
          'nationality', v_alternate_nationality,
          'sex', v_alternate_sex
        )
      END
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Unable to validate Business Member Identifier at this time'
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_application_member_type text, p_payment_proof_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_application_id uuid;
  v_identifier text;
  v_app_type_enum "ApplicationType";
  v_pay_method_enum "PaymentMethod";
  v_pay_status_enum "PaymentProofStatus";
  v_requested_member_type "ApplicationMemberType";
  v_existing_member_type "ApplicationMemberType";
  v_requires_payment boolean := true;
  v_sector_name text;
  v_business_member_id uuid;
  representative jsonb;
  v_rep_type_text text;
BEGIN
  v_application_id := gen_random_uuid();
  v_identifier := 'ibc-app-' || left(replace(v_application_id::text, '-', ''), 8);

  v_app_type_enum := p_application_type::"ApplicationType";
  v_requested_member_type := p_application_member_type::"ApplicationMemberType";

  v_sector_name := NULLIF(btrim(p_company_details->>'sectorName'), '');
  IF v_sector_name IS NULL THEN
    RAISE EXCEPTION 'Industry/Sector is required.';
  END IF;

  IF p_company_details->>'businessMemberId' IS NOT NULL
     AND btrim(p_company_details->>'businessMemberId') <> '' THEN
    v_business_member_id := (p_company_details->>'businessMemberId')::uuid;
  ELSE
    v_business_member_id := NULL;
  END IF;

  IF v_app_type_enum IN ('renewal', 'updating') THEN
    IF v_business_member_id IS NULL THEN
      RAISE EXCEPTION 'Member ID is required for % applications.', p_application_type;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM "BusinessMember"
      WHERE "businessMemberId" = v_business_member_id
    ) THEN
      RAISE EXCEPTION
        'Member ID % does not exist. Please provide a valid IBC Member ID.',
        v_business_member_id;
    END IF;
  END IF;

  IF v_app_type_enum = 'updating' THEN
    SELECT a."applicationMemberType"
    INTO v_existing_member_type
    FROM public."Application" a
    WHERE a."businessMemberId" = v_business_member_id
    ORDER BY a."applicationDate" DESC
    LIMIT 1;

    IF v_existing_member_type = 'corporate'::"ApplicationMemberType"
       AND v_requested_member_type = 'personal'::"ApplicationMemberType" THEN
      RAISE EXCEPTION 'Corporate memberships cannot be downgraded to personal through update-info applications.';
    END IF;

    v_requires_payment :=
      v_existing_member_type = 'personal'::"ApplicationMemberType"
      AND v_requested_member_type = 'corporate'::"ApplicationMemberType";
  ELSE
    v_requires_payment := true;
  END IF;

  v_pay_method_enum := (
    CASE
      WHEN v_app_type_enum = 'updating' AND NOT v_requires_payment THEN 'ONSITE'
      ELSE p_payment_method
    END
  )::"PaymentMethod";

  v_pay_status_enum := (
    CASE
      WHEN v_pay_method_enum = 'BPI' THEN 'pending'
      ELSE 'accepted'
    END
  )::"PaymentProofStatus";

  IF v_requires_payment
     AND v_pay_method_enum = 'BPI'
     AND (p_payment_proof_url IS NULL OR btrim(p_payment_proof_url) = '') THEN
    RAISE EXCEPTION 'Proof of payment is required for online transactions.';
  END IF;

  INSERT INTO "Application" (
    "applicationId",
    "identifier",
    "businessMemberId",
    "sectorName",
    "logoImageURL",
    "applicationDate",
    "applicationType",
    "companyName",
    "companyAddress",
    "landline",
    "mobileNumber",
    "emailAddress",
    "paymentProofStatus",
    "paymentMethod",
    "websiteURL",
    "applicationMemberType"
  )
  VALUES (
    v_application_id,
    v_identifier,
    v_business_member_id,
    v_sector_name,
    p_company_details->>'logoImageURL',
    NOW(),
    v_app_type_enum,
    p_company_details->>'name',
    p_company_details->>'address',
    p_company_details->>'landline',
    p_company_details->>'mobile',
    p_company_details->>'email',
    v_pay_status_enum,
    v_pay_method_enum,
    p_company_details->>'websiteURL',
    v_requested_member_type
  );

  IF v_requires_payment AND v_pay_method_enum = 'BPI' THEN
    INSERT INTO "ProofImage" ("applicationId", "path")
    VALUES (v_application_id, p_payment_proof_url);
  END IF;

  IF jsonb_array_length(COALESCE(p_representatives, '[]'::jsonb)) > 0 THEN
    FOR representative IN
      SELECT * FROM jsonb_array_elements(COALESCE(p_representatives, '[]'::jsonb))
    LOOP
      v_rep_type_text := representative->>'memberType';

      INSERT INTO "ApplicationMember" (
        "applicationId",
        "companyMemberType",
        "firstName",
        "lastName",
        "mailingAddress",
        "sex",
        "nationality",
        "birthdate",
        "companyDesignation",
        "landline",
        "mobileNumber",
        "emailAddress"
      )
      VALUES (
        v_application_id,
        v_rep_type_text::"CompanyMemberType",
        representative->>'firstName',
        representative->>'lastName',
        representative->>'mailingAddress',
        representative->>'sex',
        representative->>'nationality',
        (representative->>'birthdate')::timestamp,
        representative->>'position',
        representative->>'landline',
        representative->>'mobileNumber',
        representative->>'email'
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'applicationId', v_application_id,
    'identifier', v_identifier,
    'applicationType', p_application_type,
    'businessMemberId', v_business_member_id,
    'requiresPayment', v_requires_payment,
    'status', 'success',
    'message', CASE
      WHEN v_app_type_enum = 'newMember' THEN 'New membership application submitted successfully.'
      WHEN v_app_type_enum = 'renewal' THEN 'Membership renewal application submitted successfully.'
      WHEN v_app_type_enum = 'updating' AND v_requires_payment THEN 'Corporate upgrade request submitted successfully. Upgrade fee: ₱5,000.00'
      WHEN v_app_type_enum = 'updating' THEN 'Information update request submitted successfully. No payment is required.'
      ELSE 'Application submitted successfully.'
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Application submission failed: %', SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.approve_membership_update_application(p_application_id uuid)
 RETURNS TABLE(business_member_id uuid, message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_application_business_member_id uuid;
  v_application_type text;
  v_application_status text;
  v_application_company_name text;
  v_application_sector_name text;
  v_application_website_url text;
  v_application_logo_image_url text;
  v_application_member_type "ApplicationMemberType";
  v_application_payment_method "PaymentMethod";
  v_application_payment_proof_status "PaymentProofStatus";
  v_application_date timestamp with time zone;

  v_previous_member_type "ApplicationMemberType";
  v_requires_payment boolean := false;
  v_member_membership_status text;
  v_member_id uuid;
  v_sector_id bigint;
BEGIN
  SELECT
    a."businessMemberId",
    a."applicationType"::text,
    a."applicationStatus"::text,
    a."companyName",
    a."sectorName",
    a."websiteURL",
    a."logoImageURL",
    a."applicationMemberType",
    a."paymentMethod",
    a."paymentProofStatus",
    a."applicationDate"
  INTO
    v_application_business_member_id,
    v_application_type,
    v_application_status,
    v_application_company_name,
    v_application_sector_name,
    v_application_website_url,
    v_application_logo_image_url,
    v_application_member_type,
    v_application_payment_method,
    v_application_payment_proof_status,
    v_application_date
  FROM public."Application" a
  WHERE a."applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application_type <> 'updating' THEN
    RAISE EXCEPTION 'Invalid application type for update-info approval';
  END IF;

  IF v_application_status = 'approved' THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application_business_member_id IS NULL THEN
    RAISE EXCEPTION 'Update-info application must be linked to an existing business member';
  END IF;

  SELECT
    bm."businessMemberId",
    bm."membershipStatus"::text
  INTO
    v_member_id,
    v_member_membership_status
  FROM public."BusinessMember" bm
  WHERE bm."businessMemberId" = v_application_business_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Linked business member not found';
  END IF;

  IF v_member_membership_status = 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled memberships must renew first before updating information';
  END IF;

  SELECT a."applicationMemberType"
  INTO v_previous_member_type
  FROM public."Application" a
  WHERE a."businessMemberId" = v_application_business_member_id
    AND a."applicationId" <> p_application_id
    AND a."applicationDate" < v_application_date
  ORDER BY a."applicationDate" DESC
  LIMIT 1;

  IF v_previous_member_type IS NULL THEN
    SELECT a."applicationMemberType"
    INTO v_previous_member_type
    FROM public."Application" a
    WHERE a."businessMemberId" = v_application_business_member_id
      AND a."applicationId" <> p_application_id
    ORDER BY a."applicationDate" DESC
    LIMIT 1;
  END IF;

  IF v_previous_member_type = 'corporate'::"ApplicationMemberType"
     AND v_application_member_type = 'personal'::"ApplicationMemberType" THEN
    RAISE EXCEPTION 'Corporate memberships cannot be downgraded to personal through update-info applications.';
  END IF;

  v_requires_payment :=
    v_previous_member_type = 'personal'::"ApplicationMemberType"
    AND v_application_member_type = 'corporate'::"ApplicationMemberType";

  IF v_requires_payment
     AND v_application_payment_method = 'BPI'::"PaymentMethod"
     AND v_application_payment_proof_status <> 'accepted'::"PaymentProofStatus" THEN
    RAISE EXCEPTION 'Corporate upgrade payment proof must be accepted before approval.';
  END IF;

  IF v_application_sector_name IS NOT NULL AND btrim(v_application_sector_name) <> '' THEN
    SELECT s."sectorId"
    INTO v_sector_id
    FROM public."Sector" s
    WHERE lower(btrim(s."sectorName")) = lower(btrim(v_application_sector_name))
    ORDER BY s."sectorId"
    LIMIT 1;

    IF v_sector_id IS NULL THEN
      RAISE EXCEPTION
        'Sector "%" is not available. Please update the application to a valid sector before approval.',
        v_application_sector_name;
    END IF;
  ELSE
    v_sector_id := NULL;
  END IF;

  UPDATE public."BusinessMember"
  SET
    "businessName" = COALESCE(NULLIF(v_application_company_name, ''), "businessName"),
    "sectorId" = COALESCE(v_sector_id, "sectorId"),
    "websiteURL" = COALESCE(NULLIF(v_application_website_url, ''), "websiteURL"),
    "logoImageURL" = COALESCE(NULLIF(v_application_logo_image_url, ''), "logoImageURL")
  WHERE "businessMemberId" = v_member_id;

  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
  SELECT
    v_member_id,
    CASE
      WHEN v_requires_payment THEN 'Corporate upgrade application approved successfully. Member information updated.'::text
      ELSE 'Update-info application approved successfully. Member information updated.'::text
    END;
END;
$function$;
