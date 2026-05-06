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
  v_latest_company_profile_type text;

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
    a."sectorName",
    a."companyProfileType"::text
  INTO
    v_latest_application_id,
    v_latest_application_member_type,
    v_latest_company_address,
    v_latest_email_address,
    v_latest_landline,
    v_latest_mobile_number,
    v_latest_sector_name,
    v_latest_company_profile_type
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
    'companyProfileType', COALESCE(v_latest_company_profile_type, 'website'),
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_sector_member_counts(p_sector_ids integer[])
 RETURNS TABLE("sectorId" integer, "memberCount" integer)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select
    s."sectorId" as "sectorId",
    count(bm."businessMemberId")::int as "memberCount"
  from
    "Sector" as s
  left join
    "BusinessMember" as bm on s."sectorId" = bm."sectorId" and bm."membershipStatus" <> 'cancelled'
  where
    s."sectorId" = any(p_sector_ids)
  group by
    s."sectorId";
end;
$function$
;

CREATE OR REPLACE FUNCTION public.import_event_registrations(p_event_id uuid, p_rows jsonb, p_dry_run boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total integer := 0;
  v_valid integer := 0;
  v_invalid integer := 0;
  v_would_insert integer := 0;
  v_inserted integer := 0;
  v_skipped_duplicate integer := 0;
  v_failed integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_row jsonb;
  v_row_number integer := 0;
  v_first_name text;
  v_last_name text;
  v_email text;
  v_contact_number text;
  v_affiliation text;
  v_note text;
  v_source_submission_id text;
  v_source_submitted_at_raw text;
  v_registration_date timestamp with time zone;
  v_registration_id uuid;
  v_identifier text;
  v_errors text[];
  v_warnings text[];
BEGIN
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'Event ID is required.';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'Rows payload must be a JSON array.';
  END IF;

  v_total := jsonb_array_length(p_rows);

  IF v_total > 300 THEN
    RAISE EXCEPTION 'Maximum of 300 rows per import. Received % rows.', v_total;
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    v_row_number := v_row_number + 1;
    v_errors := ARRAY[]::text[];
    v_warnings := ARRAY[]::text[];

    v_first_name := NULLIF(btrim(v_row->>'first_name'), '');
    v_last_name := NULLIF(btrim(v_row->>'last_name'), '');
    v_email := NULLIF(lower(btrim(v_row->>'email')), '');
    v_contact_number := NULLIF(btrim(v_row->>'contact_number'), '');
    v_affiliation := NULLIF(btrim(v_row->>'affiliation'), '');
    v_note := NULLIF(btrim(v_row->>'note'), '');
    v_source_submission_id := NULLIF(btrim(v_row->>'source_submission_id'), '');
    v_source_submitted_at_raw := NULLIF(btrim(v_row->>'source_submitted_at'), '');
    v_registration_date := NOW();

    IF v_first_name IS NULL THEN
      v_errors := array_append(v_errors, 'first_name is required');
    END IF;
    IF v_last_name IS NULL THEN
      v_errors := array_append(v_errors, 'last_name is required');
    END IF;
    IF v_email IS NULL THEN
      v_errors := array_append(v_errors, 'email is required');
    ELSIF v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
      v_errors := array_append(v_errors, 'email format is invalid');
    END IF;
    IF v_contact_number IS NULL THEN
      v_errors := array_append(v_errors, 'contact_number is required');
    END IF;
    IF v_affiliation IS NULL THEN
      v_errors := array_append(v_errors, 'affiliation is required');
    END IF;

    IF v_source_submitted_at_raw IS NOT NULL THEN
      BEGIN
        v_registration_date := v_source_submitted_at_raw::timestamp with time zone;
      EXCEPTION
        WHEN OTHERS THEN
          v_registration_date := NOW();
          v_warnings := array_append(
            v_warnings,
            'source_submitted_at is invalid and was replaced with current timestamp'
          );
      END;
    END IF;

    IF v_source_submission_id IS NOT NULL
       AND EXISTS (
         SELECT 1
         FROM "Registration"
         WHERE "eventId" = p_event_id
           AND "sourceSubmissionId" = v_source_submission_id
       ) THEN
      v_skipped_duplicate := v_skipped_duplicate + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', v_row_number,
          'status', 'skipped_duplicate',
          'sourceSubmissionId', v_source_submission_id
        )
      );
      CONTINUE;
    END IF;

    IF coalesce(array_length(v_errors, 1), 0) > 0 THEN
      v_invalid := v_invalid + 1;
      v_failed := v_failed + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', v_row_number,
          'status', 'invalid',
          'errors', to_jsonb(v_errors)
        )
      );
      CONTINUE;
    END IF;

    v_valid := v_valid + 1;

    IF p_dry_run THEN
      v_would_insert := v_would_insert + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', v_row_number,
          'status', 'would_insert',
          'sourceSubmissionId', v_source_submission_id,
          'warnings', CASE
            WHEN coalesce(array_length(v_warnings, 1), 0) > 0 THEN to_jsonb(v_warnings)
            ELSE '[]'::jsonb
          END
        )
      );
      CONTINUE;
    END IF;

    BEGIN
      v_identifier := 'ibc-reg-' || left(replace(gen_random_uuid()::text, '-', ''), 8);

      INSERT INTO "Registration" (
        "eventId",
        "businessMemberId",
        "nonMemberName",
        "paymentMethod",
        "paymentProofStatus",
        "identifier",
        "note",
        "registrationDate",
        "sourceSubmissionId"
      ) VALUES (
        p_event_id,
        NULL,
        v_affiliation,
        'IMPORTED'::"PaymentMethod",
        'accepted'::"PaymentProofStatus",
        v_identifier,
        v_note,
        v_registration_date,
        v_source_submission_id
      )
      RETURNING "registrationId" INTO v_registration_id;

      INSERT INTO "Participant" (
        "registrationId",
        "isPrincipal",
        "firstName",
        "lastName",
        "contactNumber",
        "email"
      ) VALUES (
        v_registration_id,
        TRUE,
        v_first_name,
        v_last_name,
        v_contact_number,
        v_email
      );

      v_inserted := v_inserted + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', v_row_number,
          'status', 'inserted',
          'registrationId', v_registration_id,
          'sourceSubmissionId', v_source_submission_id,
          'warnings', CASE
            WHEN coalesce(array_length(v_warnings, 1), 0) > 0 THEN to_jsonb(v_warnings)
            ELSE '[]'::jsonb
          END
        )
      );
    EXCEPTION
      WHEN unique_violation THEN
        v_skipped_duplicate := v_skipped_duplicate + 1;
        v_results := v_results || jsonb_build_array(
          jsonb_build_object(
            'rowNumber', v_row_number,
            'status', 'skipped_duplicate',
            'sourceSubmissionId', v_source_submission_id
          )
        );
      WHEN OTHERS THEN
        v_failed := v_failed + 1;
        v_results := v_results || jsonb_build_array(
          jsonb_build_object(
            'rowNumber', v_row_number,
            'status', 'failed',
            'errors', to_jsonb(ARRAY[SQLERRM])
          )
        );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'total', v_total,
    'valid', v_valid,
    'invalid', v_invalid,
    'wouldInsert', CASE WHEN p_dry_run THEN v_would_insert ELSE 0 END,
    'inserted', CASE WHEN p_dry_run THEN 0 ELSE v_inserted END,
    'skippedDuplicate', v_skipped_duplicate,
    'failed', v_failed,
    'results', v_results
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_membership_application(p_application_type text, p_company_details jsonb, p_representatives jsonb, p_payment_method text, p_application_member_type text, p_payment_proof_url text DEFAULT NULL::text, p_company_profile_type text DEFAULT 'website'::text)
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
  v_profile_type "CompanyProfileType";
  representative jsonb;
  v_rep_type_text text;
BEGIN
  v_application_id := gen_random_uuid();
  v_identifier := 'ibc-app-' || left(replace(v_application_id::text, '-', ''), 8);

  v_app_type_enum := p_application_type::"ApplicationType";
  v_requested_member_type := p_application_member_type::"ApplicationMemberType";
  v_profile_type := COALESCE(p_company_profile_type, 'website')::"CompanyProfileType";

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
      SELECT 1 FROM "BusinessMember"
      WHERE "businessMemberId" = v_business_member_id
    ) THEN
      RAISE EXCEPTION 'Member ID % does not exist.', v_business_member_id;
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
      RAISE EXCEPTION 'Corporate memberships cannot be downgraded to personal.';
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
    "companyProfileType",
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
    v_profile_type,
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
$function$
;

drop policy "allow delete for companyprofile 1" on "storage"."objects";

drop policy "allow insert for companyprofile 1" on "storage"."objects";

drop policy "allow select for companyprofile 1" on "storage"."objects";

drop policy "allow update for companyprofile 1" on "storage"."objects";

drop policy "Authenticated users can upload company profiles" on "storage"."objects";

drop policy "Company profile is publicly readable" on "storage"."objects";


  create policy "Authenticated users can upload company profiles"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'companyprofile'::text));



  create policy "Company profile is publicly readable"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'companyprofile'::text));



