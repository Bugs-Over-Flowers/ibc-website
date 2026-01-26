-- Update check_member_exists function to use identifier instead of businessMemberId
-- This function is used during renewal and update applications to verify member identity

-- Drop the old function first
DROP FUNCTION IF EXISTS check_member_exists(uuid);

-- Create new function that checks by identifier (text format: ibc-mem-XXXXXXXX)
CREATE OR REPLACE FUNCTION check_member_exists(
  p_identifier text
) RETURNS jsonb AS $$
DECLARE
  v_member_exists boolean;
  v_member_info jsonb;
BEGIN
  -- Validate identifier format (should match ibc-mem-XXXXXXXX pattern)
  IF p_identifier IS NULL OR p_identifier = '' THEN
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Member ID is required'
    );
  END IF;

  -- Check if member exists and is active
  SELECT EXISTS(
    SELECT 1 
    FROM "BusinessMember" 
    WHERE "identifier" = p_identifier
      AND "membershipStatus" != 'inactive'  -- Don't allow inactive members
  ) INTO v_member_exists;

  IF v_member_exists THEN
    -- Get basic member information for confirmation
    SELECT jsonb_build_object(
      'exists', true,
      'companyName', "businessName",
      'membershipStatus', "membershipStatus",
      'businessMemberId', "businessMemberId"
    ) INTO v_member_info
    FROM "BusinessMember"
    WHERE "identifier" = p_identifier;
    
    RETURN v_member_info;
  ELSE
    -- Member doesn't exist or is inactive
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Member ID not found or account is inactive'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error without exposing internal details
    RETURN jsonb_build_object(
      'exists', false,
      'message', 'Unable to validate member ID at this time'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION check_member_exists(text) IS 
'Validates if a business member identifier exists and is active. 
Accepts identifier in format ibc-mem-XXXXXXXX.
Returns member existence status and basic info for confirmation.
Used during renewal and update applications to verify member identity.
Security: DEFINER rights ensure consistent access regardless of caller permissions.';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_member_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION check_member_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_member_exists(text) TO service_role;
