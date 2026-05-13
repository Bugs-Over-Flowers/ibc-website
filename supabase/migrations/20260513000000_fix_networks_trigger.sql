-- Fix: update_updated_at_column() was referencing snake_case "updated_at"
-- but the Networks table now uses camelCase "updatedAt".
-- This updates the trigger function to use the correct column name.
DROP TRIGGER IF EXISTS "set_networks_updated_at" ON "public"."Networks";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new."updatedAt" = now();
  return new;
end;
$function$
;

CREATE TRIGGER "set_networks_updated_at"
BEFORE UPDATE ON "public"."Networks"
FOR EACH ROW
EXECUTE FUNCTION "public"."update_updated_at_column"();
