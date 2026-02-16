-- Migration: Add encrypted identifier support with lookup hash for BusinessMember
-- This enables searchable encryption for member identifiers

-- 1. Add identifier lookup hash column
ALTER TABLE "public"."BusinessMember"
ADD COLUMN IF NOT EXISTS "identifierLookupHash" text;

-- 2. Create index for fast hash lookups
CREATE INDEX IF NOT EXISTS "BusinessMember_identifierLookupHash_idx" 
ON "public"."BusinessMember" USING "btree" ("identifierLookupHash");

-- 3. Drop and recreate check_member_exists functions to use lookup hash

-- Drop old functions first
DROP FUNCTION IF EXISTS public.check_member_exists(text);
DROP FUNCTION IF EXISTS public.check_member_exists(text, text);

-- Create new function with two parameters (for updating/renewal)
CREATE OR REPLACE FUNCTION public.check_member_exists(
  p_lookup_hash text,
  p_application_type text DEFAULT 'renewal'::text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_member_exists boolean;
  v_member_info jsonb;
BEGIN
  IF p_lookup_hash IS NULL OR p_lookup_hash = '' THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Member ID is required');
  END IF;

  -- For updating, member must not be cancelled
  -- For renewal, any status is allowed
  IF p_application_type = 'updating' THEN
    SELECT EXISTS(
      SELECT 1 FROM "BusinessMember"
      WHERE "identifierLookupHash" = p_lookup_hash
        AND "membershipStatus" != 'cancelled'
    ) INTO v_member_exists;
  ELSE
    -- Renewal allows any status
    SELECT EXISTS(
      SELECT 1 FROM "BusinessMember"
      WHERE "identifierLookupHash" = p_lookup_hash
    ) INTO v_member_exists;
  END IF;

  IF v_member_exists THEN
    SELECT jsonb_build_object(
      'exists', true,
      'companyName', "businessName",
      'membershipStatus', "membershipStatus",
      'businessMemberId', "businessMemberId"
    ) INTO v_member_info
    FROM "BusinessMember" WHERE "identifierLookupHash" = p_lookup_hash;
    RETURN v_member_info;
  ELSE
    IF p_application_type = 'updating' THEN
      RETURN jsonb_build_object('exists', false, 'message', 'Member ID not found or membership is cancelled. Cancelled members must renew first.');
    ELSE
      RETURN jsonb_build_object('exists', false, 'message', 'Member ID not found');
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Unable to validate member ID at this time');
END;
$function$;

-- Create single-parameter version for backward compatibility (defaults to renewal)
CREATE OR REPLACE FUNCTION public.check_member_exists(p_lookup_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_member_exists boolean;
  v_member_info jsonb;
BEGIN
  IF p_lookup_hash IS NULL OR p_lookup_hash = '' THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Member ID is required');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM "BusinessMember"
    WHERE "identifierLookupHash" = p_lookup_hash
  ) INTO v_member_exists;

  IF v_member_exists THEN
    SELECT jsonb_build_object(
      'exists', true,
      'companyName', "businessName",
      'membershipStatus', "membershipStatus",
      'businessMemberId', "businessMemberId"
    ) INTO v_member_info
    FROM "BusinessMember" WHERE "identifierLookupHash" = p_lookup_hash;
    RETURN v_member_info;
  ELSE
    RETURN jsonb_build_object('exists', false, 'message', 'Member ID not found');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('exists', false, 'message', 'Unable to validate member ID at this time');
END;
$function$;

-- Add comments for documentation
COMMENT ON FUNCTION public.check_member_exists(text, text) IS
'Validates if a business member exists by lookup hash.
Accepts lookup hash (HMAC-SHA256 of identifier) and application type.
Used during renewal and update applications to verify member identity.
Security: DEFINER rights ensure consistent access regardless of caller permissions.';

COMMENT ON FUNCTION public.check_member_exists(text) IS
'Validates if a business member exists by lookup hash (defaults to renewal type).
Accepts lookup hash (HMAC-SHA256 of identifier).
Security: DEFINER rights ensure consistent access regardless of caller permissions.';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_member_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_member_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_member_exists(text) TO service_role;

GRANT EXECUTE ON FUNCTION public.check_member_exists(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_member_exists(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_member_exists(text, text) TO service_role;
