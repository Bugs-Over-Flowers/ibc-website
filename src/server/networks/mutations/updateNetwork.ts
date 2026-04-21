"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createAdminClient } from "@/lib/supabase/server";
import {
  type UpdateNetworkInput,
  updateNetworkSchema,
} from "@/lib/validation/network/network";
import {
  mapNetworkRow,
  type Network,
  type NetworkUpdate,
} from "@/server/networks/types";

const networkIdSchema = z.uuid("Invalid network ID");

export async function updateNetwork(
  networkId: string,
  input: UpdateNetworkInput,
): Promise<Network> {
  const parsedId = networkIdSchema.parse(networkId);
  const parsed = updateNetworkSchema.parse(input);

  const payload: NetworkUpdate = {
    organization: parsed.organization,
    about: parsed.about,
    location_type: parsed.locationType,
    representative_name: parsed.representativeName,
    representative_position: parsed.representativePosition,
    logo_url: parsed.logoUrl,
  };

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("Networks")
    .update(payload)
    .eq("id", parsedId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update network: ${error.message}`);
  }

  updateTag(CACHE_TAGS.networks.all);
  updateTag(CACHE_TAGS.networks.admin);
  updateTag(CACHE_TAGS.networks.public);
  revalidatePath("/admin/networks", "page");
  revalidatePath("/networks", "page");

  return mapNetworkRow(data);
}
