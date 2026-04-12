"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { saveWebsiteContentSectionSchema } from "../schemas";
import type { SaveWebsiteContentSectionInput } from "../types";
import { upsertWebsiteContentRow } from "./upsertWebsiteContentRow";

const WEBSITE_CONTENT_SECTION_TAG_BY_SECTION = {
  vision_mission: CACHE_TAGS.websiteContent.section.visionMission,
  goals: CACHE_TAGS.websiteContent.section.goals,
  company_thrusts: CACHE_TAGS.websiteContent.section.companyThrusts,
  board_of_trustees: CACHE_TAGS.websiteContent.section.boardOfTrustees,
  secretariat: CACHE_TAGS.websiteContent.section.secretariat,
  landing_page_benefits: CACHE_TAGS.websiteContent.section.landingPageBenefits,
} as const;

export async function saveWebsiteContentSection(
  input: SaveWebsiteContentSectionInput,
): Promise<{ updatedAt: string }> {
  const parsed = saveWebsiteContentSectionSchema.parse(input);

  if (parsed.section === "vision_mission") {
    await upsertWebsiteContentRow({
      section: parsed.section,
      entryKey: "vision",
      textType: "Paragraph",
      textValue: parsed.form.visionParagraph,
    });

    await upsertWebsiteContentRow({
      section: parsed.section,
      entryKey: "mission",
      textType: "Paragraph",
      textValue: parsed.form.missionParagraph,
    });
  } else {
    for (const card of parsed.cards) {
      const placementValue = card.cardPlacement
        ? Number(card.cardPlacement)
        : null;

      await upsertWebsiteContentRow({
        section: parsed.section,
        entryKey: card.entryKey,
        textType: "Title",
        textValue: card.title,
        icon: card.icon || null,
        imageUrl: card.imageUrl || null,
        cardPlacement: placementValue,
      });

      if (
        parsed.section === "board_of_trustees" ||
        parsed.section === "secretariat" ||
        card.subtitle.trim().length > 0
      ) {
        await upsertWebsiteContentRow({
          section: parsed.section,
          entryKey: card.entryKey,
          textType: "Subtitle",
          textValue: card.subtitle,
          icon: card.icon || null,
          imageUrl: card.imageUrl || null,
          cardPlacement: placementValue,
        });
      }

      await upsertWebsiteContentRow({
        section: parsed.section,
        entryKey: card.entryKey,
        textType: "Paragraph",
        textValue: card.paragraph,
        icon: card.icon || null,
        imageUrl: card.imageUrl || null,
        cardPlacement: placementValue,
      });
    }
  }

  revalidatePath("/", "page");
  revalidatePath("/about", "page");
  revalidatePath("/admin/website-content", "page");
  updateTag(CACHE_TAGS.websiteContent.all);
  updateTag(CACHE_TAGS.websiteContent.public);
  updateTag(WEBSITE_CONTENT_SECTION_TAG_BY_SECTION[parsed.section]);

  return { updatedAt: new Date().toISOString() };
}
