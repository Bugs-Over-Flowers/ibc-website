-- RPC function to approve applications and create BusinessMember records atomically.

CREATE OR REPLACE FUNCTION "public"."approve_membership_application"(
  p_application_id uuid
)
RETURNS TABLE(
  "business_member_id" uuid,
  "message" text
) AS $$
DECLARE
  v_application record;
  v_member_id uuid;
BEGIN
  SELECT *
  INTO v_application
  FROM "public"."Application"
  WHERE "applicationId" = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application."businessMemberId" IS NOT NULL THEN
    RAISE EXCEPTION 'Application has already been approved';
  END IF;

  IF v_application."sectorId" IS NULL THEN
    RAISE EXCEPTION 'Sector ID is required to approve application';
  END IF;

  INSERT INTO "public"."BusinessMember" (
    "businessName",
    "sectorId",
    "websiteURL",
    "logoImageURL",
    "joinDate",
    "primaryApplicationId"
  )
  VALUES (
    v_application."companyName",
    v_application."sectorId",
    COALESCE(v_application."websiteURL", ''),
    v_application."logoImageURL",
    CURRENT_DATE,
    v_application."applicationId"
  )
  RETURNING "businessMemberId" INTO v_member_id;

  UPDATE "public"."Application"
  SET
    "businessMemberId" = v_member_id,
    "applicationStatus" = 'approved'
  WHERE "applicationId" = p_application_id;

  RETURN QUERY
    SELECT v_member_id, 'Application approved successfully';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION "public"."approve_membership_application"(uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."approve_membership_application"(uuid) TO "service_role";
