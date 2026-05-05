create type "public"."CompanyProfileType" as enum ('image', 'document', 'website');

alter table "public"."Application" add column "companyProfileType" public."CompanyProfileType" not null default 'website'::public."CompanyProfileType";

set check_function_bodies = off;

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

drop policy "Allow all operations for anyone 11d98ol_1" on "storage"."objects";

drop policy "Allow all operations for anyone 11d98ol_3" on "storage"."objects";


  create policy "allow delete for companyprofile 1"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'companyprofile'::text));



  create policy "allow insert for companyprofile 1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated, anon
with check ((bucket_id = 'companyprofile'::text));



  create policy "allow select for companyprofile 1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'companyprofile'::text));



  create policy "allow update for companyprofile 1"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'companyprofile'::text));



  create policy "Allow all operations for anyone 11d98ol_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_3"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'paymentproofs'::text));
