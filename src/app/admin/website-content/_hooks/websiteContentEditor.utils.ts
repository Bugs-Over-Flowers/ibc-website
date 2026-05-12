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

function toComparableForm(form: WebsiteContentFormState) {
  return {
    title: form.title,
    subtitle: form.subtitle,
    paragraph: form.paragraph,
    visionParagraph: form.visionParagraph,
    missionParagraph: form.missionParagraph,
    icon: form.icon,
    imageUrl: form.imageUrl,
    cardPlacement: form.cardPlacement,
  };
}

function toComparableCard(card: WebsiteContentCardState) {
  return {
    entryKey: card.entryKey,
    title: card.title,
    subtitle: card.subtitle,
    paragraph: card.paragraph,
    icon: card.icon,
    imageUrl: card.imageUrl,
    cardPlacement: card.cardPlacement,
    group: card.group,
  };
}

export function areFormsEqual(
  left: WebsiteContentFormState,
  right: WebsiteContentFormState,
) {
  return (
    JSON.stringify(toComparableForm(left)) ===
    JSON.stringify(toComparableForm(right))
  );
}

export function areCardsEqual(
  left: WebsiteContentCardState[],
  right: WebsiteContentCardState[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((card, index) => {
    return (
      JSON.stringify(toComparableCard(card)) ===
      JSON.stringify(toComparableCard(right[index]))
    );
  });
}

export function normalizeCardPlacements(cards: WebsiteContentCardState[]) {
  return cards.map((card, index) => ({
    ...card,
    cardPlacement: String(index + 1),
  }));
}
