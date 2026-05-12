"use server";

import { removePersonalImages } from "@/lib/storage/personalImage";
import { createActionClient } from "@/lib/supabase/server";
import type { WebsiteContentSection } from "../types";

export async function deleteWebsiteContentEntriesBySection(
  section: WebsiteContentSection,
  retainedEntryKeys: string[],
) {
  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("WebsiteContent")
    .select("entryKey, imageUrl")
    .eq("section", section)
    .eq("isActive", true);

  if (error) {
    throw new Error(
      `Failed to check existing website content rows: ${error.message}`,
    );
  }

  const retained = new Set(retainedEntryKeys);
  const rowsToDelete = (data ?? []).filter(
    (row) => row.entryKey && !retained.has(row.entryKey),
  );

  const entryKeysToDelete = Array.from(
    new Set(rowsToDelete.map((row) => row.entryKey).filter(Boolean)),
  );

  if (entryKeysToDelete.length === 0) {
    return;
  }

  const imageUrls = rowsToDelete
    .map((row) => row.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  if (imageUrls.length > 0) {
    const { error: storageError } = await removePersonalImages(
      supabase,
      imageUrls,
    );

    if (storageError) {
      console.error(
        "[deleteWebsiteContentEntriesBySection] Storage removal failed:",
        storageError.message,
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("WebsiteContent")
    .update({ isActive: false })
    .eq("section", section)
    .eq("isActive", true)
    .in("entryKey", entryKeysToDelete);

  if (deleteError) {
    throw new Error(
      `Failed to delete removed website content rows: ${deleteError.message}`,
    );
  }
}
