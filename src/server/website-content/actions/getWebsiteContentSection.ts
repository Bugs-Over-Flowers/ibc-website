"use server";

import { createActionClient } from "@/lib/supabase/server";
import { getDefaultsBySection } from "../defaults/getDefaultsBySection";
import { websiteContentSectionSchema } from "../schemas";
import {
  emptyWebsiteContentCard,
  emptyWebsiteContentForm,
  type WebsiteContentCardState,
  type WebsiteContentRow,
  type WebsiteContentSection,
  type WebsiteContentSectionData,
} from "../types";

function toCardState(defaultCard: {
  entryKey: string;
  title: string;
  subtitle: string;
  paragraph: string;
  icon: string;
  imageUrl: string;
  cardPlacement: number | null;
  group: string | null;
}): WebsiteContentCardState {
  return {
    entryKey: defaultCard.entryKey,
    title: defaultCard.title,
    subtitle: defaultCard.subtitle,
    paragraph: defaultCard.paragraph,
    icon: defaultCard.icon,
    imageUrl: defaultCard.imageUrl,
    cardPlacement: defaultCard.cardPlacement
      ? String(defaultCard.cardPlacement)
      : "",
    group: defaultCard.group,
  };
}

export async function getWebsiteContentSection(
  section: WebsiteContentSection,
): Promise<WebsiteContentSectionData> {
  const parsedSection = websiteContentSectionSchema.parse(section);
  const defaults = getDefaultsBySection(parsedSection);
  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("WebsiteContent")
    .select(
      "section, entryKey, textType, textValue, icon, imageUrl, cardPlacement, updatedAt",
    )
    .eq("section", parsedSection)
    .eq("isActive", true)
    .order("updatedAt", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch website content: ${error.message}`);
  }

  const rows = (data ?? []) as WebsiteContentRow[];
  const form = { ...emptyWebsiteContentForm };
  const defaultCards = defaults.cards.map(toCardState);

  if (rows.length === 0) {
    if (parsedSection !== "vision_mission" && defaultCards.length > 0) {
      const firstCard = defaultCards[0];
      form.title = firstCard.title;
      form.subtitle = firstCard.subtitle;
      form.paragraph = firstCard.paragraph;
      form.icon = firstCard.icon;
      form.imageUrl = firstCard.imageUrl;
      form.cardPlacement = firstCard.cardPlacement;
    }

    return {
      form,
      cards: defaultCards,
      placeholders: defaults.placeholders,
      updatedAt: null,
    };
  }

  const latestUpdatedAt =
    rows
      .map((row) => row.updatedAt)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

  if (parsedSection === "vision_mission") {
    const visionRow = rows.find(
      (row) => row.entryKey === "vision" && row.textType === "Paragraph",
    );
    const missionRow = rows.find(
      (row) => row.entryKey === "mission" && row.textType === "Paragraph",
    );

    form.visionParagraph = visionRow?.textValue ?? "";
    form.missionParagraph = missionRow?.textValue ?? "";

    const visionCard = {
      ...emptyWebsiteContentCard,
      entryKey: "vision",
      paragraph: form.visionParagraph || defaults.placeholders.visionParagraph,
    };
    const missionCard = {
      ...emptyWebsiteContentCard,
      entryKey: "mission",
      paragraph:
        form.missionParagraph || defaults.placeholders.missionParagraph,
    };

    const placeholders = {
      ...defaults.placeholders,
      visionParagraph:
        form.visionParagraph || defaults.placeholders.visionParagraph,
      missionParagraph:
        form.missionParagraph || defaults.placeholders.missionParagraph,
    };

    return {
      form,
      cards: [visionCard, missionCard],
      placeholders,
      updatedAt: latestUpdatedAt,
    };
  } else {
    const cardsByEntry = new Map<string, WebsiteContentCardState>();

    for (const defaultCard of defaultCards) {
      cardsByEntry.set(defaultCard.entryKey, { ...defaultCard });
    }

    for (const row of rows) {
      const existing = cardsByEntry.get(row.entryKey) ?? {
        ...emptyWebsiteContentCard,
        entryKey: row.entryKey,
        cardPlacement: row.cardPlacement ? String(row.cardPlacement) : "",
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
      existing.imageUrl = row.imageUrl ?? existing.imageUrl;
      existing.cardPlacement = row.cardPlacement
        ? String(row.cardPlacement)
        : existing.cardPlacement;

      cardsByEntry.set(row.entryKey, existing);
    }

    const cards = Array.from(cardsByEntry.values()).sort((a, b) => {
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

    if (cards.length > 0) {
      const firstCard = cards[0];
      form.title = firstCard.title;
      form.subtitle = firstCard.subtitle;
      form.paragraph = firstCard.paragraph;
      form.icon = firstCard.icon;
      form.imageUrl = firstCard.imageUrl;
      form.cardPlacement = firstCard.cardPlacement;
    }

    const firstCard = cards[0];
    const placeholders = firstCard
      ? {
          ...defaults.placeholders,
          title: firstCard.title || defaults.placeholders.title,
          subtitle: firstCard.subtitle || defaults.placeholders.subtitle,
          paragraph: firstCard.paragraph || defaults.placeholders.paragraph,
          icon: firstCard.icon || defaults.placeholders.icon,
          imageUrl: firstCard.imageUrl || defaults.placeholders.imageUrl,
          cardPlacement:
            firstCard.cardPlacement || defaults.placeholders.cardPlacement,
        }
      : defaults.placeholders;

    return {
      form,
      cards,
      placeholders,
      updatedAt: latestUpdatedAt,
    };
  }
}
