"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { WebsiteContentSection } from "../types";

type WebsiteContentSectionSummary = {
  updatedAt: string | null;
  cardCount: number;
};

export type WebsiteContentSectionsSummary = Record<
  WebsiteContentSection,
  WebsiteContentSectionSummary
>;

type WebsiteContentSummaryRow = {
  section: WebsiteContentSection;
  entryKey: string;
  updatedAt: string;
};

const SECTION_KEYS: WebsiteContentSection[] = [
  "vision_mission",
  "goals",
  "company_thrusts",
  "board_of_trustees",
  "secretariat",
  "landing_page_benefits",
  "hero_section",
];

function createEmptySummary(): WebsiteContentSectionsSummary {
  return {
    vision_mission: { updatedAt: null, cardCount: 0 },
    goals: { updatedAt: null, cardCount: 0 },
    company_thrusts: { updatedAt: null, cardCount: 0 },
    board_of_trustees: { updatedAt: null, cardCount: 0 },
    secretariat: { updatedAt: null, cardCount: 0 },
    landing_page_benefits: { updatedAt: null, cardCount: 0 },
    hero_section: { updatedAt: null, cardCount: 0 },
  };
}

export async function getWebsiteContentSectionsSummary(): Promise<WebsiteContentSectionsSummary> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase
    .from("WebsiteContent")
    .select("section, entryKey, updatedAt")
    .eq("isActive", true);

  if (error) {
    throw new Error(
      `Failed to fetch website content summary: ${error.message}`,
    );
  }

  const summary = createEmptySummary();
  const entryKeysBySection = new Map<WebsiteContentSection, Set<string>>(
    SECTION_KEYS.map((section) => [section, new Set()]),
  );

  const rows = (
    (data as unknown as WebsiteContentSummaryRow[] | null) ?? []
  ).filter(Boolean);

  for (const row of rows) {
    if (!SECTION_KEYS.includes(row.section)) {
      continue;
    }

    const sectionSummary = summary[row.section];
    if (!sectionSummary.updatedAt || row.updatedAt > sectionSummary.updatedAt) {
      sectionSummary.updatedAt = row.updatedAt;
    }

    const entryKeys = entryKeysBySection.get(row.section);
    if (entryKeys) {
      entryKeys.add(row.entryKey);
      sectionSummary.cardCount = entryKeys.size;
    }
  }

  return summary;
}
