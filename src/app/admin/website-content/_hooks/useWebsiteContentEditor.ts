"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { saveWebsiteContentSection } from "@/server/website-content/mutations/saveWebsiteContentSection";
import { getWebsiteContentSection } from "@/server/website-content/queries/getWebsiteContentSection";
import {
  getWebsiteContentSectionsSummary,
  type WebsiteContentSectionsSummary,
} from "@/server/website-content/queries/getWebsiteContentSectionsSummary";
import type {
  WebsiteContentCardState,
  WebsiteContentFormState,
  WebsiteContentSection,
  WebsiteContentSectionData,
} from "@/server/website-content/types";

const emptyForm: WebsiteContentFormState = {
  title: "",
  subtitle: "",
  paragraph: "",
  visionParagraph: "",
  missionParagraph: "",
  icon: "",
  imageUrl: "",
  cardPlacement: "",
};

const defaultCardsBySection: Record<
  string,
  Partial<WebsiteContentCardState>
> = {
  goals: {
    title: "Define a new organizational goal",
    paragraph:
      "Describe what this goal is about, why it matters, and how it will be achieved.",
    icon: "Target",
  },
  company_thrusts: {
    title: "Enter thrust title",
    paragraph: "Describe the company thrust and its strategic importance.",
    icon: "Rocket",
  },
  landing_page_benefits: {
    title: "Enter benefit title",
    paragraph: "Explain the benefit and its value proposition.",
    icon: "Sparkles",
  },
  board_of_trustees: {
    title: "Board member name",
    subtitle: "Position/Title",
    imageUrl: "",
  },
  secretariat: {
    title: "Staff member name",
    subtitle: "Position/Title",
    imageUrl: "",
  },
};

export function useWebsiteContentEditor(
  activeSection: WebsiteContentSection | null,
) {
  const [form, setForm] = useState<WebsiteContentFormState>(emptyForm);
  const [cards, setCards] = useState<WebsiteContentCardState[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCardEntryKeys, setSelectedCardEntryKeys] = useState<
    Set<string>
  >(() => new Set());
  const [cachedSectionContentBySection, setCachedSectionContentBySection] =
    useState<
      Partial<
        Record<
          WebsiteContentSection,
          {
            form: WebsiteContentFormState;
            cards: WebsiteContentCardState[];
          }
        >
      >
    >({});
  const [placeholdersBySection, setPlaceholdersBySection] = useState<
    Partial<Record<WebsiteContentSection, WebsiteContentFormState>>
  >({});
  const [updatedAtBySection, setUpdatedAtBySection] = useState<
    Partial<Record<WebsiteContentSection, string>>
  >({});
  const [cardCountBySection, setCardCountBySection] = useState<
    Partial<Record<WebsiteContentSection, number>>
  >({});
  const [hasLoadedSectionSummaries, setHasLoadedSectionSummaries] =
    useState(false);

  const getWebsiteContentSectionsSummaryAction = useMemo(
    () => tryCatch(getWebsiteContentSectionsSummary),
    [],
  );
  const getWebsiteContentSectionAction = useMemo(
    () => tryCatch(getWebsiteContentSection),
    [],
  );
  const saveWebsiteContentSectionAction = useMemo(
    () => tryCatch(saveWebsiteContentSection),
    [],
  );

  const { execute: loadSectionSummaries } = useAction(
    getWebsiteContentSectionsSummaryAction,
    {
      onSuccess: (summary: WebsiteContentSectionsSummary) => {
        const nextUpdatedAtBySection: Partial<
          Record<WebsiteContentSection, string>
        > = {};
        const nextCardCountBySection: Partial<
          Record<WebsiteContentSection, number>
        > = {};

        for (const [section, sectionSummary] of Object.entries(summary)) {
          const typedSection = section as WebsiteContentSection;
          if (sectionSummary.updatedAt) {
            nextUpdatedAtBySection[typedSection] = sectionSummary.updatedAt;
          }
          nextCardCountBySection[typedSection] = sectionSummary.cardCount;
        }

        setUpdatedAtBySection(nextUpdatedAtBySection);
        setCardCountBySection(nextCardCountBySection);
        setHasLoadedSectionSummaries(true);
      },
      onError: (error) => {
        toast.error(error);
        setHasLoadedSectionSummaries(true);
      },
    },
  );

  const { execute: loadSection, isPending: isLoadingSection } = useAction(
    getWebsiteContentSectionAction,
    {
      onSuccess: (data: WebsiteContentSectionData) => {
        setForm(data.form);
        setCards(data.cards);
        if (activeSection) {
          setCachedSectionContentBySection((prev) => ({
            ...prev,
            [activeSection]: {
              form: data.form,
              cards: data.cards,
            },
          }));
          setPlaceholdersBySection((prev) => ({
            ...prev,
            [activeSection]: data.placeholders,
          }));
        }
        if (activeSection && data.updatedAt) {
          setUpdatedAtBySection((prev) => ({
            ...prev,
            [activeSection]: data.updatedAt,
          }));
        }
        if (activeSection) {
          setCardCountBySection((prev) => ({
            ...prev,
            [activeSection]: data.cards.length,
          }));
        }
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const { execute: saveSection, isPending: isSavingSection } = useAction(
    saveWebsiteContentSectionAction,
    {
      onSuccess: async (result: { updatedAt: string }) => {
        if (activeSection) {
          setUpdatedAtBySection((prev) => ({
            ...prev,
            [activeSection]: result.updatedAt,
          }));
          await loadSection(activeSection);
        }
        await loadSectionSummaries();
        toast.success("Website content saved");
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  useEffect(() => {
    void loadSectionSummaries();
  }, [loadSectionSummaries]);

  useEffect(() => {
    setIsDeleteMode(false);
    setSelectedCardEntryKeys(new Set());

    if (!activeSection) {
      return;
    }

    const cachedSection = cachedSectionContentBySection[activeSection];
    if (cachedSection) {
      setForm(cachedSection.form);
      setCards(cachedSection.cards);
      return;
    }

    void loadSection(activeSection);
  }, [activeSection, cachedSectionContentBySection, loadSection]);

  const sectionUpdatedAt = useMemo(() => {
    if (!activeSection) {
      return null;
    }
    return updatedAtBySection[activeSection] ?? null;
  }, [activeSection, updatedAtBySection]);

  const placeholders = useMemo(() => {
    if (!activeSection) {
      return emptyForm;
    }
    return placeholdersBySection[activeSection] ?? emptyForm;
  }, [activeSection, placeholdersBySection]);

  const setField = <K extends keyof WebsiteContentFormState>(
    field: K,
    value: WebsiteContentFormState[K],
  ) => {
    setForm((prev: WebsiteContentFormState) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (activeSection) {
        setCachedSectionContentBySection((cachePrev) => ({
          ...cachePrev,
          [activeSection]: {
            form: next,
            cards: cachePrev[activeSection]?.cards ?? cards,
          },
        }));
      }

      return next;
    });
  };

  const setCardField = (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => {
    setCards((prev) => {
      const next = prev.map((card) =>
        card.entryKey === entryKey ? { ...card, [field]: value } : card,
      );

      if (activeSection) {
        setCachedSectionContentBySection((cachePrev) => ({
          ...cachePrev,
          [activeSection]: {
            form: cachePrev[activeSection]?.form ?? form,
            cards: next,
          },
        }));
      }

      return next;
    });
  };

  const replaceCards = (nextCards: WebsiteContentCardState[]) => {
    setCards(nextCards);
    if (activeSection) {
      setCachedSectionContentBySection((cachePrev) => ({
        ...cachePrev,
        [activeSection]: {
          form: cachePrev[activeSection]?.form ?? form,
          cards: nextCards,
        },
      }));
    }
  };

  const addCard = (group: string | null = null) => {
    if (!activeSection || activeSection === "vision_mission") {
      return;
    }

    setCards((prev) => {
      const maxPlacement = prev.reduce((max, card) => {
        const placement = Number(card.cardPlacement);
        if (Number.isFinite(placement) && placement > max) {
          return placement;
        }
        return max;
      }, 0);

      const nextPlacement = String(maxPlacement + 1);
      const entryKey = `${activeSection}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const defaults = defaultCardsBySection[activeSection] || {};

      const next = [
        ...prev,
        {
          entryKey,
          title: defaults.title || "",
          subtitle: defaults.subtitle || "",
          paragraph: defaults.paragraph || "",
          icon: defaults.icon || "",
          imageUrl: defaults.imageUrl || "",
          cardPlacement: nextPlacement,
          group,
        },
      ];

      setCachedSectionContentBySection((cachePrev) => ({
        ...cachePrev,
        [activeSection]: {
          form: cachePrev[activeSection]?.form ?? form,
          cards: next,
        },
      }));

      return next;
    });
  };

  const enterDeleteMode = () => {
    setIsDeleteMode(true);
  };

  const cancelDeleteMode = () => {
    setIsDeleteMode(false);
    setSelectedCardEntryKeys(new Set());
  };

  const clearCardSelection = () => {
    setSelectedCardEntryKeys(new Set());
  };

  const selectAllCards = () => {
    setSelectedCardEntryKeys(new Set(cards.map((card) => card.entryKey)));
  };

  const unselectAllCards = () => {
    setSelectedCardEntryKeys(new Set());
  };

  const toggleCardSelected = (entryKey: string, checked: boolean) => {
    setSelectedCardEntryKeys((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(entryKey);
      } else {
        next.delete(entryKey);
      }
      return next;
    });
  };

  const deleteSelectedCards = () => {
    if (!activeSection || selectedCardEntryKeys.size === 0) {
      return;
    }

    setCards((prev) => {
      const filtered = prev.filter(
        (card) => !selectedCardEntryKeys.has(card.entryKey),
      );
      const nextCards = filtered.map((card, index) => ({
        ...card,
        cardPlacement: String(index + 1),
      }));

      setCachedSectionContentBySection((cachePrev) => ({
        ...cachePrev,
        [activeSection]: {
          form: cachePrev[activeSection]?.form ?? form,
          cards: nextCards,
        },
      }));

      return nextCards;
    });

    setSelectedCardEntryKeys(new Set());
    setIsDeleteMode(false);
  };

  const save = async () => {
    if (!activeSection) {
      return;
    }

    await saveSection({
      section: activeSection,
      form,
      cards,
    });
  };

  return {
    form,
    cards,
    setField,
    setCardField,
    replaceCards,
    addCard,
    isDeleteMode,
    selectedCardEntryKeys,
    enterDeleteMode,
    cancelDeleteMode,
    clearCardSelection,
    selectAllCards,
    unselectAllCards,
    toggleCardSelected,
    deleteSelectedCards,
    save,
    isSavingSection,
    isLoadingSection,
    placeholders,
    sectionUpdatedAt,
    placeholdersBySection,
    updatedAtBySection,
    cardCountBySection,
    hasLoadedSectionSummaries,
  };
}
