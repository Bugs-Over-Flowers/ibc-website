"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const formRef = useRef(form);
  formRef.current = form;
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
        }
        if (activeSection) {
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
        }
        await loadSectionSummaries();
        toast.success("Website content saved");
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const loadSectionSummariesRef = useRef(loadSectionSummaries);
  loadSectionSummariesRef.current = loadSectionSummaries;

  useEffect(() => {
    void loadSectionSummariesRef.current();
  }, []);

  const loadSectionRef = useRef(loadSection);
  loadSectionRef.current = loadSection;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only run on section switch, not on every cache mutation
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

    void loadSectionRef.current(activeSection);
  }, [activeSection]);

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
    const next = { ...form, [field]: value };
    setForm(next);

    if (activeSection) {
      setCachedSectionContentBySection((cachePrev) => ({
        ...cachePrev,
        [activeSection]: {
          form: next,
          cards: cachePrev[activeSection]?.cards ?? cards,
        },
      }));
    }
  };

  const setCardField = (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => {
    const next = cards.map((card) =>
      card.entryKey === entryKey ? { ...card, [field]: value } : card,
    );
    setCards(next);

    if (activeSection) {
      setCachedSectionContentBySection((cachePrev) => ({
        ...cachePrev,
        [activeSection]: {
          form: cachePrev[activeSection]?.form ?? form,
          cards: next,
        },
      }));
    }
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

    const maxPlacement = cards.reduce((max, card) => {
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
      ...cards,
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

    setCards(next);

    if (activeSection) {
      setCachedSectionContentBySection((cachePrev) => ({
        ...cachePrev,
        [activeSection]: {
          form: cachePrev[activeSection]?.form ?? form,
          cards: next,
        },
      }));
    }
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

    const filtered = cards.filter(
      (card) => !selectedCardEntryKeys.has(card.entryKey),
    );
    const nextCards = filtered.map((card, index) => ({
      ...card,
      cardPlacement: String(index + 1),
    }));

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

    setSelectedCardEntryKeys(new Set());
    setIsDeleteMode(false);
  };

  const save = async (
    snapshotCards?: WebsiteContentCardState[],
    snapshotForm?: WebsiteContentFormState,
  ) => {
    if (!activeSection) {
      return;
    }

    await saveSection({
      section: activeSection,
      form: snapshotForm ?? formRef.current,
      cards: snapshotCards ?? cardsRef.current,
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
