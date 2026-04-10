"use server";

import { createActionClient } from "@/lib/supabase/server";
import type { UpsertWebsiteContentRowInput } from "../types";

export async function upsertWebsiteContentRow(
  input: UpsertWebsiteContentRowInput,
) {
  const supabase = await createActionClient();

  const { error } = await (supabase as any).rpc("upsert_website_content", {
    p_section: input.section,
    p_entry_key: input.entryKey,
    p_text_type: input.textType,
    p_text_value: input.textValue ?? null,
    p_icon: input.icon ?? null,
    p_image_url: input.imageUrl ?? null,
    p_card_placement: input.cardPlacement ?? null,
    p_is_active: true,
  });

  if (error) {
    throw new Error(`Failed to save content: ${error.message}`);
  }
}
