set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_primary_application_for_member()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$;

DROP TRIGGER IF EXISTS "on_application_sync_primary" ON public."Application";

CREATE TRIGGER "on_application_sync_primary"
AFTER UPDATE OF "applicationStatus", "businessMemberId" ON public."Application"
FOR EACH ROW
EXECUTE FUNCTION public.update_primary_application_for_member();

UPDATE public."BusinessMember" bm
SET "primaryApplicationId" = approved_update."applicationId"
FROM (
  SELECT DISTINCT ON (a."businessMemberId")
    a."businessMemberId",
    a."applicationId"
  FROM public."Application" a
  WHERE a."applicationType" = 'updating'::"ApplicationType"
    AND a."applicationStatus" = 'approved'::"ApplicationStatus"
    AND a."businessMemberId" IS NOT NULL
  ORDER BY a."businessMemberId", a."applicationDate" DESC
) AS approved_update
WHERE bm."businessMemberId" = approved_update."businessMemberId"
  AND (
    bm."primaryApplicationId" IS NULL
    OR EXISTS (
      SELECT 1
      FROM public."Application" current_app
      WHERE current_app."applicationId" = bm."primaryApplicationId"
        AND current_app."applicationType" = 'updating'::"ApplicationType"
        AND current_app."applicationStatus" <> 'approved'::"ApplicationStatus"
    )
  );
