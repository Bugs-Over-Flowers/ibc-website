


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."ApplicationMemberType" AS ENUM (
    'corporate',
    'personal'
);


ALTER TYPE "public"."ApplicationMemberType" OWNER TO "postgres";


CREATE TYPE "public"."ApplicationStatus" AS ENUM (
    'new',
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."ApplicationStatus" OWNER TO "postgres";


CREATE TYPE "public"."ApplicationType" AS ENUM (
    'newMember',
    'updating',
    'renewal'
);


ALTER TYPE "public"."ApplicationType" OWNER TO "postgres";


CREATE TYPE "public"."CompanyMemberType" AS ENUM (
    'principal',
    'alternate'
);


ALTER TYPE "public"."CompanyMemberType" OWNER TO "postgres";


CREATE TYPE "public"."EventType" AS ENUM (
    'public',
    'private'
);


ALTER TYPE "public"."EventType" OWNER TO "postgres";


CREATE TYPE "public"."InterviewStatus" AS ENUM (
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
);


ALTER TYPE "public"."InterviewStatus" OWNER TO "postgres";


CREATE TYPE "public"."MembershipStatus" AS ENUM (
    'paid',
    'unpaid',
    'cancelled'
);


ALTER TYPE "public"."MembershipStatus" OWNER TO "postgres";


CREATE TYPE "public"."PaymentMethod" AS ENUM (
    'BPI',
    'ONSITE',
    'IMPORTED'
);


ALTER TYPE "public"."PaymentMethod" OWNER TO "postgres";


CREATE TYPE "public"."PaymentProofStatus" AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


ALTER TYPE "public"."PaymentProofStatus" OWNER TO "postgres";


CREATE TYPE "public"."SponsoredRegistrationStatus" AS ENUM (
    'active',
    'full',
    'disabled'
);


ALTER TYPE "public"."SponsoredRegistrationStatus" OWNER TO "postgres";


CREATE TYPE "public"."WebsiteContentSection" AS ENUM (
    'vision_mission',
    'goals',
    'company_thrusts',
    'board_of_trustees',
    'secretariat',
    'landing_page_benefits',
    'hero_section'
);


ALTER TYPE "public"."WebsiteContentSection" OWNER TO "postgres";


CREATE TYPE "public"."WebsiteContentTextType" AS ENUM (
    'Paragraph',
    'Title',
    'Subtitle'
);


ALTER TYPE "public"."WebsiteContentTextType" OWNER TO "postgres";


CREATE TYPE "public"."participant_list_item" AS (
	"participant_id" "uuid",
	"first_name" "text",
	"last_name" "text",
	"email" "text",
	"contact_number" "text",
	"affiliation" "text",
	"registration_date" timestamp with time zone,
	"registration_id" "uuid"
);


ALTER TYPE "public"."participant_list_item" OWNER TO "postgres";


CREATE TYPE "public"."ratingScale" AS ENUM (
    'poor',
    'fair',
    'good',
    'veryGood',
    'excellent'
);


ALTER TYPE "public"."ratingScale" OWNER TO "postgres";


CREATE TYPE "public"."registration_details_result" AS (
	"registration_details" "jsonb",
	"event_details" "jsonb",
	"check_in_list" "jsonb",
	"event_days" "jsonb",
	"all_is_checked_in" boolean,
	"is_event_day" boolean
);


ALTER TYPE "public"."registration_details_result" OWNER TO "postgres";


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


CREATE TYPE "public"."registration_stats" AS (
	"totalRegistrations" integer,
	"verifiedRegistrations" integer,
	"pendingRegistrations" integer,
	"totalParticipants" integer
);


ALTER TYPE "public"."registration_stats" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_membership_application"("p_application_id" "uuid") RETURNS TABLE("business_member_id" "uuid", "message" "text")
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_existing_business_member_id uuid;
  v_company_name text;
  v_email_address text;
  v_sector_name text;
  v_website_url text;
  v_logo_image_url text;
  v_member_id uuid;
  v_linked_count integer := 0;
  v_sector_id bigint;
BEGIN
  SELECT
    a."businessMemberId",
    a."companyName",
    a."emailAddress",
    a."sectorName",
    a."websiteURL",
    a."logoImageURL"
  INTO
    v_existing_business_member_id,
    v_company_name,
    v_email_address,
    v_sector_name,
    v_website_url,
    v_logo_image_url
  FROM public."Application" a
  WHERE a."applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_existing_business_member_id IS NOT NULL THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_sector_name IS NULL OR btrim(v_sector_name) = '' THEN
    RAISE EXCEPTION 'Sector name is required to approve application';
  END IF;

  SELECT s."sectorId"
  INTO v_sector_id
  FROM public."Sector" s
  WHERE lower(btrim(s."sectorName")) = lower(btrim(v_sector_name))
  ORDER BY s."sectorId"
  LIMIT 1;

  IF v_sector_id IS NULL THEN
    RAISE EXCEPTION
      'Sector "%" is not available. Please update the application to a valid sector before approval.',
      v_sector_name;
  END IF;

  INSERT INTO public."BusinessMember" (
    "businessName",
    "sectorId",
    "websiteURL",
    "logoImageURL",
    "joinDate",
    "primaryApplicationId"
  )
  VALUES (
    v_company_name,
    v_sector_id,
    COALESCE(v_website_url, ''),
    v_logo_image_url,
    CURRENT_DATE,
    p_application_id
  )
  RETURNING "businessMemberId" INTO v_member_id;

  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  UPDATE public."Application" a
  SET "businessMemberId" = v_member_id
  WHERE a."businessMemberId" IS NULL
    AND a."applicationStatus" = 'rejected'
    AND a."applicationId" <> p_application_id
    AND lower(trim(a."companyName")) = lower(trim(v_company_name))
    AND lower(trim(a."emailAddress")) = lower(trim(v_email_address));

  GET DIAGNOSTICS v_linked_count = ROW_COUNT;

  RETURN QUERY
  SELECT
    v_member_id,
    format(
      'Application approved successfully. Linked %s rejected application(s) to history.',
      v_linked_count
    );
END;$$;


ALTER FUNCTION "public"."approve_membership_application"("p_application_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_membership_renewal_application"("p_application_id" "uuid") RETURNS TABLE("business_member_id" "uuid", "message" "text")
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_application_business_member_id uuid;
  v_application_type text;
  v_application_status text;
  v_application_company_name text;
  v_application_sector_name text;
  v_application_website_url text;
  v_application_logo_image_url text;

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
    a."logoImageURL"
  INTO
    v_application_business_member_id,
    v_application_type,
    v_application_status,
    v_application_company_name,
    v_application_sector_name,
    v_application_website_url,
    v_application_logo_image_url
  FROM public."Application" a
  WHERE a."applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application_type <> 'renewal' THEN
    RAISE EXCEPTION 'Invalid application type for renewal approval';
  END IF;

  IF v_application_status = 'approved' THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application_business_member_id IS NULL THEN
    RAISE EXCEPTION 'Renewal application must be linked to an existing business member';
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

  IF v_member_membership_status <> 'cancelled' THEN
    RAISE EXCEPTION 'Only cancelled memberships are eligible for renewal';
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
    "logoImageURL" = COALESCE(NULLIF(v_application_logo_image_url, ''), "logoImageURL"),
    "membershipStatus" = 'paid'
  WHERE "businessMemberId" = v_member_id;

  UPDATE public."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
  SELECT
    v_member_id,
    'Renewal approved successfully. Member status updated to paid.'::text;
END;$$;


ALTER FUNCTION "public"."approve_membership_renewal_application"("p_application_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_membership_update_application"("p_application_id" "uuid") RETURNS TABLE("business_member_id" "uuid", "message" "text")
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."approve_membership_update_application"("p_application_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_application_status"("p_application_identifier" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'applicationId', a."applicationId",
    'identifier', a."identifier",
    'applicationType', a."applicationType",
    'applicationStatus', a."applicationStatus",
    'applicationDate', a."applicationDate",
    'companyName', a."companyName",
    'hasInterview', CASE WHEN a."interviewId" IS NOT NULL THEN true ELSE false END,
    'interview', CASE
      WHEN i."interviewId" IS NOT NULL THEN
        jsonb_build_object(
          'interviewId', i."interviewId",
          'interviewDate', i."interviewDate",
          'interviewVenue', i."interviewVenue",
          'status', i."status",
          'createdAt', i."createdAt"
        )
      ELSE NULL
    END
  )
  INTO v_result
  FROM public."Application" a
  LEFT JOIN public."Interview" i
    ON a."interviewId" = i."interviewId"
  WHERE a."identifier" = p_application_identifier
  LIMIT 1;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Application with identifier % does not exist.', p_application_identifier;
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to check application status: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."check_application_status"("p_application_identifier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_member_exists"("p_identifier" "text", "p_application_type" "text" DEFAULT 'renewal'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_member record;
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
    "businessMemberId",
    "identifier",
    "businessName",
    "membershipStatus"
  INTO v_member
  FROM "BusinessMember"
  WHERE lower("identifier") = v_normalized_identifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Business Member Identifier not found'
    );
  END IF;

  IF v_application_type = 'renewal' THEN
    -- Renewal: only cancelled members are eligible
    IF v_member."membershipStatus" != 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member."businessName",
        'membershipStatus', v_member."membershipStatus",
        'businessMemberIdentifier', v_member."identifier",
        'businessMemberId', v_member."businessMemberId",
        'message', 'Only cancelled memberships are eligible for renewal'
      );
    END IF;
  ELSE
    -- Updating: member must not be cancelled
    IF v_member."membershipStatus" = 'cancelled' THEN
      RETURN jsonb_build_object(
        'exists', false,
        'companyName', v_member."businessName",
        'membershipStatus', v_member."membershipStatus",
        'businessMemberIdentifier', v_member."identifier",
        'businessMemberId', v_member."businessMemberId",
        'message', 'cancelled memberships must renew first before updating information'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'companyName', v_member."businessName",
    'membershipStatus', v_member."membershipStatus",
    'businessMemberIdentifier', v_member."identifier",
    'businessMemberId', v_member."businessMemberId"
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Unable to validate Business Member Identifier at this time'
    );
END;
$$;


ALTER FUNCTION "public"."check_member_exists"("p_identifier" "text", "p_application_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_member_exists_and_get"("p_identifier" "text", "p_application_type" "text" DEFAULT 'renewal'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."check_member_exists_and_get"("p_identifier" "text", "p_application_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_membership_expiry"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM public.process_membership_statuses(NOW());
END;
$$;


ALTER FUNCTION "public"."check_membership_expiry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."compute_primary_application_id"("p_member_id" "uuid") RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT a."applicationId"
  FROM public."Application" a
  WHERE a."memberId" = p_member_id
  ORDER BY
    CASE a."applicationStatus"
      WHEN 'approved' THEN 3
      WHEN 'pending' THEN 2
      WHEN 'new' THEN 1
      ELSE 0
    END DESC,
    a."applicationDate" DESC
  LIMIT 1;
$$;


ALTER FUNCTION "public"."compute_primary_application_id"("p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint DEFAULT NULL::bigint) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_row public."SponsoredRegistration"%ROWTYPE;
BEGIN
  -- Validation: reject negative fee deduction
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
    "feeDeduction",
    "maxSponsoredGuests",
    "status",
    "uuid"
  )
  VALUES (
    p_event_id,
    p_sponsored_by,
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


ALTER FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_evaluation"("eval_id" "uuid") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql"
    AS $$
declare
  deleted_count int;
begin
  delete from "EvaluationForm"
  where "evaluationId" = eval_id;

  get diagnostics deleted_count = row_count;

  if deleted_count = 0 then
    return query select false, 'Evaluation not found'::text;
  else
    return query select true, 'Evaluation deleted successfully'::text;
  end if;
end;
$$;


ALTER FUNCTION "public"."delete_evaluation"("eval_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_sr"("p_sponsored_registration_id" "uuid") RETURNS json
    LANGUAGE "sql"
    AS $$
  delete from public."SponsoredRegistration"
  where "sponsoredRegistrationId" = p_sponsored_registration_id
  returning json_build_object(
    'result', json_build_object(
      'success', true
    )
  );
$$;


ALTER FUNCTION "public"."delete_sr"("p_sponsored_registration_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_member_identifier"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW."identifier" IS NULL THEN
    NEW."identifier" := 'ibc-mem-' || left(replace(NEW."businessMemberId"::text, '-', ''), 8);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_member_identifier"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_member_identifier"() IS 'Trigger function that auto-generates a human-readable identifier for new BusinessMember records.';



CREATE OR REPLACE FUNCTION "public"."get_all_evaluations"() RETURNS TABLE("evaluation_id" "uuid", "event_id" "uuid", "event_title" "text", "event_start_date" timestamp with time zone, "event_end_date" timestamp with time zone, "venue" "text", "name" "text", "q1_rating" "public"."ratingScale", "q2_rating" "public"."ratingScale", "q3_rating" "public"."ratingScale", "q4_rating" "public"."ratingScale", "q5_rating" "public"."ratingScale", "q6_rating" "public"."ratingScale", "additional_comments" "text", "feedback" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    AS $$
  select
    ef."evaluationId",
    e."eventId",
    e."eventTitle",
    e."eventStartDate",
    e."eventEndDate",
    e."venue",
    ef."name",
    ef."q1Rating",
    ef."q2Rating",
    ef."q3Rating",
    ef."q4Rating",
    ef."q5Rating",
    ef."q6Rating",
    ef."additionalComments",
    ef."feedback",
    ef."createdAt"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  order by
    ef."createdAt" desc;
$$;


ALTER FUNCTION "public"."get_all_evaluations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_sponsored_registrations"() RETURNS TABLE("sponsored_registration_id" "uuid", "event_id" "uuid", "event_name" "text", "event_start_date" timestamp with time zone, "event_end_date" timestamp with time zone, "sponsored_by" "text", "uuid" "uuid", "max_sponsored_guests" integer, "used_count" integer, "status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.sponsored_registration_id,
    sr.event_id,
    e.event_title,
    e.event_start_date,
    e.event_end_date,
    sr.sponsored_by,
    sr.uuid,
    sr.max_sponsored_guests,
    sr.used_count,
    sr.status,
    sr.created_at,
    sr.updated_at
  FROM "SponsoredRegistration" sr
  LEFT JOIN "Event" e ON sr.event_id = e.event_id
  ORDER BY sr.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_all_sponsored_registrations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_sponsored_registrations_with_event"() RETURNS TABLE("sponsored_registration_id" "uuid", "event_id" "uuid", "event_title" "text", "event_start_date" timestamp with time zone, "event_end_date" timestamp with time zone, "sponsored_by" "text", "uuid" "uuid", "max_sponsored_guests" bigint, "used_count" bigint, "status" "public"."SponsoredRegistrationStatus", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    AS $$
SELECT
  sr."sponsoredRegistrationId"::uuid,
  sr."eventId"::uuid,
  e."eventTitle",
  e."eventStartDate",
  e."eventEndDate",
  sr."sponsoredBy",
  sr."uuid"::uuid,
  sr."maxSponsoredGuests",
  sr."usedCount",
  sr."status"::"SponsoredRegistrationStatus",
  sr."createdAt",
  sr."updatedAt"
FROM "SponsoredRegistration" sr
LEFT JOIN "Event" e ON sr."eventId" = e."eventId"
ORDER BY sr."createdAt" DESC;
$$;


ALTER FUNCTION "public"."get_all_sponsored_registrations_with_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_application_history"("p_member_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$DECLARE
  v_result jsonb;
  v_business_name text;
  v_applications jsonb;
BEGIN
  SELECT "businessName"
  INTO v_business_name
  FROM "BusinessMember"
  WHERE "businessMemberId" = p_member_id;

  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'Business member not found';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'applicationId', a."applicationId",
        'identifier', a."identifier",
        'companyName', a."companyName",
        'applicationDate', a."applicationDate",
        'applicationType', a."applicationType",
        'applicationStatus', a."applicationStatus",
        'applicationMemberType', a."applicationMemberType",
        'companyAddress', a."companyAddress",
        'emailAddress', a."emailAddress",
        'mobileNumber', a."mobileNumber",
        'landline', a."landline",
        'websiteURL', a."websiteURL",
        'paymentMethod', a."paymentMethod",
        'paymentProofStatus', a."paymentProofStatus",
        'sectorName', COALESCE(NULLIF(a."sectorName", ''), 'N/A'),
        'members', (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'applicationMemberId', am."applicationMemberId",
                'firstName', am."firstName",
                'lastName', am."lastName",
                'companyDesignation', am."companyDesignation",
                'companyMemberType', am."companyMemberType",
                'emailAddress', am."emailAddress"
              )
            ),
            '[]'::jsonb
          )
          FROM "ApplicationMember" am
          WHERE am."applicationId" = a."applicationId"
        )
      )
      ORDER BY a."applicationDate" DESC
    ),
    '[]'::jsonb
  )
  INTO v_applications
  FROM "Application" a
  WHERE a."businessMemberId" = p_member_id;

  v_result := jsonb_build_object(
    'businessName', v_business_name,
    'applications', v_applications
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to fetch application history: %', SQLERRM;
END;$$;


ALTER FUNCTION "public"."get_application_history"("p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_evaluation_by_id"("eval_id" "uuid") RETURNS TABLE("evaluation_id" "uuid", "event_id" "uuid", "event_title" "text", "event_start_date" timestamp with time zone, "event_end_date" timestamp with time zone, "venue" "text", "name" "text", "q1_rating" "public"."ratingScale", "q2_rating" "public"."ratingScale", "q3_rating" "public"."ratingScale", "q4_rating" "public"."ratingScale", "q5_rating" "public"."ratingScale", "q6_rating" "public"."ratingScale", "additional_comments" "text", "feedback" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    AS $$
  select
    ef."evaluationId",
    e."eventId",
    e."eventTitle",
    e."eventStartDate",
    e."eventEndDate",
    e."venue",
    ef."name",
    ef."q1Rating",
    ef."q2Rating",
    ef."q3Rating",
    ef."q4Rating",
    ef."q5Rating",
    ef."q6Rating",
    ef."additionalComments",
    ef."feedback",
    ef."createdAt"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  where
    ef."evaluationId" = eval_id;
$$;


ALTER FUNCTION "public"."get_evaluation_by_id"("eval_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_evaluations_by_event"("event_id" "uuid", "completed_only" boolean DEFAULT false) RETURNS TABLE("evaluation_id" "uuid", "event_id" "uuid", "event_title" "text", "event_start_date" timestamp with time zone, "event_end_date" timestamp with time zone, "venue" "text", "name" "text", "q1_rating" "public"."ratingScale", "q2_rating" "public"."ratingScale", "q3_rating" "public"."ratingScale", "q4_rating" "public"."ratingScale", "q5_rating" "public"."ratingScale", "q6_rating" "public"."ratingScale", "additional_comments" "text", "feedback" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    AS $$
  select
    ef."evaluationId" as "evaluation_id",
    e."eventId" as "event_id",
    e."eventTitle" as "event_title",
    e."eventStartDate" as "event_start_date",
    e."eventEndDate" as "event_end_date",
    e."venue" as "venue",
    ef."name" as "name",
    ef."q1Rating" as "q1_rating",
    ef."q2Rating" as "q2_rating",
    ef."q3Rating" as "q3_rating",
    ef."q4Rating" as "q4_rating",
    ef."q5Rating" as "q5_rating",
    ef."q6Rating" as "q6_rating",
    ef."additionalComments" as "additional_comments",
    ef."feedback" as "feedback",
    ef."createdAt" as "created_at"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  where
    (e."eventId" = "event_id")
    and (
      not "completed_only" or (
        ef."q1Rating" is not null and
        ef."q2Rating" is not null and
        ef."q3Rating" is not null and
        ef."q4Rating" is not null and
        ef."q5Rating" is not null and
        ef."q6Rating" is not null
      )
    )
  order by
    ef."createdAt" desc;
$$;


ALTER FUNCTION "public"."get_evaluations_by_event"("event_id" "uuid", "completed_only" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text") RETURNS SETOF "public"."participant_list_item"
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


ALTER FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_event_status"("p_event_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  total_regs bigint := 0;
  verified_regs bigint := 0;
  pending_regs bigint := 0;
  participants_total bigint := 0;
  attended_total bigint := 0;
  days_arr jsonb := '[]'::jsonb;
  has_event_days boolean;
BEGIN
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (
      WHERE r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    )::bigint,
    COUNT(*) FILTER (
      WHERE r."paymentProofStatus" = 'pending'::"PaymentProofStatus"
    )::bigint
  INTO total_regs, verified_regs, pending_regs
  FROM "Registration" r
  WHERE r."eventId" = p_event_id;

  SELECT COUNT(DISTINCT p."participantId") INTO participants_total
  FROM "Participant" p
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus";

  SELECT COUNT(DISTINCT ci."participantId") INTO attended_total
  FROM "CheckIn" ci
  JOIN "Participant" p ON p."participantId" = ci."participantId"
  JOIN "Registration" r ON r."registrationId" = p."registrationId"
  WHERE r."eventId" = p_event_id
    AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus";

  SELECT EXISTS(SELECT 1 FROM "EventDay" ed WHERE ed."eventId" = p_event_id)
  INTO has_event_days;

  IF has_event_days THEN
    WITH accepted_checkins AS (
      SELECT
        ci."eventDayId",
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    ),
    day_counts AS (
      SELECT
        ed."eventDayId" AS day_id,
        ed."label" AS day_label,
        ed."eventDate" AS day_date,
        COUNT(DISTINCT ac."participantId") AS participants
      FROM "EventDay" ed
      LEFT JOIN accepted_checkins ac ON ac."eventDayId" = ed."eventDayId"
      WHERE ed."eventId" = p_event_id
      GROUP BY ed."eventDayId", ed."label", ed."eventDate"
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_id', day_id,
          'day_label', coalesce(day_label, to_char(day_date, 'YYYY-MM-DD')),
          'day_date', day_date,
          'participants', participants,
          'attended', participants
        )
        ORDER BY day_date, day_id
      ),
      '[]'::jsonb
    ) INTO days_arr
    FROM day_counts;
  ELSE
    WITH accepted_checkins AS (
      SELECT
        ci."checkInTime"::date AS day_date,
        ci."participantId"
      FROM "CheckIn" ci
      JOIN "Participant" p ON p."participantId" = ci."participantId"
      JOIN "Registration" r ON r."registrationId" = p."registrationId"
      WHERE r."eventId" = p_event_id
        AND r."paymentProofStatus" = 'accepted'::"PaymentProofStatus"
    ),
    day_counts AS (
      SELECT
        day_date,
        COUNT(DISTINCT "participantId") AS participants
      FROM accepted_checkins
      GROUP BY day_date
    )
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_id', null,
          'day_label', to_char(day_date, 'YYYY-MM-DD'),
          'day_date', day_date,
          'participants', participants,
          'attended', participants
        )
        ORDER BY day_date
      ),
      '[]'::jsonb
    ) INTO days_arr
    FROM day_counts;
  END IF;

  RETURN jsonb_build_object(
    'event_id', p_event_id::text,
    'total_registrations', coalesce(total_regs, 0),
    'verified_registrations', coalesce(verified_regs, 0),
    'pending_registrations', coalesce(pending_regs, 0),
    'participants', coalesce(participants_total, 0),
    'attended', coalesce(attended_total, 0),
    'event_days', days_arr
  );
END;
$$;


ALTER FUNCTION "public"."get_event_status"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_events_for_select"() RETURNS TABLE("event_id" "uuid", "event_title" "text", "event_start_date" timestamp with time zone, "event_end_date" timestamp with time zone)
    LANGUAGE "sql" STABLE
    AS $$
SELECT
  e."eventId"::uuid,
  e."eventTitle",
  e."eventStartDate",
  e."eventEndDate"
FROM "Event" e
WHERE e."eventStartDate" > now()
ORDER BY e."eventStartDate" ASC;
$$;


ALTER FUNCTION "public"."get_events_for_select"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_member_primary_application"("p_member_id" "uuid") RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT public.compute_primary_application_id(p_member_id);
$$;


ALTER FUNCTION "public"."get_member_primary_application"("p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text" DEFAULT NULL::"text", "p_payment_proof_status" "public"."PaymentProofStatus" DEFAULT NULL::"public"."PaymentProofStatus") RETURNS SETOF "public"."registration_list_item"
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
            similarity(p_data.p_first_name || ' ' || p_data.p_last_name, p_search_text),
            similarity(r."identifier", p_search_text)
          )
        ELSE 0
      END AS sim_score,
      CASE
        WHEN p_search_text IS NOT NULL THEN
          (
            COALESCE(bm."businessName", r."nonMemberName") ILIKE v_search_pattern
            OR (p_data.p_first_name || ' ' || p_data.p_last_name) ILIKE v_search_pattern
            OR p_data.p_email ILIKE v_search_pattern
            OR r."identifier" ILIKE v_search_pattern
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


ALTER FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus") OWNER TO "postgres";


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

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."SponsoredRegistration" (
    "sponsoredRegistrationId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uuid" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventId" "uuid" NOT NULL,
    "sponsoredBy" "text" NOT NULL,
    "feeDeduction" numeric(10,2) DEFAULT 0 NOT NULL,
    "maxSponsoredGuests" bigint,
    "usedCount" bigint DEFAULT 0 NOT NULL,
    "status" "public"."SponsoredRegistrationStatus" DEFAULT 'active'::"public"."SponsoredRegistrationStatus" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    CONSTRAINT "SponsoredRegistration_used_check" CHECK ((("maxSponsoredGuests" IS NULL) OR ("usedCount" <= "maxSponsoredGuests")))
);


ALTER TABLE "public"."SponsoredRegistration" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sponsored_registration_by_id"("registration_id" "uuid") RETURNS SETOF "public"."SponsoredRegistration"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM "SponsoredRegistration"
  WHERE "sponsoredRegistrationId" = registration_id;
END;
$$;


ALTER FUNCTION "public"."get_sponsored_registration_by_id"("registration_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sponsored_registration_by_uuid"("p_uuid" "uuid") RETURNS TABLE("sponsoredRegistrationId" "uuid", "uuid" "uuid", "eventId" "uuid", "sponsoredBy" "text", "feeDeduction" numeric, "maxSponsoredGuests" bigint, "usedCount" bigint, "status" "public"."SponsoredRegistrationStatus", "createdAt" timestamp with time zone, "updatedAt" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr."sponsoredRegistrationId",
    sr."uuid",
    sr."eventId",
    sr."sponsoredBy",
    sr."feeDeduction",
    sr."maxSponsoredGuests",
    sr."usedCount",
    sr."status",
    sr."createdAt",
    sr."updatedAt"
  FROM public."SponsoredRegistration" sr
  WHERE sr."uuid" = p_uuid;
END;
$$;


ALTER FUNCTION "public"."get_sponsored_registration_by_uuid"("p_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sponsored_registrations_with_details"("p_event_id" "uuid") RETURNS TABLE("id" "uuid", "event_id" "uuid", "sponsor_id" "uuid", "registration_id" "uuid", "status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "sponsor_name" "text", "registration_email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.event_id,
    sr.sponsor_id,
    sr.registration_id,
    sr.status,
    sr.created_at,
    sr.updated_at,
    s.name as sponsor_name,
    r.email as registration_email
  FROM sponsored_registrations sr
  LEFT JOIN sponsors s ON sr.sponsor_id = s.id
  LEFT JOIN registrations r ON sr.registration_id = r.id
  WHERE sr.event_id = p_event_id
  ORDER BY sr.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_sponsored_registrations_with_details"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sr_by_event_id"("p_event_id" "uuid") RETURNS SETOF "public"."SponsoredRegistration"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT *
  FROM "SponsoredRegistration"
  WHERE "eventId" = p_event_id
  ORDER BY "createdAt" DESC;
$$;


ALTER FUNCTION "public"."get_sr_by_event_id"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_event_days"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  day_date DATE;
  day_label TEXT;
BEGIN
  -- Case 1: Event type changed to null (draft)
  IF (NEW."eventType" IS NULL) THEN
    DELETE FROM public."EventDay" WHERE "eventId" = NEW."eventId";
    RETURN NEW;
  END IF;

  -- Case 2: Event is inserted or updated with eventType = 'public' or 'private'
  -- Ensure dates are present before generating days
  IF (NEW."eventType" IN ('public', 'private') AND NEW."eventStartDate" IS NOT NULL AND NEW."eventEndDate" IS NOT NULL) THEN

    -- 1. Delete days that are outside the new range
    DELETE FROM public."EventDay"
    WHERE "eventId" = NEW."eventId"
    AND ("eventDate" < NEW."eventStartDate" OR "eventDate" > NEW."eventEndDate");

    -- 2. Insert missing days
    day_date := NEW."eventStartDate";
    WHILE day_date <= NEW."eventEndDate" LOOP
      -- Check if exists
      IF NOT EXISTS (
        SELECT 1 FROM public."EventDay"
        WHERE "eventId" = NEW."eventId" AND "eventDate" = day_date
      ) THEN
        -- Generate label (e.g., "Day 1")
        day_label := 'Day ' || (day_date - NEW."eventStartDate"::DATE + 1)::TEXT;

        INSERT INTO public."EventDay" ("eventId", "eventDate", "label")
        VALUES (NEW."eventId", day_date, day_label);
      END IF;

      day_date := day_date + 1;
    END LOOP;

    -- 3. Update labels for existing rows to ensure they match the new start date sequence
    -- This ensures that if start date shifts, "Day 1" is always the first day.
    UPDATE public."EventDay"
    SET label = 'Day ' || ("eventDate" - NEW."eventStartDate"::DATE + 1)::TEXT
    WHERE "eventId" = NEW."eventId";

  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_event_days"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."import_event_registrations"("p_event_id" "uuid", "p_rows" "jsonb", "p_dry_run" boolean DEFAULT false) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
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
$_$;


ALTER FUNCTION "public"."import_event_registrations"("p_event_id" "uuid", "p_rows" "jsonb", "p_dry_run" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(
    auth.jwt() ->> 'role' = 'admin'
    or auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    or auth.jwt() -> 'user_metadata' ->> 'role' = 'admin',
    false
  );
$$;


ALTER FUNCTION "public"."is_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."january_first_reset"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    ph_now timestamp;
    ph_year_start timestamptz;
BEGIN
    -- Compute Jan 1 using PH local time to avoid UTC boundary issues.
    ph_now := timezone('Asia/Manila', NOW());
    ph_year_start := (DATE_TRUNC('year', ph_now) AT TIME ZONE 'Asia/Manila');

    PERFORM public.process_membership_statuses(ph_year_start);
END;
$$;


ALTER FUNCTION "public"."january_first_reset"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_membership_statuses"("p_reference_time" timestamp with time zone DEFAULT "now"()) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_year_start date;
    next_year_start date;
BEGIN
    current_year_start := DATE_TRUNC('year', p_reference_time)::date;
    next_year_start := (current_year_start + INTERVAL '1 year')::date;

    -- Step 1: cancel members who were already unpaid and are now expired.
    UPDATE "BusinessMember"
    SET "membershipStatus" = 'cancelled'
    WHERE "membershipExpiryDate" IS NOT NULL
      AND "membershipExpiryDate" < p_reference_time
      AND "membershipStatus" = 'unpaid';

    -- Step 2: expired paid members enter grace period until next Jan 1.
    UPDATE "BusinessMember"
    SET "membershipStatus" = 'unpaid',
        "membershipExpiryDate" = next_year_start
    WHERE "membershipExpiryDate" IS NOT NULL
      AND "membershipExpiryDate" < p_reference_time
      AND "membershipStatus" = 'paid';
END;
$$;


ALTER FUNCTION "public"."process_membership_statuses"("p_reference_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."publish_event"("p_event_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_current_date DATE;
  v_day_number INT := 1;
BEGIN
  -- Update the event to be published and get the dates
  UPDATE "Event"
  SET "publishedAt" = NOW()
  WHERE "eventId" = p_event_id
  RETURNING "eventStartDate", "eventEndDate" INTO v_start_date, v_end_date;

  -- Check if event exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found or permission denied', p_event_id;
  END IF;

  -- Check if dates are present
  IF v_start_date IS NULL OR v_end_date IS NULL THEN
    RAISE EXCEPTION 'Event must have start and end dates to be published';
  END IF;

  -- Clear existing EventDay entries for this event to avoid duplicates
  DELETE FROM "EventDay" WHERE "eventId" = p_event_id;

  -- Loop through the dates and create EventDay rows
  v_current_date := v_start_date;
  WHILE v_current_date <= v_end_date LOOP
    INSERT INTO "EventDay" ("eventId", "eventDate", "label")
    VALUES (p_event_id, v_current_date, 'Day ' || v_day_number);

    v_current_date := v_current_date + 1;
    v_day_number := v_day_number + 1;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."publish_event"("p_event_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid" DEFAULT NULL::"uuid", "p_non_member_name" "text" DEFAULT NULL::"text", "p_registrant" "jsonb" DEFAULT '{}'::"jsonb", "p_remark" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_registration_id UUID;
  v_participant_id UUID;
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
    "registrationDate"
  ) VALUES (
    p_event_id,
    'ONSITE',
    'accepted',
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    NOW()
  )
  RETURNING "registrationId" INTO v_registration_id;

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


ALTER FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."schedule_interviews_batch"("p_interview_data" "jsonb") RETURNS TABLE("success" boolean, "message" "text", "interview_count" integer)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_interview_count integer := 0;
  v_updated_count integer := 0;
BEGIN
  -- Insert all interviews in a single operation
  INSERT INTO "public"."Interview" (
    "applicationId",
    "interviewDate",
    "interviewVenue",
    "status"
  )
  SELECT
    (item->>'applicationId')::uuid,
    (item->>'interviewDate')::timestamptz,
    item->>'interviewVenue',
    'scheduled'
  FROM jsonb_array_elements(p_interview_data) AS item
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_interview_count = ROW_COUNT;

  -- Link interviews to applications in a single bulk operation using a CTE
  -- This ensures all targeted Application rows receive their interviewId atomically
  WITH inserted_interviews AS (
    SELECT
      "interviewId",
      "applicationId"
    FROM "public"."Interview"
    WHERE "applicationId" IN (
      SELECT (item->>'applicationId')::uuid
      FROM jsonb_array_elements(p_interview_data) AS item
    )
    AND "status" = 'scheduled'
  )
  UPDATE "public"."Application" app
  SET "interviewId" = ii."interviewId"
  FROM inserted_interviews ii
  WHERE app."applicationId" = ii."applicationId";

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Verify row counts match to detect partial updates
  IF v_updated_count <> v_interview_count THEN
    RAISE EXCEPTION 'Interview linking mismatch: inserted %, updated %', v_interview_count, v_updated_count;
  END IF;

  RETURN QUERY SELECT
    true,
    format('Scheduled %s interview(s) and linked to applications', v_interview_count),
    v_interview_count;
END;
$$;


ALTER FUNCTION "public"."schedule_interviews_batch"("p_interview_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_membership_expiry"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    IF NEW."lastPaymentDate" IS NOT NULL THEN
        NEW."membershipExpiryDate" =
            DATE_TRUNC('year', NEW."lastPaymentDate")
            + INTERVAL '1 year';
        NEW."membershipStatus" = 'paid'::"MembershipStatus";
    END IF;
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."set_membership_expiry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_evaluation_form"("p_event_id" "uuid", "p_name" "text", "p_q1_rating" "public"."ratingScale", "p_q2_rating" "public"."ratingScale", "p_q3_rating" "public"."ratingScale", "p_q4_rating" "public"."ratingScale", "p_q5_rating" "public"."ratingScale", "p_q6_rating" "public"."ratingScale", "p_additional_comments" "text" DEFAULT NULL::"text", "p_feedback" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_evaluation_id uuid;
  v_name text;
BEGIN

  -- 1. Validate Inputs
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'Event ID is required.';
  END IF;

  v_name := COALESCE(NULLIF(TRIM(p_name), ''), 'Anonymous Participant');

  -- 2. Insert into "EvaluationForm" Table
  INSERT INTO "EvaluationForm" (
    "eventId",
    "name",
    "q1Rating",
    "q2Rating",
    "q3Rating",
    "q4Rating",
    "q5Rating",
    "q6Rating",
    "additionalComments",
    "feedback",
    "createdAt"
  ) VALUES (
    p_event_id,
    p_name,
    p_q1_rating,
    p_q2_rating,
    p_q3_rating,
    p_q4_rating,
    p_q5_rating,
    p_q6_rating,
    p_additional_comments,
    p_feedback,
    NOW()
  )
  RETURNING "evaluationId" INTO v_evaluation_id;  -- Change "id" to your actual PK column name

  -- 3. Return Success
  RETURN jsonb_build_object(
    'evaluationId', v_evaluation_id,
    'status', 'success',
    'message', 'Evaluation submitted successfully.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Evaluation submission failed: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."submit_evaluation_form"("p_event_id" "uuid", "p_name" "text", "p_q1_rating" "public"."ratingScale", "p_q2_rating" "public"."ratingScale", "p_q3_rating" "public"."ratingScale", "p_q4_rating" "public"."ratingScale", "p_q5_rating" "public"."ratingScale", "p_q6_rating" "public"."ratingScale", "p_additional_comments" "text", "p_feedback" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid" DEFAULT NULL::"uuid", "p_non_member_name" "text" DEFAULT NULL::"text", "p_payment_method" "text" DEFAULT 'onsite'::"text", "p_payment_path" "text" DEFAULT NULL::"text", "p_registrant" "jsonb" DEFAULT '{}'::"jsonb", "p_note" "text" DEFAULT NULL::"text", "p_other_participants" "jsonb" DEFAULT '[]'::"jsonb") RETURNS "jsonb"
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
    "note",
    "registrationDate"
  ) VALUES (
    p_event_id,
    v_payment_method_enum,
    v_payment_proof_status,
    CASE WHEN p_member_type = 'member' THEN p_business_member_id ELSE NULL END,
    CASE WHEN p_member_type = 'nonmember' THEN p_non_member_name ELSE NULL END,
    p_identifier,
    p_note,
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


EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, the transaction auto-rolls back
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_note" "text", "p_other_participants" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_sr_status"("p_sponsored_registration_id" "uuid") RETURNS json
    LANGUAGE "sql"
    AS $$
  update public."SponsoredRegistration"
  set status = case
    when status = 'active'::"SponsoredRegistrationStatus" then 'disabled'::"SponsoredRegistrationStatus"
    else 'active'::"SponsoredRegistrationStatus"
  end,
  "updatedAt" = now() at time zone 'utc'
  where "sponsoredRegistrationId" = p_sponsored_registration_id
  returning json_build_object(
    'result', json_build_object(
      'sponsoredRegistrationId', "sponsoredRegistrationId",
      'uuid', uuid,
      'eventId', "eventId",
      'sponsoredBy', "sponsoredBy",
      'feeDeduction', "feeDeduction",
      'maxSponsoredGuests', "maxSponsoredGuests",
      'usedCount', "usedCount",
      'status', status,
      'createdAt', "createdAt",
      'updatedAt', "updatedAt"
    )
  );
$$;


ALTER FUNCTION "public"."toggle_sr_status"("p_sponsored_registration_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_available_slots_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_total_participants BIGINT;
    v_max_guest INTEGER;
BEGIN
    -- Determine which event was affected
    IF (TG_OP = 'DELETE') THEN
        v_event_id := OLD."eventId";
    ELSE
        v_event_id := NEW."eventId";
    END IF;

    -- Get total participants for this event across all registrations
    SELECT COALESCE(SUM("numberOfParticipants"), 0)
    INTO v_total_participants
    FROM "Registration"
    WHERE "eventId" = v_event_id;

    -- Get maxGuest for this event
    SELECT COALESCE("maxGuest", 0)
    INTO v_max_guest
    FROM "Event"
    WHERE "eventId" = v_event_id;

    -- Update availableSlots: maxGuest - total participants, ensuring it doesn't go below 0
    UPDATE "Event"
    SET "availableSlots" = GREATEST(0, v_max_guest - v_total_participants)
    WHERE "eventId" = v_event_id;

    -- Return appropriate record
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_event_available_slots_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text" DEFAULT NULL::"text", "p_description" "text" DEFAULT NULL::"text", "p_event_header_url" "text" DEFAULT NULL::"text", "p_event_poster" "text" DEFAULT NULL::"text", "p_start_date" timestamp without time zone DEFAULT NULL::timestamp without time zone, "p_end_date" timestamp without time zone DEFAULT NULL::timestamp without time zone, "p_venue" "text" DEFAULT NULL::"text", "p_event_type" "text" DEFAULT NULL::"text", "p_registration_fee" real DEFAULT NULL::real, "p_facebook_link" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_existing_event "Event"%ROWTYPE;
  v_final_title text;
  v_final_description text;
  v_final_header_url text;
  v_final_poster_url text;
  v_final_start_date timestamp;
  v_final_end_date timestamp;
  v_final_venue text;
  v_final_event_type "EventType";
  v_final_registration_fee float4;
  v_final_facebook_link text;
  v_is_draft boolean;
  v_is_finished boolean;
BEGIN
  -- 1. Fetch the current event
  SELECT * INTO v_existing_event
  FROM "Event"
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event with ID % not found', p_event_id;
  END IF;

  -- 2. Determine if draft (eventType is NULL means draft)
  v_is_draft := (v_existing_event."eventType" IS NULL);

  -- 3. Determine if event is finished
  v_is_finished := (
    v_existing_event."eventEndDate" IS NOT NULL
    AND CURRENT_TIMESTAMP > v_existing_event."eventEndDate"
  );

  -- 4. Calculate final values using COALESCE
  v_final_title := COALESCE(p_title, v_existing_event."eventTitle");
  v_final_description := COALESCE(p_description, v_existing_event."description");
  v_final_header_url := COALESCE(p_event_header_url, v_existing_event."eventHeaderUrl");
  v_final_poster_url := COALESCE(p_event_poster, v_existing_event."eventPoster");
  v_final_start_date := COALESCE(p_start_date, v_existing_event."eventStartDate");
  v_final_end_date := COALESCE(p_end_date, v_existing_event."eventEndDate");
  v_final_venue := COALESCE(p_venue, v_existing_event."venue");
  v_final_registration_fee := COALESCE(p_registration_fee, v_existing_event."registrationFee");
  v_final_facebook_link := COALESCE(p_facebook_link, v_existing_event."facebookLink");

  IF p_event_type IS NULL THEN
    v_final_event_type := v_existing_event."eventType";
  ELSIF p_event_type = 'draft' THEN
    v_final_event_type := NULL;
  ELSE
    v_final_event_type := p_event_type::"EventType";
  END IF;

  -- 5. VALIDATION LOGIC

  -- SCENARIO A: DRAFT EVENTS (eventType IS NULL)
  IF v_is_draft THEN
    IF v_final_event_type IS NOT NULL THEN
      IF (v_final_title IS NULL OR v_final_title = '') OR
         (v_final_description IS NULL OR v_final_description = '') OR
         (v_final_start_date IS NULL) OR
         (v_final_end_date IS NULL) OR
         (v_final_venue IS NULL OR v_final_venue = '') THEN
        RAISE EXCEPTION 'Publish Failed: Event Title, Description, Start Date, End Date, and Venue must all be populated.';
      END IF;
    END IF;

  -- SCENARIO B: FINISHED EVENTS (end date has passed)
  ELSIF v_is_finished THEN
    IF p_title IS NOT NULL AND p_title IS DISTINCT FROM v_existing_event."eventTitle" THEN
      RAISE EXCEPTION 'Cannot edit Event Title for finished events.';
    END IF;
    IF p_description IS NOT NULL AND p_description IS DISTINCT FROM v_existing_event."description" THEN
      RAISE EXCEPTION 'Cannot edit Description for finished events.';
    END IF;
    IF p_start_date IS NOT NULL AND p_start_date IS DISTINCT FROM v_existing_event."eventStartDate" THEN
      RAISE EXCEPTION 'Cannot edit Start Date for finished events.';
    END IF;
    IF p_end_date IS NOT NULL AND p_end_date IS DISTINCT FROM v_existing_event."eventEndDate" THEN
      RAISE EXCEPTION 'Cannot edit End Date for finished events.';
    END IF;
    IF p_venue IS NOT NULL AND p_venue IS DISTINCT FROM v_existing_event."venue" THEN
      RAISE EXCEPTION 'Cannot edit Venue for finished events.';
    END IF;
    IF p_event_type IS NOT NULL AND p_event_type::"EventType" IS DISTINCT FROM v_existing_event."eventType" THEN
      RAISE EXCEPTION 'Cannot edit Event Type for finished events.';
    END IF;
    IF p_registration_fee IS NOT NULL AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for finished events.';
    END IF;

    IF p_facebook_link IS NULL AND v_existing_event."facebookLink" IS NULL THEN
      RAISE EXCEPTION 'Finished events can only update the Facebook link.';
    END IF;

    v_final_title := v_existing_event."eventTitle";
    v_final_description := v_existing_event."description";
    v_final_header_url := v_existing_event."eventHeaderUrl";
    v_final_start_date := v_existing_event."eventStartDate";
    v_final_end_date := v_existing_event."eventEndDate";
    v_final_venue := v_existing_event."venue";
    v_final_event_type := v_existing_event."eventType";
    v_final_registration_fee := v_existing_event."registrationFee";
    v_final_facebook_link := p_facebook_link;

  -- SCENARIO C: PUBLISHED EVENTS (Public/Private, not finished)
  ELSE
    IF p_registration_fee IS NOT NULL AND p_registration_fee IS DISTINCT FROM v_existing_event."registrationFee" THEN
      RAISE EXCEPTION 'Cannot edit Registration Fee for published events.';
    END IF;

    -- Allow only one-way conversion from private to public for published events.
    IF v_final_event_type IS DISTINCT FROM v_existing_event."eventType" THEN
      IF NOT (
        v_existing_event."eventType" = 'private'
        AND v_final_event_type = 'public'
      ) THEN
        RAISE EXCEPTION 'Cannot change Event Type for published events. Only private-to-public conversion is allowed.';
      END IF;
    END IF;

    v_final_registration_fee := v_existing_event."registrationFee";
  END IF;

  -- 6. PERFORM UPDATE
  UPDATE "Event"
  SET
    "eventTitle" = v_final_title,
    "description" = v_final_description,
    "eventHeaderUrl" = v_final_header_url,
    "eventPoster" = v_final_poster_url,
    "eventStartDate" = v_final_start_date,
    "eventEndDate" = v_final_end_date,
    "venue" = v_final_venue,
    "eventType" = v_final_event_type,
    "registrationFee" = v_final_registration_fee,
    "facebookLink" = v_final_facebook_link,
    "updatedAt" = NOW(),
    "publishedAt" = CASE
      WHEN v_is_draft AND v_final_event_type IS NOT NULL THEN NOW()
      ELSE "publishedAt"
    END
  WHERE "eventId" = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event update failed. The event may have been deleted or you do not have permission to update it.';
  END IF;

  -- 7. Return Response
  RETURN jsonb_build_object(
    'success', true,
    'eventId', p_event_id,
    'eventType', COALESCE(v_final_event_type::text, 'draft'),
    'message', 'Event updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'eventId', p_event_id,
      'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_event_poster" "text", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone, "p_venue" "text", "p_event_type" "text", "p_registration_fee" real, "p_facebook_link" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_published_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF new."eventType" IS NULL then
        new."publishedAt" = null;
    else
        new."publishedAt" = now();
    end if;

    return NEW;
END;
$$;


ALTER FUNCTION "public"."update_event_published_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_member_with_representatives"("p_member_id" "uuid", "p_application_id" "uuid", "p_business_name" "text", "p_sector_id" integer, "p_company_address" "text", "p_email_address" "text", "p_landline" "text", "p_mobile_number" "text", "p_website_url" "text" DEFAULT NULL::"text", "p_membership_status" "public"."MembershipStatus" DEFAULT NULL::"public"."MembershipStatus", "p_join_date" "date" DEFAULT NULL::"date", "p_membership_expiry_date" "date" DEFAULT NULL::"date", "p_representatives" "jsonb" DEFAULT '[]'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_sector_name text;
  v_rep_count integer;
  v_principal_count integer;
  v_alternate_count integer;
  v_updated_reps integer;
begin
  -- Validate base identifiers
  if p_member_id is null then
    raise exception 'p_member_id is required';
  end if;

  if p_application_id is null then
    raise exception 'p_application_id is required';
  end if;

  -- Ensure application belongs to member
  if not exists (
    select 1
    from public."Application" a
    where a."applicationId" = p_application_id
      and a."businessMemberId" = p_member_id
  ) then
    raise exception 'Application % does not belong to member %', p_application_id, p_member_id;
  end if;

  -- Resolve sector name
  select s."sectorName"
    into v_sector_name
  from public."Sector" s
  where s."sectorId" = p_sector_id;

  if v_sector_name is null then
    raise exception 'Invalid sectorId: %', p_sector_id;
  end if;

  -- Validate representatives payload shape
  if jsonb_typeof(p_representatives) <> 'array' then
    raise exception 'p_representatives must be a JSON array';
  end if;

  v_rep_count := jsonb_array_length(p_representatives);
  if v_rep_count <> 2 then
    raise exception 'Exactly two representatives are required';
  end if;

  -- Validate one principal + one alternate
  with reps as (
    select
      r.companyMemberType
    from jsonb_to_recordset(p_representatives) as r(
      applicationMemberId uuid,
      firstName text,
      lastName text,
      emailAddress text,
      mobileNumber text,
      landline text,
      mailingAddress text,
      companyDesignation text,
      companyMemberType text,
      birthdate date,
      nationality text,
      sex text
    )
  )
  select
    count(*) filter (where companyMemberType = 'principal'),
    count(*) filter (where companyMemberType = 'alternate')
  into v_principal_count, v_alternate_count
  from reps;

  if v_principal_count <> 1 or v_alternate_count <> 1 then
    raise exception 'Representatives must contain exactly one principal and one alternate';
  end if;

  -- Validate provided representative IDs belong to this application
  if exists (
    with reps as (
      select
        r.applicationMemberId
      from jsonb_to_recordset(p_representatives) as r(
        applicationMemberId uuid,
        firstName text,
        lastName text,
        emailAddress text,
        mobileNumber text,
        landline text,
        mailingAddress text,
        companyDesignation text,
        companyMemberType text,
        birthdate date,
        nationality text,
        sex text
      )
    )
    select 1
    from reps
    where applicationMemberId is not null
      and not exists (
        select 1
        from public."ApplicationMember" am
        where am."applicationMemberId" = reps.applicationMemberId
          and am."applicationId" = p_application_id
      )
  ) then
    raise exception 'One or more representative IDs are invalid for this application';
  end if;

  -- 1) Update BusinessMember
  update public."BusinessMember"
  set
    "businessName" = p_business_name,
    "websiteURL" = p_website_url,
    "sectorId" = p_sector_id,
    "membershipStatus" = p_membership_status,
    "joinDate" = p_join_date,
    "membershipExpiryDate" = p_membership_expiry_date
  where "businessMemberId" = p_member_id;

  if not found then
    raise exception 'Member not found: %', p_member_id;
  end if;

  -- 2) Update Application snapshot
  update public."Application"
  set
    "companyName" = p_business_name,
    "companyAddress" = p_company_address,
    "emailAddress" = p_email_address,
    "landline" = p_landline,
    "mobileNumber" = p_mobile_number,
    "websiteURL" = p_website_url,
    "sectorName" = v_sector_name
  where "applicationId" = p_application_id;

  if not found then
    raise exception 'Application not found: %', p_application_id;
  end if;

  -- 3) Upsert representatives
  with reps as (
    select
      coalesce(r.applicationMemberId, gen_random_uuid()) as "applicationMemberId",
      p_application_id as "applicationId",
      r.firstName as "firstName",
      r.lastName as "lastName",
      r.emailAddress as "emailAddress",
      r.mobileNumber as "mobileNumber",
      r.landline as "landline",
      r.mailingAddress as "mailingAddress",
      r.companyDesignation as "companyDesignation",
      r.companyMemberType::public."CompanyMemberType" as "companyMemberType",
      r.birthdate as "birthdate",
      r.nationality as "nationality",
      r.sex as "sex"
    from jsonb_to_recordset(p_representatives) as r(
      applicationMemberId uuid,
      firstName text,
      lastName text,
      emailAddress text,
      mobileNumber text,
      landline text,
      mailingAddress text,
      companyDesignation text,
      companyMemberType text,
      birthdate date,
      nationality text,
      sex text
    )
  ),
  upserted as (
    insert into public."ApplicationMember" (
      "applicationMemberId",
      "applicationId",
      "firstName",
      "lastName",
      "emailAddress",
      "mobileNumber",
      "landline",
      "mailingAddress",
      "companyDesignation",
      "companyMemberType",
      "birthdate",
      "nationality",
      "sex"
    )
    select
      "applicationMemberId",
      "applicationId",
      "firstName",
      "lastName",
      "emailAddress",
      "mobileNumber",
      "landline",
      "mailingAddress",
      "companyDesignation",
      "companyMemberType",
      "birthdate",
      "nationality",
      "sex"
    from reps
    on conflict ("applicationMemberId")
    do update set
      "firstName" = excluded."firstName",
      "lastName" = excluded."lastName",
      "emailAddress" = excluded."emailAddress",
      "mobileNumber" = excluded."mobileNumber",
      "landline" = excluded."landline",
      "mailingAddress" = excluded."mailingAddress",
      "companyDesignation" = excluded."companyDesignation",
      "companyMemberType" = excluded."companyMemberType",
      "birthdate" = excluded."birthdate",
      "nationality" = excluded."nationality",
      "sex" = excluded."sex"
    returning 1
  )
  select count(*) into v_updated_reps from upserted;

  if v_updated_reps <> 2 then
    raise exception 'Expected to upsert exactly 2 representatives, got %', v_updated_reps;
  end if;

  return jsonb_build_object(
    'success', true,
    'memberId', p_member_id,
    'applicationId', p_application_id,
    'representativesUpdated', v_updated_reps
  );
end;
$$;


ALTER FUNCTION "public"."update_member_with_representatives"("p_member_id" "uuid", "p_application_id" "uuid", "p_business_name" "text", "p_sector_id" integer, "p_company_address" "text", "p_email_address" "text", "p_landline" "text", "p_mobile_number" "text", "p_website_url" "text", "p_membership_status" "public"."MembershipStatus", "p_join_date" "date", "p_membership_expiry_date" "date", "p_representatives" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_participant_count_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE "Registration"
        SET "numberOfParticipants" = (
            SELECT COUNT(*) FROM "Participant" WHERE "registrationId" = NEW."registrationId"
        )
        WHERE "registrationId" = NEW."registrationId";
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE "Registration"
        SET "numberOfParticipants" = (
            SELECT COUNT(*) FROM "Participant" WHERE "registrationId" = OLD."registrationId"
        )
        WHERE "registrationId" = OLD."registrationId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_participant_count_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_primary_application_for_member"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  affected_member uuid;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF NEW."applicationType" <> 'updating'::"ApplicationType" THEN
    RETURN NEW;
  END IF;

  IF NEW."applicationStatus" <> 'approved'::"ApplicationStatus" THEN
    RETURN NEW;
  END IF;

  IF OLD."applicationStatus" = NEW."applicationStatus" THEN
    RETURN NEW;
  END IF;

  affected_member := NEW."businessMemberId";

  IF affected_member IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public."BusinessMember"
  SET "primaryApplicationId" = NEW."applicationId"
  WHERE "businessMemberId" = affected_member;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_primary_application_for_member"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sponsored_registration_used_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_sponsored_registration_id UUID;
  v_new_count INT;
BEGIN
  -- Determine which sponsored registration ID to update
  IF (TG_OP = 'DELETE') THEN
    v_sponsored_registration_id := OLD."sponsoredRegistrationId";
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle both old and new sponsored registration IDs if they differ
    IF OLD."sponsoredRegistrationId" IS DISTINCT FROM NEW."sponsoredRegistrationId" THEN
      -- Update count for old sponsored registration
      IF OLD."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(*)::INT
          FROM public."Registration"
          WHERE "sponsoredRegistrationId" = OLD."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = OLD."sponsoredRegistrationId";
      END IF;

      -- Update count for new sponsored registration
      IF NEW."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(*)::INT
          FROM public."Registration"
          WHERE "sponsoredRegistrationId" = NEW."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = NEW."sponsoredRegistrationId";
      END IF;

      RETURN NEW;
    END IF;
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  ELSE -- INSERT
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  END IF;

  -- Update the usedCount for the affected sponsored registration
  IF v_sponsored_registration_id IS NOT NULL THEN
    UPDATE public."SponsoredRegistration"
    SET "usedCount" = (
      SELECT COUNT(*)::INT
      FROM public."Registration"
      WHERE "sponsoredRegistrationId" = v_sponsored_registration_id
    )
    WHERE "sponsoredRegistrationId" = v_sponsored_registration_id;
  END IF;

  -- Return appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_sponsored_registration_used_count"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_sponsored_registration_used_count"() IS 'Automatically updates the usedCount field in SponsoredRegistration table whenever a Registration is added, updated, or deleted. The count reflects the total number of registrations using the sponsored link.';



CREATE OR REPLACE FUNCTION "public"."update_sponsored_registration_used_count_from_participant"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_sponsored_registration_id UUID;
  v_registration_id UUID;
BEGIN
  -- Get the registration ID
  IF (TG_OP = 'DELETE') THEN
    v_registration_id := OLD."registrationId";
  ELSE
    v_registration_id := NEW."registrationId";
  END IF;

  -- Get the sponsored registration ID from the registration
  SELECT "sponsoredRegistrationId" INTO v_sponsored_registration_id
  FROM public."Registration"
  WHERE "registrationId" = v_registration_id;

  -- Update the usedCount if this registration is sponsored
  IF v_sponsored_registration_id IS NOT NULL THEN
    UPDATE public."SponsoredRegistration"
    SET "usedCount" = (
      SELECT COUNT(p."participantId")::INT
      FROM public."Registration" r
      INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
      WHERE r."sponsoredRegistrationId" = v_sponsored_registration_id
    )
    WHERE "sponsoredRegistrationId" = v_sponsored_registration_id;
  END IF;

  -- Return appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_sponsored_registration_used_count_from_participant"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_sponsored_registration_used_count_from_participant"() IS 'Automatically updates the usedCount field in SponsoredRegistration table when Participant records are added or deleted. The count reflects the total number of PARTICIPANTS using the sponsored link.';



CREATE OR REPLACE FUNCTION "public"."update_sponsored_registration_used_count_from_registration"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_sponsored_registration_id UUID;
BEGIN
  -- Determine which sponsored registration ID to update
  IF (TG_OP = 'DELETE') THEN
    v_sponsored_registration_id := OLD."sponsoredRegistrationId";
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle both old and new sponsored registration IDs if they differ
    IF OLD."sponsoredRegistrationId" IS DISTINCT FROM NEW."sponsoredRegistrationId" THEN
      -- Update count for old sponsored registration (count participants)
      IF OLD."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(p."participantId")::INT
          FROM public."Registration" r
          INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
          WHERE r."sponsoredRegistrationId" = OLD."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = OLD."sponsoredRegistrationId";
      END IF;

      -- Update count for new sponsored registration (count participants)
      IF NEW."sponsoredRegistrationId" IS NOT NULL THEN
        UPDATE public."SponsoredRegistration"
        SET "usedCount" = (
          SELECT COUNT(p."participantId")::INT
          FROM public."Registration" r
          INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
          WHERE r."sponsoredRegistrationId" = NEW."sponsoredRegistrationId"
        )
        WHERE "sponsoredRegistrationId" = NEW."sponsoredRegistrationId";
      END IF;

      RETURN NEW;
    END IF;
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  ELSE -- INSERT
    v_sponsored_registration_id := NEW."sponsoredRegistrationId";
  END IF;

  -- Update the usedCount for the affected sponsored registration (count participants)
  IF v_sponsored_registration_id IS NOT NULL THEN
    UPDATE public."SponsoredRegistration"
    SET "usedCount" = (
      SELECT COUNT(p."participantId")::INT
      FROM public."Registration" r
      INNER JOIN public."Participant" p ON r."registrationId" = p."registrationId"
      WHERE r."sponsoredRegistrationId" = v_sponsored_registration_id
    )
    WHERE "sponsoredRegistrationId" = v_sponsored_registration_id;
  END IF;

  -- Return appropriate row
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_sponsored_registration_used_count_from_registration"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_sponsored_registration_used_count_from_registration"() IS 'Automatically updates the usedCount field in SponsoredRegistration table when Registration records are added, updated, or deleted. The count reflects the total number of PARTICIPANTS using the sponsored link.';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_website_content_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_website_content_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."WebsiteContent" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "public"."WebsiteContentSection" NOT NULL,
    "entryKey" "text" NOT NULL,
    "textType" "public"."WebsiteContentTextType" NOT NULL,
    "textValue" "text",
    "icon" "text",
    "imageUrl" "text",
    "cardPlacement" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group" "text",
    CONSTRAINT "WebsiteContent_cardPlacement_nonnegative" CHECK ((("cardPlacement" IS NULL) OR ("cardPlacement" >= 1))),
    CONSTRAINT "WebsiteContent_content_present" CHECK ((("textValue" IS NOT NULL) OR ("icon" IS NOT NULL) OR ("imageUrl" IS NOT NULL)))
);


ALTER TABLE "public"."WebsiteContent" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_website_content"("p_section" "public"."WebsiteContentSection", "p_entry_key" "text", "p_text_type" "public"."WebsiteContentTextType", "p_text_value" "text" DEFAULT NULL::"text", "p_icon" "text" DEFAULT NULL::"text", "p_image_url" "text" DEFAULT NULL::"text", "p_group" "text" DEFAULT NULL::"text", "p_card_placement" integer DEFAULT NULL::integer, "p_is_active" boolean DEFAULT true) RETURNS "public"."WebsiteContent"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_card_placement integer;
  v_row "public"."WebsiteContent";
BEGIN
  IF p_card_placement IS NULL
    AND p_section IN (
      'goals',
      'company_thrusts',
      'board_of_trustees',
      'secretariat',
      'landing_page_benefits'
    ) THEN
    PERFORM pg_advisory_xact_lock(
      hashtextextended(p_section::text || ':' || p_text_type::text, 0)
    );

    SELECT COALESCE(MAX(wc."cardPlacement"), 0) + 1
    INTO v_card_placement
    FROM "public"."WebsiteContent" wc
    WHERE wc."section" = p_section
      AND wc."textType" = p_text_type;
  ELSE
    v_card_placement := p_card_placement;
  END IF;

  INSERT INTO "public"."WebsiteContent" (
    "section",
    "entryKey",
    "textType",
    "textValue",
    "icon",
    "imageUrl",
    "group",
    "cardPlacement",
    "isActive"
  ) VALUES (
    p_section,
    p_entry_key,
    p_text_type,
    p_text_value,
    p_icon,
    p_image_url,
    p_group,
    v_card_placement,
    p_is_active
  )
  ON CONFLICT ("section", "entryKey", "textType") DO UPDATE
  SET
    "textValue" = EXCLUDED."textValue",
    "icon" = EXCLUDED."icon",
    "imageUrl" = EXCLUDED."imageUrl",
    "group" = EXCLUDED."group",
    "cardPlacement" = EXCLUDED."cardPlacement",
    "isActive" = EXCLUDED."isActive"
  RETURNING *
  INTO v_row;

  RETURN v_row;
END;
$$;


ALTER FUNCTION "public"."upsert_website_content"("p_section" "public"."WebsiteContentSection", "p_entry_key" "text", "p_text_type" "public"."WebsiteContentTextType", "p_text_value" "text", "p_icon" "text", "p_image_url" "text", "p_group" "text", "p_card_placement" integer, "p_is_active" boolean) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Application" (
    "applicationId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "businessMemberId" "uuid",
    "sectorName" "text",
    "logoImageURL" "text" NOT NULL,
    "applicationDate" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "applicationType" "public"."ApplicationType" NOT NULL,
    "companyName" "text" NOT NULL,
    "companyAddress" "text" NOT NULL,
    "landline" "text" NOT NULL,
    "mobileNumber" "text" NOT NULL,
    "emailAddress" "text" NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "websiteURL" "text" NOT NULL,
    "applicationMemberType" "public"."ApplicationMemberType" NOT NULL,
    "applicationStatus" "public"."ApplicationStatus" DEFAULT 'new'::"public"."ApplicationStatus" NOT NULL,
    "interviewId" "uuid",
    "identifier" "text" NOT NULL,
    "paymentProofStatus" "public"."PaymentProofStatus" DEFAULT 'pending'::"public"."PaymentProofStatus" NOT NULL
);


ALTER TABLE "public"."Application" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ApplicationMember" (
    "applicationMemberId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "applicationId" "uuid" NOT NULL,
    "firstName" "text" NOT NULL,
    "mailingAddress" "text" NOT NULL,
    "sex" "text" NOT NULL,
    "nationality" "text" NOT NULL,
    "birthdate" "date" NOT NULL,
    "companyDesignation" "text" NOT NULL,
    "landline" "text" NOT NULL,
    "mobileNumber" "text" NOT NULL,
    "emailAddress" "text" NOT NULL,
    "lastName" "text" NOT NULL,
    "companyMemberType" "public"."CompanyMemberType" NOT NULL
);


ALTER TABLE "public"."ApplicationMember" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."BusinessMember" (
    "sectorId" bigint NOT NULL,
    "logoImageURL" "text",
    "joinDate" "date" NOT NULL,
    "websiteURL" "text" NOT NULL,
    "businessName" "text" NOT NULL,
    "businessMemberId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lastPaymentDate" timestamp without time zone DEFAULT "now"(),
    "membershipExpiryDate" timestamp with time zone,
    "primaryApplicationId" "uuid" NOT NULL,
    "membershipStatus" "public"."MembershipStatus" DEFAULT 'paid'::"public"."MembershipStatus",
    "identifier" "text" NOT NULL,
    "featuredExpirationDate" "date"
);


ALTER TABLE "public"."BusinessMember" OWNER TO "postgres";


COMMENT ON COLUMN "public"."BusinessMember"."identifier" IS 'Human-readable member identifier in format ibc-mem-XXXXXXXX (first 8 chars of UUID without dashes). Auto-generated on insert.';



CREATE TABLE IF NOT EXISTS "public"."CheckIn" (
    "participantId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "checkInId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventDayId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "remarks" "text",
    "checkInTime" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL
);


ALTER TABLE "public"."CheckIn" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."EvaluationForm" (
    "evaluationId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventId" "uuid" NOT NULL,
    "name" "text",
    "q1Rating" "public"."ratingScale" NOT NULL,
    "q2Rating" "public"."ratingScale" NOT NULL,
    "q3Rating" "public"."ratingScale" NOT NULL,
    "q4Rating" "public"."ratingScale" NOT NULL,
    "q5Rating" "public"."ratingScale" NOT NULL,
    "q6Rating" "public"."ratingScale" NOT NULL,
    "additionalComments" "text",
    "feedback" "text",
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."EvaluationForm" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Event" (
    "eventId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventTitle" "text" NOT NULL,
    "eventHeaderUrl" "text",
    "description" "text",
    "eventStartDate" timestamp with time zone,
    "eventEndDate" timestamp with time zone,
    "venue" "text",
    "eventType" "public"."EventType",
    "registrationFee" real DEFAULT '0'::real NOT NULL,
    "updatedAt" timestamp with time zone,
    "publishedAt" timestamp with time zone,
    "eventPoster" "text",
    "facebookLink" "text"
);


ALTER TABLE "public"."Event" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."EventDay" (
    "eventDayId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventId" "uuid" NOT NULL,
    "eventDate" "date" NOT NULL,
    "label" "text" NOT NULL
);


ALTER TABLE "public"."EventDay" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Interview" (
    "interviewId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interviewDate" timestamp with time zone NOT NULL,
    "interviewVenue" "text" NOT NULL,
    "status" "public"."InterviewStatus" DEFAULT 'scheduled'::"public"."InterviewStatus",
    "notes" "text",
    "createdAt" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updatedAt" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "applicationId" "uuid"
);


ALTER TABLE "public"."Interview" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Networks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization" "text" NOT NULL,
    "about" "text" NOT NULL,
    "location_type" "text" NOT NULL,
    "representative_name" "text" NOT NULL,
    "representative_position" "text" NOT NULL,
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Networks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Participant" (
    "participantId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registrationId" "uuid" NOT NULL,
    "firstName" "text" NOT NULL,
    "lastName" "text" NOT NULL,
    "contactNumber" "text" NOT NULL,
    "email" "text" NOT NULL,
    "isPrincipal" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."Participant" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ProofImage" (
    "proofImageId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registrationId" "uuid",
    "path" "text" NOT NULL,
    "applicationId" "uuid"
);


ALTER TABLE "public"."ProofImage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Registration" (
    "registrationId" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eventId" "uuid" NOT NULL,
    "businessMemberId" "uuid",
    "nonMemberName" "text",
    "registrationDate" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "identifier" "text" NOT NULL,
    "numberOfParticipants" bigint,
    "sponsoredRegistrationId" "uuid",
    "paymentProofStatus" "public"."PaymentProofStatus" DEFAULT 'pending'::"public"."PaymentProofStatus" NOT NULL,
    "note" "text",
    "sourceSubmissionId" "text"
);


ALTER TABLE "public"."Registration" OWNER TO "postgres";


COMMENT ON COLUMN "public"."Registration"."numberOfParticipants" IS 'stores the participants each registrant registered in the event';



CREATE TABLE IF NOT EXISTS "public"."Sector" (
    "sectorId" bigint NOT NULL,
    "sectorName" "text" NOT NULL
);


ALTER TABLE "public"."Sector" OWNER TO "postgres";


ALTER TABLE "public"."Sector" ALTER COLUMN "sectorId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Sector_sectorId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."ApplicationMember"
    ADD CONSTRAINT "ApplicationMember_pkey" PRIMARY KEY ("applicationMemberId");



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_applicationId_key" UNIQUE ("applicationId");



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_identifier_key" UNIQUE ("identifier");



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId");



ALTER TABLE ONLY "public"."BusinessMember"
    ADD CONSTRAINT "BusinessMember_identifier_key" UNIQUE ("identifier");



ALTER TABLE ONLY "public"."BusinessMember"
    ADD CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("businessMemberId");



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_participantId_eventDayId__unique" UNIQUE ("participantId", "eventDayId");



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("checkInId");



ALTER TABLE ONLY "public"."EventDay"
    ADD CONSTRAINT "EventDay_eventId_eventDate_key" UNIQUE ("eventId", "eventDate");



ALTER TABLE ONLY "public"."EventDay"
    ADD CONSTRAINT "EventDay_pkey" PRIMARY KEY ("eventDayId");



ALTER TABLE ONLY "public"."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId");



ALTER TABLE ONLY "public"."Interview"
    ADD CONSTRAINT "Interview_pkey" PRIMARY KEY ("interviewId");



ALTER TABLE ONLY "public"."Participant"
    ADD CONSTRAINT "Participant_pkey" PRIMARY KEY ("participantId");



ALTER TABLE ONLY "public"."ProofImage"
    ADD CONSTRAINT "ProofImage_pkey" PRIMARY KEY ("proofImageId");



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_pkey" PRIMARY KEY ("registrationId");



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_token_key" UNIQUE ("identifier");



ALTER TABLE ONLY "public"."Sector"
    ADD CONSTRAINT "Sector_pkey" PRIMARY KEY ("sectorId");



ALTER TABLE ONLY "public"."SponsoredRegistration"
    ADD CONSTRAINT "SponsoredRegistration_pkey" PRIMARY KEY ("sponsoredRegistrationId");



ALTER TABLE ONLY "public"."SponsoredRegistration"
    ADD CONSTRAINT "SponsoredRegistration_uuid_unique" UNIQUE ("uuid");



ALTER TABLE ONLY "public"."WebsiteContent"
    ADD CONSTRAINT "WebsiteContent_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."EvaluationForm"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("evaluationId");



ALTER TABLE ONLY "public"."Networks"
    ADD CONSTRAINT "networks_pkey" PRIMARY KEY ("id");



CREATE INDEX "BusinessMember_primaryApplicationId_idx" ON "public"."BusinessMember" USING "btree" ("primaryApplicationId");



CREATE UNIQUE INDEX "Registration_event_sourceSubmissionId_unique" ON "public"."Registration" USING "btree" ("eventId", "sourceSubmissionId") WHERE ("sourceSubmissionId" IS NOT NULL);



CREATE INDEX "WebsiteContent_is_active_idx" ON "public"."WebsiteContent" USING "btree" ("isActive");



CREATE INDEX "WebsiteContent_section_card_placement_idx" ON "public"."WebsiteContent" USING "btree" ("section", "cardPlacement") WHERE ("isActive" = true);



CREATE UNIQUE INDEX "WebsiteContent_section_entry_key_text_type_key" ON "public"."WebsiteContent" USING "btree" ("section", "entryKey", "textType");



CREATE INDEX "idx_interview_date" ON "public"."Interview" USING "btree" ("interviewDate");



CREATE INDEX "idx_interview_status" ON "public"."Interview" USING "btree" ("status");



CREATE INDEX "idx_registration_sponsored" ON "public"."Registration" USING "btree" ("sponsoredRegistrationId");



CREATE INDEX "idx_registration_sponsored_registration_id" ON "public"."Registration" USING "btree" ("sponsoredRegistrationId");



CREATE OR REPLACE TRIGGER "on_application_sync_primary" AFTER UPDATE OF "applicationStatus", "businessMemberId" ON "public"."Application" FOR EACH ROW EXECUTE FUNCTION "public"."update_primary_application_for_member"();



CREATE OR REPLACE TRIGGER "on_event_change" AFTER INSERT OR UPDATE ON "public"."Event" FOR EACH ROW EXECUTE FUNCTION "public"."handle_event_days"();



CREATE OR REPLACE TRIGGER "on_event_publish" AFTER INSERT OR UPDATE ON "public"."Event" FOR EACH ROW EXECUTE FUNCTION "public"."update_event_published_at"();



CREATE OR REPLACE TRIGGER "set_member_identifier" BEFORE INSERT ON "public"."BusinessMember" FOR EACH ROW EXECUTE FUNCTION "public"."generate_member_identifier"();



CREATE OR REPLACE TRIGGER "set_networks_updated_at" BEFORE UPDATE ON "public"."Networks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_website_content_updated_at" BEFORE UPDATE ON "public"."WebsiteContent" FOR EACH ROW EXECUTE FUNCTION "public"."update_website_content_updated_at"();



CREATE OR REPLACE TRIGGER "tr_update_participant_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."Participant" FOR EACH ROW EXECUTE FUNCTION "public"."update_participant_count_trigger"();



CREATE OR REPLACE TRIGGER "tr_update_sponsored_registration_used_count" AFTER INSERT OR DELETE OR UPDATE OF "sponsoredRegistrationId" ON "public"."Registration" FOR EACH ROW EXECUTE FUNCTION "public"."update_sponsored_registration_used_count_from_registration"();



CREATE OR REPLACE TRIGGER "tr_update_sponsored_registration_used_count_from_participant" AFTER INSERT OR DELETE ON "public"."Participant" FOR EACH ROW EXECUTE FUNCTION "public"."update_sponsored_registration_used_count_from_participant"();



CREATE OR REPLACE TRIGGER "trigger_set_membership_expiry" BEFORE INSERT OR UPDATE OF "lastPaymentDate" ON "public"."BusinessMember" FOR EACH ROW EXECUTE FUNCTION "public"."set_membership_expiry"();



ALTER TABLE ONLY "public"."ApplicationMember"
    ADD CONSTRAINT "ApplicationMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES "public"."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Application"
    ADD CONSTRAINT "Application_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("interviewId") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."BusinessMember"
    ADD CONSTRAINT "BusinessMember_primaryApplicationId_fkey" FOREIGN KEY ("primaryApplicationId") REFERENCES "public"."Application"("applicationId") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."BusinessMember"
    ADD CONSTRAINT "BusinessMember_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."Sector"("sectorId") ON UPDATE CASCADE ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_eventDayId_fkey" FOREIGN KEY ("eventDayId") REFERENCES "public"."EventDay"("eventDayId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."CheckIn"
    ADD CONSTRAINT "CheckIn_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("participantId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."EventDay"
    ADD CONSTRAINT "EventDay_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Interview"
    ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."Participant"
    ADD CONSTRAINT "Participant_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("registrationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ProofImage"
    ADD CONSTRAINT "ProofImage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ProofImage"
    ADD CONSTRAINT "ProofImage_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."Registration"("registrationId") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_businessMemberId_fkey" FOREIGN KEY ("businessMemberId") REFERENCES "public"."BusinessMember"("businessMemberId") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."Registration"
    ADD CONSTRAINT "Registration_sponsoredRegistrationId_fkey" FOREIGN KEY ("sponsoredRegistrationId") REFERENCES "public"."SponsoredRegistration"("sponsoredRegistrationId") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."SponsoredRegistration"
    ADD CONSTRAINT "SponsoredRegistration_event_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId");



ALTER TABLE ONLY "public"."EvaluationForm"
    ADD CONSTRAINT "evaluationform_eventid_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE;



CREATE POLICY "Admins can remove interviews" ON "public"."Interview" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Admins can schedule interviews" ON "public"."Interview" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Admins can updated interviews" ON "public"."Interview" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Admins can view all interviews" ON "public"."Interview" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow admins to delete sectors" ON "public"."Sector" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow admins to do any operations" ON "public"."CheckIn" USING (true);



CREATE POLICY "Allow admins to insert sectors" ON "public"."Sector" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow admins to update sectors" ON "public"."Sector" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all inserts" ON "public"."EvaluationForm" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow delete rollback for anone" ON "public"."Registration" FOR DELETE USING (true);



CREATE POLICY "Allow event creation" ON "public"."Event" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow get for all users" ON "public"."EvaluationForm" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all on Sector" ON "public"."Sector" FOR SELECT USING (true);



CREATE POLICY "Allow rollback for anyone" ON "public"."ProofImage" FOR DELETE USING (true);



ALTER TABLE "public"."Application" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ApplicationMember" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Authenticated delete Networks" ON "public"."Networks" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated insert Networks" ON "public"."Networks" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated update Networks" ON "public"."Networks" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."BusinessMember" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."CheckIn" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Delete evaluation" ON "public"."EvaluationForm" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable Update for admins only" ON "public"."ProofImage" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable admins to update data" ON "public"."Participant" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."Application" TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users" ON "public"."Event" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert access for all users" ON "public"."Event" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."Participant" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."ProofImage" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."Registration" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."SponsoredRegistration" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for everyone" ON "public"."ApplicationMember" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for everyone" ON "public"."Event" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."BusinessMember" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."Participant" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."ProofImage" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."SponsoredRegistration" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for anonymous" ON "public"."Registration" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."ApplicationMember" FOR SELECT USING (true);



CREATE POLICY "Enable read access for everyone" ON "public"."Event" FOR SELECT USING (true);



CREATE POLICY "Enable to approve application" ON "public"."BusinessMember" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable to revoke member's membership" ON "public"."BusinessMember" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable to update member's details" ON "public"."BusinessMember" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for admins" ON "public"."Registration" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."ApplicationMember" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."EvaluationForm" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Event" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Event admin can delete sponsored registrations" ON "public"."SponsoredRegistration" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Event" "e"
  WHERE ("e"."eventId" = "SponsoredRegistration"."eventId"))));



CREATE POLICY "Event admin can update sponsored registrations" ON "public"."SponsoredRegistration" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."Event" "e"
  WHERE ("e"."eventId" = "SponsoredRegistration"."eventId")))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."Event" "e"
  WHERE ("e"."eventId" = "SponsoredRegistration"."eventId"))));



ALTER TABLE "public"."EventDay" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Interview" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Networks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Participant" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ProofImage" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Public read Networks" ON "public"."Networks" FOR SELECT USING (true);



ALTER TABLE "public"."Registration" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Sector" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."SponsoredRegistration" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Update only auth" ON "public"."Event" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Website content is readable by everyone" ON "public"."WebsiteContent" FOR SELECT TO "authenticated", "anon" USING (("isActive" = true));



CREATE POLICY "Website content is writable by authenticated users" ON "public"."WebsiteContent" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."WebsiteContent" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "allow operations for admins" ON "public"."EventDay" TO "authenticated" USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































































































































GRANT ALL ON FUNCTION "public"."approve_membership_application"("p_application_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_membership_application"("p_application_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_membership_application"("p_application_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."approve_membership_renewal_application"("p_application_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."approve_membership_renewal_application"("p_application_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_membership_renewal_application"("p_application_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_membership_renewal_application"("p_application_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."approve_membership_update_application"("p_application_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."approve_membership_update_application"("p_application_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_membership_update_application"("p_application_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_membership_update_application"("p_application_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_application_status"("p_application_identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_application_status"("p_application_identifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_application_status"("p_application_identifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_member_exists"("p_identifier" "text", "p_application_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_member_exists"("p_identifier" "text", "p_application_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_member_exists"("p_identifier" "text", "p_application_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_member_exists_and_get"("p_identifier" "text", "p_application_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_member_exists_and_get"("p_identifier" "text", "p_application_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_member_exists_and_get"("p_identifier" "text", "p_application_type" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."check_membership_expiry"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_membership_expiry"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_membership_expiry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_membership_expiry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."compute_primary_application_id"("p_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."compute_primary_application_id"("p_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."compute_primary_application_id"("p_member_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_sponsored_registration"("p_event_id" "uuid", "p_sponsored_by" "text", "p_fee_deduction" numeric, "p_max_sponsored_guests" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_evaluation"("eval_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_evaluation"("eval_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_evaluation"("eval_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_sr"("p_sponsored_registration_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_sr"("p_sponsored_registration_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_sr"("p_sponsored_registration_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_member_identifier"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_member_identifier"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_member_identifier"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_evaluations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_evaluations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_evaluations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_sponsored_registrations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_sponsored_registrations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_sponsored_registrations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_sponsored_registrations_with_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_sponsored_registrations_with_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_sponsored_registrations_with_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_application_history"("p_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_application_history"("p_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_application_history"("p_member_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_evaluation_by_id"("eval_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_evaluation_by_id"("eval_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_evaluation_by_id"("eval_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_evaluations_by_event"("event_id" "uuid", "completed_only" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_evaluations_by_event"("event_id" "uuid", "completed_only" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_evaluations_by_event"("event_id" "uuid", "completed_only" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_participant_list"("p_event_id" "uuid", "p_search_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_event_status"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_status"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_status"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_events_for_select"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_events_for_select"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_events_for_select"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_member_primary_application"("p_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_member_primary_application"("p_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_member_primary_application"("p_member_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus") TO "anon";
GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_registration_list"("p_event_id" "uuid", "p_search_text" "text", "p_payment_proof_status" "public"."PaymentProofStatus") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_registration_list_stats"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_registration_list_stats"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_registration_list_stats"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."SponsoredRegistration" TO "anon";
GRANT ALL ON TABLE "public"."SponsoredRegistration" TO "authenticated";
GRANT ALL ON TABLE "public"."SponsoredRegistration" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sponsored_registration_by_id"("registration_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sponsored_registration_by_id"("registration_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sponsored_registration_by_id"("registration_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sponsored_registration_by_uuid"("p_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sponsored_registration_by_uuid"("p_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sponsored_registration_by_uuid"("p_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sponsored_registrations_with_details"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sponsored_registrations_with_details"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sponsored_registrations_with_details"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sr_by_event_id"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sr_by_event_id"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sr_by_event_id"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_event_days"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_event_days"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_event_days"() TO "service_role";



GRANT ALL ON FUNCTION "public"."import_event_registrations"("p_event_id" "uuid", "p_rows" "jsonb", "p_dry_run" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."import_event_registrations"("p_event_id" "uuid", "p_rows" "jsonb", "p_dry_run" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."import_event_registrations"("p_event_id" "uuid", "p_rows" "jsonb", "p_dry_run" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."january_first_reset"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."january_first_reset"() TO "anon";
GRANT ALL ON FUNCTION "public"."january_first_reset"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."january_first_reset"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."process_membership_statuses"("p_reference_time" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."process_membership_statuses"("p_reference_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_membership_statuses"("p_reference_time" timestamp with time zone) TO "service_role";
GRANT ALL ON FUNCTION "public"."process_membership_statuses"("p_reference_time" timestamp with time zone) TO "anon";



GRANT ALL ON FUNCTION "public"."publish_event"("p_event_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."publish_event"("p_event_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."publish_event"("p_event_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."quick_onsite_registration"("p_event_day_id" "uuid", "p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_registrant" "jsonb", "p_remark" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."schedule_interviews_batch"("p_interview_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."schedule_interviews_batch"("p_interview_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schedule_interviews_batch"("p_interview_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_membership_expiry"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_membership_expiry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_membership_expiry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_evaluation_form"("p_event_id" "uuid", "p_name" "text", "p_q1_rating" "public"."ratingScale", "p_q2_rating" "public"."ratingScale", "p_q3_rating" "public"."ratingScale", "p_q4_rating" "public"."ratingScale", "p_q5_rating" "public"."ratingScale", "p_q6_rating" "public"."ratingScale", "p_additional_comments" "text", "p_feedback" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_evaluation_form"("p_event_id" "uuid", "p_name" "text", "p_q1_rating" "public"."ratingScale", "p_q2_rating" "public"."ratingScale", "p_q3_rating" "public"."ratingScale", "p_q4_rating" "public"."ratingScale", "p_q5_rating" "public"."ratingScale", "p_q6_rating" "public"."ratingScale", "p_additional_comments" "text", "p_feedback" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_evaluation_form"("p_event_id" "uuid", "p_name" "text", "p_q1_rating" "public"."ratingScale", "p_q2_rating" "public"."ratingScale", "p_q3_rating" "public"."ratingScale", "p_q4_rating" "public"."ratingScale", "p_q5_rating" "public"."ratingScale", "p_q6_rating" "public"."ratingScale", "p_additional_comments" "text", "p_feedback" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_note" "text", "p_other_participants" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_note" "text", "p_other_participants" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_event_registration"("p_event_id" "uuid", "p_member_type" "text", "p_identifier" "text", "p_business_member_id" "uuid", "p_non_member_name" "text", "p_payment_method" "text", "p_payment_path" "text", "p_registrant" "jsonb", "p_note" "text", "p_other_participants" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_membership_application"("p_application_type" "text", "p_company_details" "jsonb", "p_representatives" "jsonb", "p_payment_method" "text", "p_application_member_type" "text", "p_payment_proof_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_sr_status"("p_sponsored_registration_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_sr_status"("p_sponsored_registration_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_sr_status"("p_sponsored_registration_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_available_slots_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_available_slots_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_available_slots_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_event_poster" "text", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone, "p_venue" "text", "p_event_type" "text", "p_registration_fee" real, "p_facebook_link" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_event_poster" "text", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone, "p_venue" "text", "p_event_type" "text", "p_registration_fee" real, "p_facebook_link" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_details"("p_event_id" "uuid", "p_title" "text", "p_description" "text", "p_event_header_url" "text", "p_event_poster" "text", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone, "p_venue" "text", "p_event_type" "text", "p_registration_fee" real, "p_facebook_link" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_published_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_published_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_published_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_member_with_representatives"("p_member_id" "uuid", "p_application_id" "uuid", "p_business_name" "text", "p_sector_id" integer, "p_company_address" "text", "p_email_address" "text", "p_landline" "text", "p_mobile_number" "text", "p_website_url" "text", "p_membership_status" "public"."MembershipStatus", "p_join_date" "date", "p_membership_expiry_date" "date", "p_representatives" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_member_with_representatives"("p_member_id" "uuid", "p_application_id" "uuid", "p_business_name" "text", "p_sector_id" integer, "p_company_address" "text", "p_email_address" "text", "p_landline" "text", "p_mobile_number" "text", "p_website_url" "text", "p_membership_status" "public"."MembershipStatus", "p_join_date" "date", "p_membership_expiry_date" "date", "p_representatives" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_member_with_representatives"("p_member_id" "uuid", "p_application_id" "uuid", "p_business_name" "text", "p_sector_id" integer, "p_company_address" "text", "p_email_address" "text", "p_landline" "text", "p_mobile_number" "text", "p_website_url" "text", "p_membership_status" "public"."MembershipStatus", "p_join_date" "date", "p_membership_expiry_date" "date", "p_representatives" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_participant_count_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_participant_count_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_participant_count_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_primary_application_for_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_primary_application_for_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_primary_application_for_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count_from_participant"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count_from_participant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count_from_participant"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count_from_registration"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count_from_registration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sponsored_registration_used_count_from_registration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_website_content_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_website_content_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_website_content_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."WebsiteContent" TO "anon";
GRANT ALL ON TABLE "public"."WebsiteContent" TO "authenticated";
GRANT ALL ON TABLE "public"."WebsiteContent" TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_website_content"("p_section" "public"."WebsiteContentSection", "p_entry_key" "text", "p_text_type" "public"."WebsiteContentTextType", "p_text_value" "text", "p_icon" "text", "p_image_url" "text", "p_group" "text", "p_card_placement" integer, "p_is_active" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_website_content"("p_section" "public"."WebsiteContentSection", "p_entry_key" "text", "p_text_type" "public"."WebsiteContentTextType", "p_text_value" "text", "p_icon" "text", "p_image_url" "text", "p_group" "text", "p_card_placement" integer, "p_is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_website_content"("p_section" "public"."WebsiteContentSection", "p_entry_key" "text", "p_text_type" "public"."WebsiteContentTextType", "p_text_value" "text", "p_icon" "text", "p_image_url" "text", "p_group" "text", "p_card_placement" integer, "p_is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_website_content"("p_section" "public"."WebsiteContentSection", "p_entry_key" "text", "p_text_type" "public"."WebsiteContentTextType", "p_text_value" "text", "p_icon" "text", "p_image_url" "text", "p_group" "text", "p_card_placement" integer, "p_is_active" boolean) TO "service_role";
























GRANT ALL ON TABLE "public"."Application" TO "anon";
GRANT ALL ON TABLE "public"."Application" TO "authenticated";
GRANT ALL ON TABLE "public"."Application" TO "service_role";



GRANT ALL ON TABLE "public"."ApplicationMember" TO "anon";
GRANT ALL ON TABLE "public"."ApplicationMember" TO "authenticated";
GRANT ALL ON TABLE "public"."ApplicationMember" TO "service_role";



GRANT ALL ON TABLE "public"."BusinessMember" TO "anon";
GRANT ALL ON TABLE "public"."BusinessMember" TO "authenticated";
GRANT ALL ON TABLE "public"."BusinessMember" TO "service_role";



GRANT ALL ON TABLE "public"."CheckIn" TO "anon";
GRANT ALL ON TABLE "public"."CheckIn" TO "authenticated";
GRANT ALL ON TABLE "public"."CheckIn" TO "service_role";



GRANT ALL ON TABLE "public"."EvaluationForm" TO "anon";
GRANT ALL ON TABLE "public"."EvaluationForm" TO "authenticated";
GRANT ALL ON TABLE "public"."EvaluationForm" TO "service_role";



GRANT ALL ON TABLE "public"."Event" TO "anon";
GRANT ALL ON TABLE "public"."Event" TO "authenticated";
GRANT ALL ON TABLE "public"."Event" TO "service_role";



GRANT ALL ON TABLE "public"."EventDay" TO "anon";
GRANT ALL ON TABLE "public"."EventDay" TO "authenticated";
GRANT ALL ON TABLE "public"."EventDay" TO "service_role";



GRANT ALL ON TABLE "public"."Interview" TO "anon";
GRANT ALL ON TABLE "public"."Interview" TO "authenticated";
GRANT ALL ON TABLE "public"."Interview" TO "service_role";



GRANT ALL ON TABLE "public"."Networks" TO "anon";
GRANT ALL ON TABLE "public"."Networks" TO "authenticated";
GRANT ALL ON TABLE "public"."Networks" TO "service_role";



GRANT ALL ON TABLE "public"."Participant" TO "anon";
GRANT ALL ON TABLE "public"."Participant" TO "authenticated";
GRANT ALL ON TABLE "public"."Participant" TO "service_role";



GRANT ALL ON TABLE "public"."ProofImage" TO "anon";
GRANT ALL ON TABLE "public"."ProofImage" TO "authenticated";
GRANT ALL ON TABLE "public"."ProofImage" TO "service_role";



GRANT ALL ON TABLE "public"."Registration" TO "anon";
GRANT ALL ON TABLE "public"."Registration" TO "authenticated";
GRANT ALL ON TABLE "public"."Registration" TO "service_role";



GRANT ALL ON TABLE "public"."Sector" TO "anon";
GRANT ALL ON TABLE "public"."Sector" TO "authenticated";
GRANT ALL ON TABLE "public"."Sector" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Sector_sectorId_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Sector_sectorId_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Sector_sectorId_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

drop policy "Enable insert for all users" on "public"."Participant";

drop policy "Enable read access for all users" on "public"."Participant";

drop policy "Website content is readable by everyone" on "public"."WebsiteContent";


  create policy "Enable insert for all users"
  on "public"."Participant"
  as permissive
  for insert
  to anon, authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."Participant"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Website content is readable by everyone"
  on "public"."WebsiteContent"
  as permissive
  for select
  to anon, authenticated
using (("isActive" = true));



  create policy "Admins can delete network logos"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'network-logos'::text));



  create policy "Admins can update network logos"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'network-logos'::text))
with check ((bucket_id = 'network-logos'::text));



  create policy "Admins can upload network logos"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'network-logos'::text));



  create policy "All can read 1aozmya_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'heroimages'::text));



  create policy "Allow all operations for anyone 11d98ol_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon, authenticated
with check ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_1"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_2"
  on "storage"."objects"
  as permissive
  for delete
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_3"
  on "storage"."objects"
  as permissive
  for update
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Authenticated can manage 1aozmya_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'heroimages'::text));



  create policy "Authenticated can manage 1aozmya_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'heroimages'::text));



  create policy "Authenticated can manage 1aozmya_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'heroimages'::text));



  create policy "Give anon users access to images in folder 19dgg40_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using (((bucket_id = 'logoimage'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));



  create policy "Network logos are publicly readable"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'network-logos'::text));



  create policy "allow admins to do operations jqdsdq_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'headerimage'::text));



  create policy "allow admins to do operations jqdsdq_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'headerimage'::text));



  create policy "allow admins to do operations jqdsdq_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'headerimage'::text));



  create policy "allow admins to do operations jqdsdq_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'headerimage'::text));



  create policy "allow all operations for admins 19dgg40_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'logoimage'::text));



  create policy "allow all operations for admins 19dgg40_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'logoimage'::text));



  create policy "allow all operations for admins 19dgg40_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'logoimage'::text));



  create policy "allow all operations for admins 19dgg40_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'logoimage'::text));



  create policy "insert for all 19dgg40_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'logoimage'::text));



  create policy "personalimage_delete_authenticated"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'personalimage'::text));



  create policy "personalimage_insert_authenticated"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'personalimage'::text));



  create policy "personalimage_select_authenticated"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'personalimage'::text));



  create policy "personalimage_update_authenticated"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'personalimage'::text))
with check ((bucket_id = 'personalimage'::text));



