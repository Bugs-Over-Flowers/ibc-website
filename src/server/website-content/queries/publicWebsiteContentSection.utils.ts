import "server-only";

import type { WebsiteContentSection } from "../types";

export type HeroSectionPage =
  | "about"
  | "events"
  | "members"
  | "networks"
  | "contact";

type HeroSectionCard = {
  entryKey: string;
  group: string | null;
  imageUrl: string;
  cardPlacement: string;
};

type HeroSectionData = {
  section: WebsiteContentSection;
  cards: HeroSectionCard[];
};

export function getHeroSectionImages(
  sectionData: HeroSectionData,
  page: HeroSectionPage,
  limit = 5,
): string[] {
  if (sectionData.section !== "hero_section") {
    return [];
  }

  return sectionData.cards
    .filter((card) => card.group === page && card.imageUrl.trim().length > 0)
    .sort((a, b) => {
      const aPlacement = a.cardPlacement
        ? Number(a.cardPlacement)
        : Number.MAX_SAFE_INTEGER;
      const bPlacement = b.cardPlacement
        ? Number(b.cardPlacement)
        : Number.MAX_SAFE_INTEGER;

      if (aPlacement === bPlacement) {
        return a.entryKey.localeCompare(b.entryKey);
      }

      return aPlacement - bPlacement;
    })
    .slice(0, limit)
    .map((card) => card.imageUrl);
}

export function normalizePersonalImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl.replace("/headerimage/", "/personalimage/");
  }

  const cleaned = imageUrl.replace(/^\/+/, "");
  if (cleaned.startsWith("storage/v1/object/")) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!baseUrl) {
      return "";
    }
    return `${baseUrl}/${cleaned.replace("/headerimage/", "/personalimage/")}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/storage/v1/object/public/personalimage/${cleaned}`;
}
