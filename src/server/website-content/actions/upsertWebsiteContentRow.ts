"use server";

import { createActionClient } from "@/lib/supabase/server";
import type { UpsertWebsiteContentRowInput } from "../types";

export async function upsertWebsiteContentRow(
  input: UpsertWebsiteContentRowInput,
) {
  const supabase = await createActionClient();

  const { error } = await supabase.rpc("upsert_website_content", {
    p_section: input.section,
    p_entry_key: input.entryKey,
    p_text_type: input.textType,
    p_text_value: input.textValue ?? undefined,
    p_icon: input.icon ?? undefined,
    p_image_url: input.imageUrl ?? undefined,
    p_card_placement: input.cardPlacement ?? undefined,
    p_is_active: true,
  });

  if (error) {
    throw new Error(`Failed to save content: ${error.message}`);
  }
}
