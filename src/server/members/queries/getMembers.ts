import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { signLogoUrl } from "@/lib/storage/signedUrls";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";
import type { MemberFilterInput } from "@/lib/validation/application/application";

type MemberWithSector =
  Database["public"]["Tables"]["BusinessMember"]["Row"] & {
    Sector: Database["public"]["Tables"]["Sector"]["Row"];
    Application: Array<{
      applicationId: string;
      applicationStatus: string;
    }>;
  };

export async function getMembers(
  requestCookies: RequestCookie[],
  filters?: MemberFilterInput,
) {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.members.all);
  cacheTag(CACHE_TAGS.members.admin);

  const supabase = await createClient(requestCookies);

  let query = supabase
    .from("BusinessMember")
    .select(
      `
      *,
      Sector!inner(sectorId, sectorName),
      Application(applicationId, applicationStatus)
    `,
    )
    .neq("Application.applicationStatus", "rejected")
    .order("joinDate", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("membershipStatus", filters.status);
  }

  if (filters?.sectorName) {
    query = query.eq("Sector.sectorName", filters.sectorName);
  }

  if (filters?.search) {
    query = query.ilike("businessName", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch members: ${error.message}`);
  }

  const membersWithSignedLogos: MemberWithSector[] = await Promise.all(
    data.map(async (member) => {
      const { Application, ...memberWithoutApplication } = member;
      const todayDate = new Date().toISOString().slice(0, 10);
      const normalizedFeaturedExpirationDate =
        member.featuredExpirationDate &&
        member.featuredExpirationDate >= todayDate
          ? member.featuredExpirationDate
          : null;

      return {
        ...memberWithoutApplication,
        featuredExpirationDate: normalizedFeaturedExpirationDate,
        logoImageURL: await signLogoUrl(supabase, member.logoImageURL),
        primaryApplicationId: member.primaryApplicationId,
        Application: Application ?? null,
      };
    }),
  );

  return membersWithSignedLogos;
}

export async function getSectors(requestCookies: RequestCookie[]) {
  "use cache";
  applyAdmin5mCache();
  cacheTag(CACHE_TAGS.sectors.all);

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Sector")
    .select("*")
    .order("sectorName", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sectors: ${error.message}`);
  }

  return data;
}
