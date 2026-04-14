import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";
import { websiteContentSectionSchema } from "../schemas";
import type { WebsiteContentSection } from "../types";

export type PublicWebsiteContentCard = {
  entryKey: string;
  title: string;
  subtitle: string;
  paragraph: string;
  icon: string;
  imageUrl: string;
  cardPlacement: string;
  group: string | null;
};

export type PublicWebsiteContentSectionData = {
  section: WebsiteContentSection;
  hasRows: boolean;
  visionParagraph: string;
  missionParagraph: string;
  cards: PublicWebsiteContentCard[];
};

const WEBSITE_CONTENT_SECTION_TAG_BY_SECTION: Record<
  WebsiteContentSection,
  string
> = {
  vision_mission: CACHE_TAGS.websiteContent.section.visionMission,
  goals: CACHE_TAGS.websiteContent.section.goals,
  company_thrusts: CACHE_TAGS.websiteContent.section.companyThrusts,
  board_of_trustees: CACHE_TAGS.websiteContent.section.boardOfTrustees,
  secretariat: CACHE_TAGS.websiteContent.section.secretariat,
  landing_page_benefits: CACHE_TAGS.websiteContent.section.landingPageBenefits,
};

type WebsiteContentRow = {
  entryKey: string;
  textType: "Title" | "Subtitle" | "Paragraph";
  textValue: string | null;
  icon: string | null;
  imageUrl: string | null;
  cardPlacement: number | null;
};

function normalizePersonalImageUrl(imageUrl: string | null) {
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

async function getPublicWebsiteContentSectionCached(
  requestCookies: RequestCookie[],
  section: WebsiteContentSection,
): Promise<PublicWebsiteContentSectionData> {
  "use cache";

  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.websiteContent.all);
  cacheTag(CACHE_TAGS.websiteContent.public);

  const parsedSection = websiteContentSectionSchema.parse(section);
  cacheTag(WEBSITE_CONTENT_SECTION_TAG_BY_SECTION[parsedSection]);

  const supabase = await createClient(requestCookies);
  const { data, error } = await supabase
    .from("WebsiteContent")
    .select("entryKey, textType, textValue, icon, imageUrl, cardPlacement")
    .eq("section", parsedSection)
    .eq("isActive", true);

  if (error) {
    throw new Error(`Failed to fetch website content: ${error.message}`);
  }

  const rows = ((data as WebsiteContentRow[] | null) ?? []).filter(Boolean);

  if (rows.length === 0) {
    return {
      section: parsedSection,
      hasRows: false,
      visionParagraph: "",
      missionParagraph: "",
      cards: [],
    };
  }

  if (parsedSection === "vision_mission") {
    const visionParagraph =
      rows.find(
        (row) => row.entryKey === "vision" && row.textType === "Paragraph",
      )?.textValue ?? "";
    const missionParagraph =
      rows.find(
        (row) => row.entryKey === "mission" && row.textType === "Paragraph",
      )?.textValue ?? "";

    return {
      section: parsedSection,
      hasRows: true,
      visionParagraph,
      missionParagraph,
      cards: [],
    };
  }

  const cardsByEntryKey = new Map<string, PublicWebsiteContentCard>();

  for (const row of rows) {
    const existing = cardsByEntryKey.get(row.entryKey) ?? {
      entryKey: row.entryKey,
      title: "",
      subtitle: "",
      paragraph: "",
      icon: "",
      imageUrl: "",
      cardPlacement: row.cardPlacement ? String(row.cardPlacement) : "",
      group: null,
    };

    if (row.textType === "Title") {
      existing.title = row.textValue ?? "";
    }
    if (row.textType === "Subtitle") {
      existing.subtitle = row.textValue ?? "";
    }
    if (row.textType === "Paragraph") {
      existing.paragraph = row.textValue ?? "";
    }

    existing.icon = row.icon ?? existing.icon;
    existing.imageUrl = normalizePersonalImageUrl(row.imageUrl);
    existing.cardPlacement = row.cardPlacement
      ? String(row.cardPlacement)
      : existing.cardPlacement;

    cardsByEntryKey.set(row.entryKey, existing);
  }

  const cards = Array.from(cardsByEntryKey.values()).sort((a, b) => {
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
  });

  return {
    section: parsedSection,
    hasRows: true,
    visionParagraph: "",
    missionParagraph: "",
    cards,
  };
}

export async function getPublicWebsiteContentSection(
  section: WebsiteContentSection,
): Promise<PublicWebsiteContentSectionData> {
  const cookieStore = await cookies();
  return getPublicWebsiteContentSectionCached(cookieStore.getAll(), section);
}
