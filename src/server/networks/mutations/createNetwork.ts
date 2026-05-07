"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  type CreateNetworkInput,
  createNetworkSchema,
} from "@/lib/validation/network/network";
import {
  mapNetworkRow,
  type Network,
  type NetworkInsert,
} from "@/server/networks/types";

export async function createNetwork(
  input: CreateNetworkInput,
): Promise<Network> {
  const parsed = createNetworkSchema.parse(input);

  const payload: NetworkInsert = {
    organization: parsed.organization,
    about: parsed.about,
    location_type: parsed.locationType,
    representative_name: parsed.representativeName,
    representative_position: parsed.representativePosition,
    logo_url: parsed.logoUrl,
  };

  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("Networks")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create network: ${error.message}`);
  }

  updateTag(CACHE_TAGS.networks.all);
  updateTag(CACHE_TAGS.networks.admin);
  updateTag(CACHE_TAGS.networks.public);
  revalidatePath("/admin/networks", "page");
  revalidatePath("/networks", "page");

  return mapNetworkRow(data);
}
