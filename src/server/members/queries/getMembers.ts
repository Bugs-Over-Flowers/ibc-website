import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyAdmin5mCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";
import type { MemberFilterInput } from "@/lib/validation/application/application";

export async function getMembers(
  requestCookies: RequestCookie[],
  filters?: MemberFilterInput,
) {
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

  type MemberWithSector =
    Database["public"]["Tables"]["BusinessMember"]["Row"] & {
      Sector: Database["public"]["Tables"]["Sector"]["Row"];
      Application: Array<{
        applicationId: string;
        applicationStatus: string;
      }> | null;
    };

  const signLogoUrl = async (path: string | null) => {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const { data: signed, error } = await supabase.storage
      .from("logoimage")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

  const membersWithSignedLogos = await Promise.all(
    (data as MemberWithSector[]).map(async (member: MemberWithSector) => {
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
        logoImageURL: await signLogoUrl(member.logoImageURL),
        primaryApplicationId: member.primaryApplicationId,
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
