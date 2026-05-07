import type { WebsiteContentCardState } from "@/server/website-content/types";

type BoardGroup = "featured" | "officers" | "trustees" | "other";

export function useBoardCardGroups(cards: WebsiteContentCardState[]) {
  const getBoardGroup = (card: WebsiteContentCardState): BoardGroup => {
    const group = card.group;
    const normalized = group?.trim().toLowerCase();

    if (normalized === "featured") {
      return "featured";
    }

    if (normalized === "officer" || normalized === "officers") {
      return "officers";
    }

    if (normalized === "trustee" || normalized === "trustees") {
      return "trustees";
    }

    if (normalized === "other" || normalized === "others") {
      return "other";
    }

    // Legacy fallback for rows saved before board group persisted.
    const subtitle = card.subtitle.trim().toLowerCase();
    if (subtitle.includes("trustee")) {
      return "trustees";
    }

    const placement = Number(card.cardPlacement);
    if (Number.isFinite(placement) && placement > 0) {
      if (placement <= 2) {
        return "featured";
      }
      if (placement <= 7) {
        return "officers";
      }
      return "trustees";
    }

    return "other";
  };

  const sortCardsByPlacement = (
    a: WebsiteContentCardState,
    b: WebsiteContentCardState,
  ) => {
    const aPlacement = Number(a.cardPlacement);
    const bPlacement = Number(b.cardPlacement);

    const resolvedA =
      Number.isFinite(aPlacement) && aPlacement > 0
        ? aPlacement
        : Number(a.entryKey.split("_").at(-1)) || Number.MAX_SAFE_INTEGER;

    const resolvedB =
      Number.isFinite(bPlacement) && bPlacement > 0
        ? bPlacement
        : Number(b.entryKey.split("_").at(-1)) || Number.MAX_SAFE_INTEGER;

    if (resolvedA === resolvedB) {
      return a.entryKey.localeCompare(b.entryKey);
    }

    return resolvedA - resolvedB;
  };

  const featuredCards = cards
    .filter((card) => getBoardGroup(card) === "featured")
    .sort(sortCardsByPlacement);

  const officerCards = cards
    .filter((card) => getBoardGroup(card) === "officers")
    .sort(sortCardsByPlacement);

  const trusteeCards = cards
    .filter((card) => getBoardGroup(card) === "trustees")
    .sort(sortCardsByPlacement);

  const otherCards = cards
    .filter((card) => getBoardGroup(card) === "other")
    .sort(sortCardsByPlacement);

  return { featuredCards, officerCards, trusteeCards, otherCards };
}
