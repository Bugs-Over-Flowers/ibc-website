"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { websiteContentSectionSchema } from "../schemas";
import {
  emptyWebsiteContentCard,
  emptyWebsiteContentForm,
  type WebsiteContentCardState,
  type WebsiteContentRow,
  type WebsiteContentSection,
  type WebsiteContentSectionData,
} from "../types";

export async function getWebsiteContentSection(
  section: WebsiteContentSection,
): Promise<WebsiteContentSectionData> {
  const parsedSection = websiteContentSectionSchema.parse(section);
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase
    .from("WebsiteContent")
    .select(
      "section, entryKey, textType, textValue, icon, imageUrl, cardPlacement, group, updatedAt",
    )
    .eq("section", parsedSection)
    .eq("isActive", true)
    .order("updatedAt", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch website content: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as WebsiteContentRow[];
  const form = { ...emptyWebsiteContentForm };

  if (rows.length === 0) {
    return {
      form,
      cards: [],
      placeholders: { ...emptyWebsiteContentForm },
      updatedAt: null,
    };
  }

  const latestUpdatedAt = rows[0]?.updatedAt ?? null;

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
      paragraph: form.visionParagraph,
    };
    const missionCard = {
      ...emptyWebsiteContentCard,
      entryKey: "mission",
      paragraph: form.missionParagraph,
    };

    const placeholders = {
      ...emptyWebsiteContentForm,
      visionParagraph: form.visionParagraph,
      missionParagraph: form.missionParagraph,
    };

    return {
      form,
      cards: [visionCard, missionCard],
      placeholders,
      updatedAt: latestUpdatedAt,
    };
  } else {
    const cardsByEntry = new Map<string, WebsiteContentCardState>();

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
      existing.group = row.group ?? existing.group;

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
          ...emptyWebsiteContentForm,
          title: firstCard.title,
          subtitle: firstCard.subtitle,
          paragraph: firstCard.paragraph,
          icon: firstCard.icon,
          imageUrl: firstCard.imageUrl,
          cardPlacement: firstCard.cardPlacement,
        }
      : { ...emptyWebsiteContentForm };

    return {
      form,
      cards,
      placeholders,
      updatedAt: latestUpdatedAt,
    };
  }
}
