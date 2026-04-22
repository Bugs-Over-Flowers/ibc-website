import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache, applyPublicHoursCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";
import { mapNetworkRow, type Network } from "@/server/networks/types";

type GetNetworksOptions = {
  scope?: "public" | "admin";
};

export async function getNetworks(
  requestCookies: RequestCookie[],
  options: GetNetworksOptions = {},
): Promise<Network[]> {
  "use cache";

  const scope = options.scope ?? "public";

  if (scope === "admin") {
    applyAdmin5mCache();
    cacheTag(CACHE_TAGS.networks.admin);
  } else {
    applyPublicHoursCache();
    cacheTag(CACHE_TAGS.networks.public);
  }

  cacheTag(CACHE_TAGS.networks.all);

  const supabase = await createClient(requestCookies);
  const { data, error } = await supabase
    .from("Networks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch networks: ${error.message}`);
  }

  return (data ?? []).map(mapNetworkRow);
}
