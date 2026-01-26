-- Drop check-in related RPC functions while keeping the CheckIn table
-- Migration to remove checkin functionality for fresh restart

-- Revoke permissions first for get_event_checkin_list
REVOKE ALL ON FUNCTION "public"."get_event_checkin_list"("p_event_id" "uuid") FROM "anon";
REVOKE ALL ON FUNCTION "public"."get_event_checkin_list"("p_event_id" "uuid") FROM "authenticated";
REVOKE ALL ON FUNCTION "public"."get_event_checkin_list"("p_event_id" "uuid") FROM "service_role";

-- Revoke permissions for get_registration_list_checkin
REVOKE ALL ON FUNCTION "public"."get_registration_list_checkin"("p_identifier" "text", "p_today" "date") FROM "anon";
REVOKE ALL ON FUNCTION "public"."get_registration_list_checkin"("p_identifier" "text", "p_today" "date") FROM "authenticated";
REVOKE ALL ON FUNCTION "public"."get_registration_list_checkin"("p_identifier" "text", "p_today" "date") FROM "service_role";

-- Drop the functions
DROP FUNCTION IF EXISTS "public"."get_event_checkin_list"("p_event_id" "uuid");
DROP FUNCTION IF EXISTS "public"."get_registration_list_checkin"("p_identifier" "text", "p_today" "date");

-- Drop the custom return type if it exists
DROP TYPE IF EXISTS "public"."registration_details_result";
