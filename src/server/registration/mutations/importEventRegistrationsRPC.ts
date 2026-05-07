"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  type ImportEventRegistrationsInput,
  ImportEventRegistrationsInputSchema,
  type ImportEventRegistrationsResult,
  ImportEventRegistrationsResultSchema,
} from "@/lib/validation/registration/importRegistrations";
import { invalidateRegistrationCaches } from "@/server/actions.utils";

export async function importEventRegistrationsRPC(
  input: ImportEventRegistrationsInput,
): Promise<ImportEventRegistrationsResult> {
  const parsedInput = ImportEventRegistrationsInputSchema.parse(input);

  const supabase = await createActionClient();

  const { data, error } = await supabase.rpc("import_event_registrations", {
    p_event_id: parsedInput.eventId,
    p_rows: parsedInput.rows,
    p_dry_run: parsedInput.dryRun,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message || "Failed to import registration data.");
  }

  const parsedResult = ImportEventRegistrationsResultSchema.parse(data);

  if (!parsedInput.dryRun) {
    invalidateRegistrationCaches();
    updateTag(CACHE_TAGS.checkIns.stats);
  }

  return parsedResult;
}
