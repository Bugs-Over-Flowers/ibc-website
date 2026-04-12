"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import { getDefaultsBySection } from "../defaults/getDefaultsBySection";
import { websiteContentSectionSchema } from "../schemas";
import type { WebsiteContentSection } from "../types";
import { upsertWebsiteContentRow } from "./upsertWebsiteContentRow";

const WEBSITE_CONTENT_SECTION_TAG_BY_SECTION = {
  vision_mission: CACHE_TAGS.websiteContent.section.visionMission,
  goals: CACHE_TAGS.websiteContent.section.goals,
  company_thrusts: CACHE_TAGS.websiteContent.section.companyThrusts,
  board_of_trustees: CACHE_TAGS.websiteContent.section.boardOfTrustees,
  secretariat: CACHE_TAGS.websiteContent.section.secretariat,
  landing_page_benefits: CACHE_TAGS.websiteContent.section.landingPageBenefits,
} as const;

export async function initializeWebsiteContentDefaults(
  section: WebsiteContentSection,
): Promise<{ seededCount: number; updatedAt: string }> {
  const parsedSection = websiteContentSectionSchema.parse(section);
  const defaults = getDefaultsBySection(parsedSection);
  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("WebsiteContent")
    .select("entryKey, textType")
    .eq("section", parsedSection)
    .eq("isActive", true);

  if (error) {
    throw new Error(`Failed to inspect existing content: ${error.message}`);
  }

  const existingKeys = new Set<string>(
    ((data as Array<{ entryKey: string; textType: string }> | null) ?? []).map(
      (row) => `${row.entryKey}:${row.textType}`,
    ),
  );

  const upsertIfMissing = async (
    entryKey: string,
    textType: "Title" | "Subtitle" | "Paragraph",
    textValue: string,
    icon: string,
    imageUrl: string,
    cardPlacement: number | null,
  ) => {
    const key = `${entryKey}:${textType}`;
    if (existingKeys.has(key)) {
      return false;
    }

    await upsertWebsiteContentRow({
      section: parsedSection,
      entryKey,
      textType,
      textValue,
      icon: icon || null,
      imageUrl: imageUrl || null,
      cardPlacement,
    });

    existingKeys.add(key);
    return true;
  };

  let seededCount = 0;

  if (parsedSection === "vision_mission") {
    if (
      await upsertIfMissing(
        "vision",
        "Paragraph",
        defaults.placeholders.visionParagraph,
        "",
        "",
        null,
      )
    ) {
      seededCount += 1;
    }

    if (
      await upsertIfMissing(
        "mission",
        "Paragraph",
        defaults.placeholders.missionParagraph,
        "",
        "",
        null,
      )
    ) {
      seededCount += 1;
    }
  } else {
    for (const card of defaults.cards) {
      if (
        await upsertIfMissing(
          card.entryKey,
          "Title",
          card.title,
          card.icon,
          card.imageUrl,
          card.cardPlacement,
        )
      ) {
        seededCount += 1;
      }

      if (
        parsedSection === "board_of_trustees" ||
        parsedSection === "secretariat" ||
        card.subtitle.trim().length > 0
      ) {
        if (
          await upsertIfMissing(
            card.entryKey,
            "Subtitle",
            card.subtitle,
            card.icon,
            card.imageUrl,
            card.cardPlacement,
          )
        ) {
          seededCount += 1;
        }
      }

      if (
        await upsertIfMissing(
          card.entryKey,
          "Paragraph",
          card.paragraph,
          card.icon,
          card.imageUrl,
          card.cardPlacement,
        )
      ) {
        seededCount += 1;
      }
    }
  }

  revalidatePath("/", "page");
  revalidatePath("/about", "page");
  revalidatePath("/admin/website-content", "page");
  updateTag(CACHE_TAGS.websiteContent.all);
  updateTag(CACHE_TAGS.websiteContent.public);
  updateTag(WEBSITE_CONTENT_SECTION_TAG_BY_SECTION[parsedSection]);

  return {
    seededCount,
    updatedAt: new Date().toISOString(),
  };
}
