"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

export interface UpsertSectorResult {
  sectorId: number;
  created: boolean;
}

export async function upsertSector(
  sectorName: string,
): Promise<{ success: boolean; data?: UpsertSectorResult; error?: string }> {
  const trimmed = sectorName.trim();
  if (!trimmed) {
    return { success: false, error: "Sector name is required" };
  }

  const supabase = await createActionClient();

  // Case-insensitive search for existing sector
  const { data: existing, error: searchError } = await supabase
    .from("Sector")
    .select("sectorId")
    .ilike("sectorName", trimmed)
    .maybeSingle();

  if (searchError) {
    return { success: false, error: searchError.message };
  }

  if (existing) {
    return {
      success: true,
      data: { sectorId: existing.sectorId, created: false },
    };
  }

  // Insert new sector
  const { data: inserted, error: insertError } = await supabase
    .from("Sector")
    .insert({ sectorName: trimmed })
    .select("sectorId")
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  updateTag(CACHE_TAGS.sectors.all);

  return {
    success: true,
    data: { sectorId: inserted.sectorId, created: true },
  };
}
