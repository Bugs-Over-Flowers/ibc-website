DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.typname = 'PaymentMethod'
      AND e.enumlabel = 'IMPORTED'
  ) THEN
    ALTER TYPE "public"."PaymentMethod" ADD VALUE 'IMPORTED';
  END IF;
END
$$;

ALTER TABLE "public"."Registration"
ADD COLUMN IF NOT EXISTS "sourceSubmissionId" text;

CREATE UNIQUE INDEX IF NOT EXISTS "Registration_event_sourceSubmissionId_unique"
ON "public"."Registration" ("eventId", "sourceSubmissionId")
WHERE "sourceSubmissionId" IS NOT NULL;

CREATE OR REPLACE FUNCTION "public"."import_event_registrations"(
  "p_event_id" uuid,
  "p_rows" jsonb,
  "p_dry_run" boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
        "nonMemberName",
        "paymentMethod",
        "paymentProofStatus",
        "identifier",
        "note",
        "registrationDate",
        "sourceSubmissionId"
      ) VALUES (
        p_event_id,
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
$$;

GRANT ALL ON FUNCTION "public"."import_event_registrations"(uuid, jsonb, boolean) TO anon;
GRANT ALL ON FUNCTION "public"."import_event_registrations"(uuid, jsonb, boolean) TO authenticated;
GRANT ALL ON FUNCTION "public"."import_event_registrations"(uuid, jsonb, boolean) TO service_role;
