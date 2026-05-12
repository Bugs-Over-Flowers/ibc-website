import type {
  WebsiteContentCardState,
  WebsiteContentFormState,
  WebsiteContentSection,
} from "@/server/website-content/types";

export type WebsiteContentSectionSnapshot = {
  form: WebsiteContentFormState;
  cards: WebsiteContentCardState[];
};

export type WebsiteContentSectionSnapshotsBySection = Partial<
  Record<WebsiteContentSection, WebsiteContentSectionSnapshot>
>;

export const emptyForm: WebsiteContentFormState = {
  title: "",
  subtitle: "",
  paragraph: "",
  visionParagraph: "",
  missionParagraph: "",
  icon: "",
  imageUrl: "",
  cardPlacement: "",
};

export const defaultCardsBySection: Partial<
  Record<WebsiteContentSection, Partial<WebsiteContentCardState>>
> = {
  goals: {
    title: "",
    paragraph: "",
    icon: "Target",
  },
  company_thrusts: {
    title: "",
    paragraph: "",
    icon: "Rocket",
  },
  landing_page_benefits: {
    title: "",
    paragraph: "",
    icon: "Sparkles",
  },
  board_of_trustees: {
    title: "",
    subtitle: "",
    imageUrl: "",
  },
  secretariat: {
    title: "",
    subtitle: "",
    imageUrl: "",
  },
};

export function normalizeCardPlacements(
  cards: WebsiteContentCardState[],
  section?: WebsiteContentSection,
) {
  // For hero_section, normalize placements within each group separately (1-5 per group)
  // This ensures carousel slots remain valid on reload
  if (section === "hero_section") {
    const placementsByGroup: Map<string | null, number> = new Map();

    return cards.map((card) => {
      const group = card.group;
      const currentPlacement = (placementsByGroup.get(group) || 0) + 1;
      placementsByGroup.set(group, currentPlacement);

      return {
        ...card,
        cardPlacement: String(currentPlacement),
      };
    });
  }

  // For other sections, normalize sequentially across all cards (1-N)
  return cards.map((card, index) => ({
    ...card,
    cardPlacement: String(index + 1),
  }));
}
