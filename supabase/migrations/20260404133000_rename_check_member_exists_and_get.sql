DROP FUNCTION IF EXISTS public.check_member_exists_and_get(text, text);

CREATE OR REPLACE FUNCTION public.check_member_exists_and_get(
  p_identifier text,
  p_application_type text DEFAULT 'renewal'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member record;
  v_application record;
  v_principal record;
  v_alternate record;
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
    bm."membershipStatus",
    bm."sectorId",
    bm."websiteURL",
    bm."logoImageURL"
  INTO v_member
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

  SELECT
    a."applicationId",
    a."companyAddress",
    a."emailAddress",
    a."landline",
    a."mobileNumber",
    a."sectorId"
  INTO v_application
  FROM public."Application" a
  WHERE a."businessMemberId" = v_member."businessMemberId"
  ORDER BY a."applicationDate" DESC
  LIMIT 1;

  IF FOUND THEN
    SELECT
      am."firstName",
      am."lastName",
      am."emailAddress",
      am."mobileNumber",
      am."landline",
      am."mailingAddress",
      am."companyDesignation",
      am."birthdate",
      am."nationality",
      am."sex"
    INTO v_principal
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_application."applicationId"
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
      am."birthdate",
      am."nationality",
      am."sex"
    INTO v_alternate
    FROM public."ApplicationMember" am
    WHERE am."applicationId" = v_application."applicationId"
      AND am."companyMemberType" = 'alternate'
    LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'exists', true,
    'companyName', v_member."businessName",
    'membershipStatus', v_member."membershipStatus",
    'businessMemberIdentifier', v_member."identifier",
    'businessMemberId', v_member."businessMemberId",
    'companyAddress', COALESCE(v_application."companyAddress", ''),
    'emailAddress', COALESCE(v_application."emailAddress", ''),
    'landline', COALESCE(v_application."landline", ''),
    'mobileNumber', COALESCE(v_application."mobileNumber", ''),
    'websiteURL', COALESCE(v_member."websiteURL", ''),
    'logoImageURL', COALESCE(v_member."logoImageURL", ''),
    'sectorId', COALESCE(v_application."sectorId", v_member."sectorId"),
    'principalRepresentative',
      CASE
        WHEN v_principal IS NULL THEN NULL
        ELSE jsonb_build_object(
          'firstName', v_principal."firstName",
          'lastName', v_principal."lastName",
          'emailAddress', v_principal."emailAddress",
          'mobileNumber', v_principal."mobileNumber",
          'landline', v_principal."landline",
          'mailingAddress', v_principal."mailingAddress",
          'companyDesignation', v_principal."companyDesignation",
          'birthdate', v_principal."birthdate",
          'nationality', v_principal."nationality",
          'sex', v_principal."sex"
        )
      END,
    'alternateRepresentative',
      CASE
        WHEN v_alternate IS NULL THEN NULL
        ELSE jsonb_build_object(
          'firstName', v_alternate."firstName",
          'lastName', v_alternate."lastName",
          'emailAddress', v_alternate."emailAddress",
          'mobileNumber', v_alternate."mobileNumber",
          'landline', v_alternate."landline",
          'mailingAddress', v_alternate."mailingAddress",
          'companyDesignation', v_alternate."companyDesignation",
          'birthdate', v_alternate."birthdate",
          'nationality', v_alternate."nationality",
          'sex', v_alternate."sex"
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

GRANT EXECUTE ON FUNCTION public.check_member_exists_and_get(text, text)
TO anon, authenticated, service_role;
