-- Function to check if a business member exists by member ID
-- Used for validating member IDs during renewal and update applications
CREATE OR REPLACE FUNCTION check_member_exists(
  p_business_member_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_member_exists boolean;
  v_member_info jsonb;
BEGIN
  -- Check if member exists and is active
  SELECT EXISTS(
    SELECT 1 
    FROM "BusinessMember" 
    WHERE "businessMemberId" = p_business_member_id
      AND "membershipStatus" != 'inactive'  -- Don't allow inactive members
  ) INTO v_member_exists;

  IF v_member_exists THEN
    -- Get basic member information for confirmation
    SELECT jsonb_build_object(
      'exists', true,
      'companyName', "companyName",
      'membershipStatus', "membershipStatus",
      'membershipType', "membershipType"
    ) INTO v_member_info
    FROM "BusinessMember"
    WHERE "businessMemberId" = p_business_member_id;
    
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
COMMENT ON FUNCTION check_member_exists IS 
'Validates if a business member ID exists and is active. Returns member existence status and basic info for confirmation.
Used during renewal and update applications to verify member identity.
Security: DEFINER rights ensure consistent access regardless of caller permissions.';