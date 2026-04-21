"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

const networkIdSchema = z.uuid("Invalid network ID");

export async function deleteNetwork(
  networkId: string,
): Promise<{ id: string }> {
  const parsedId = networkIdSchema.parse(networkId);
  const supabase = await createActionClient();

  const { error } = await supabase.from("Networks").delete().eq("id", parsedId);

  if (error) {
    throw new Error(`Failed to delete network: ${error.message}`);
  }

  updateTag(CACHE_TAGS.networks.all);
  updateTag(CACHE_TAGS.networks.admin);
  updateTag(CACHE_TAGS.networks.public);
  revalidatePath("/admin/networks", "page");
  revalidatePath("/networks", "page");

  return { id: parsedId };
}
