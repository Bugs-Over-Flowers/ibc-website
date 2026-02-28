CREATE OR REPLACE FUNCTION "public"."get_application_history"(
  p_member_id uuid
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_business_name text;
  v_applications jsonb;
BEGIN
  -- Get business name
  SELECT "businessName" INTO v_business_name
  FROM "BusinessMember"
  WHERE "businessMemberId" = p_member_id;

  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'Business member not found';
  END IF;

  -- Get all applications for this member with related data
  SELECT COALESCE(jsonb_agg(
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
      'sectorName', COALESCE(s."sectorName", 'N/A'),
      'members', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'applicationMemberId', am."applicationMemberId",
            'firstName', am."firstName",
            'lastName', am."lastName",
            'companyDesignation', am."companyDesignation",
            'companyMemberType', am."companyMemberType",
            'emailAddress', am."emailAddress"
          )
        ), '[]'::jsonb)
        FROM "ApplicationMember" am
        WHERE am."applicationId" = a."applicationId"
      )
    ) ORDER BY a."applicationDate" DESC
  ), '[]'::jsonb)
  INTO v_applications
  FROM "Application" a
  LEFT JOIN "Sector" s ON a."sectorId" = s."sectorId"
  WHERE a."businessMemberId" = p_member_id;

  v_result := jsonb_build_object(
    'businessName', v_business_name,
    'applications', v_applications
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to fetch application history: %', SQLERRM;
END;
$$;

ALTER FUNCTION "public"."get_application_history"("p_member_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_application_history"("p_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_application_history"("p_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_application_history"("p_member_id" "uuid") TO "service_role";
