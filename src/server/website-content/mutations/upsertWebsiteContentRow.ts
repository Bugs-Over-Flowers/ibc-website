"use server";

import { createActionClient } from "@/lib/supabase/server";
import type { UpsertWebsiteContentRowInput } from "../types";

type WebsiteContentSupabaseClient = Awaited<
  ReturnType<typeof createActionClient>
>;

async function executeUpsertWebsiteContentRow(
  supabase: WebsiteContentSupabaseClient,
  input: UpsertWebsiteContentRowInput,
) {
  const { error } = await supabase.rpc("upsert_website_content", {
    p_section: input.section,
    p_entry_key: input.entryKey,
    p_text_type: input.textType,
    p_text_value: input.textValue ?? undefined,
    p_icon: input.icon ?? undefined,
    p_image_url: input.imageUrl ?? undefined,
    p_card_placement: input.cardPlacement ?? undefined,
    p_group: input.group ?? undefined,
    p_is_active: true,
  });

  if (error) {
    throw new Error(`Failed to save content: ${error.message}`);
  }
}

export async function upsertWebsiteContentRow(
  input: UpsertWebsiteContentRowInput,
  supabaseClient?: WebsiteContentSupabaseClient,
) {
  const supabase = supabaseClient ?? (await createActionClient());

  await executeUpsertWebsiteContentRow(supabase, input);
}

export async function upsertWebsiteContentRows(
  inputs: UpsertWebsiteContentRowInput[],
) {
  if (inputs.length === 0) {
    return;
  }

  const supabase = await createActionClient();

  await Promise.all(
    inputs.map((input) => executeUpsertWebsiteContentRow(supabase, input)),
  );
}
