"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { saveWebsiteContentSectionSchema } from "../schemas";
import type {
  SaveWebsiteContentSectionInput,
  UpsertWebsiteContentRowInput,
} from "../types";
import {
  deleteWebsiteContentEntriesBySection,
  upsertWebsiteContentRows,
} from "./upsertWebsiteContentRow";

const WEBSITE_CONTENT_SECTION_TAG_BY_SECTION = {
  vision_mission: CACHE_TAGS.websiteContent.section.visionMission,
  goals: CACHE_TAGS.websiteContent.section.goals,
  company_thrusts: CACHE_TAGS.websiteContent.section.companyThrusts,
  board_of_trustees: CACHE_TAGS.websiteContent.section.boardOfTrustees,
  secretariat: CACHE_TAGS.websiteContent.section.secretariat,
  landing_page_benefits: CACHE_TAGS.websiteContent.section.landingPageBenefits,
  hero_section: CACHE_TAGS.websiteContent.section.heroSection,
} as const;

function isDisallowedImageUrl(imageUrl: string): boolean {
  const normalized = imageUrl.trim().toLowerCase();
  if (normalized.length === 0) {
    return false;
  }

  if (normalized.startsWith("blob:") || normalized.startsWith("data:")) {
    return true;
  }

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(normalized);
  if (!hasScheme) {
    return false;
  }

  return !(
    normalized.startsWith("http://") || normalized.startsWith("https://")
  );
}

function toPlacementValue(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) {
    return null;
  }

  return Math.trunc(numeric);
}

export async function saveWebsiteContentSection(
  input: SaveWebsiteContentSectionInput,
): Promise<{ updatedAt: string }> {
  const parsed = saveWebsiteContentSectionSchema.parse(input);

  // Validate that only persisted image URLs are saved, not preview schemes.
  if (parsed.cards) {
    const invalidImageUrlCards = parsed.cards.filter((card) =>
      isDisallowedImageUrl(card.imageUrl ?? ""),
    );
    if (invalidImageUrlCards.length > 0) {
      throw new Error(
        `Cannot save section: ${invalidImageUrlCards.length} card(s) have invalid image URLs. Images may not have uploaded successfully. Please upload images again.`,
      );
    }
  }

  const rowsToUpsert: UpsertWebsiteContentRowInput[] = [];
  const retainedEntryKeys: string[] = [];

  if (parsed.section === "vision_mission") {
    retainedEntryKeys.push("vision", "mission");

    rowsToUpsert.push({
      section: parsed.section,
      entryKey: "vision",
      textType: "Paragraph",
      textValue: parsed.form.visionParagraph,
    });

    rowsToUpsert.push({
      section: parsed.section,
      entryKey: "mission",
      textType: "Paragraph",
      textValue: parsed.form.missionParagraph,
    });
  } else if (parsed.section === "hero_section") {
    for (const card of parsed.cards) {
      retainedEntryKeys.push(card.entryKey);

      const placementValue = toPlacementValue(card.cardPlacement);

      rowsToUpsert.push({
        section: parsed.section,
        entryKey: card.entryKey,
        textType: "Title",
        textValue: card.title,
        icon: card.icon || null,
        imageUrl: card.imageUrl || null,
        cardPlacement: placementValue,
        group: card.group,
      });
    }
  } else {
    for (const card of parsed.cards) {
      retainedEntryKeys.push(card.entryKey);

      const placementValue = toPlacementValue(card.cardPlacement);

      rowsToUpsert.push({
        section: parsed.section,
        entryKey: card.entryKey,
        textType: "Title",
        textValue: card.title,
        icon: card.icon || null,
        imageUrl: card.imageUrl || null,
        cardPlacement: placementValue,
        group: card.group,
      });

      if (
        parsed.section === "board_of_trustees" ||
        parsed.section === "secretariat" ||
        card.subtitle.trim().length > 0
      ) {
        rowsToUpsert.push({
          section: parsed.section,
          entryKey: card.entryKey,
          textType: "Subtitle",
          textValue: card.subtitle,
          icon: card.icon || null,
          imageUrl: card.imageUrl || null,
          cardPlacement: placementValue,
          group: card.group,
        });
      }

      if (
        parsed.section !== "board_of_trustees" &&
        parsed.section !== "secretariat"
      ) {
        rowsToUpsert.push({
          section: parsed.section,
          entryKey: card.entryKey,
          textType: "Paragraph",
          textValue: card.paragraph,
          icon: card.icon || null,
          imageUrl: card.imageUrl || null,
          cardPlacement: placementValue,
          group: card.group,
        });
      }
    }
  }

  // Upsert all rows with new card placement
  await upsertWebsiteContentRows(rowsToUpsert);

  // Soft delete entries that are no longer retained
  await deleteWebsiteContentEntriesBySection(parsed.section, retainedEntryKeys);

  // CRITICAL: Invalidate cache BEFORE returning to client, so next fetch gets fresh data
  updateTag(CACHE_TAGS.websiteContent.all);
  updateTag(CACHE_TAGS.websiteContent.public);
  updateTag(WEBSITE_CONTENT_SECTION_TAG_BY_SECTION[parsed.section]);

  // Revalidate paths after cache invalidation
  revalidatePath("/", "page");
  revalidatePath("/about", "page");
  revalidatePath("/events", "page");
  revalidatePath("/members", "page");
  revalidatePath("/networks", "page");
  revalidatePath("/contact", "page");
  revalidatePath("/admin/website-content", "page");

  const updatedAt = new Date().toISOString();
  return { updatedAt };
}
