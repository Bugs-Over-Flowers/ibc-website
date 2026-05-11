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

function areFormsEqual(
  left: WebsiteContentFormState,
  right: WebsiteContentFormState,
) {
  return (
    JSON.stringify(toComparableForm(left)) ===
    JSON.stringify(toComparableForm(right))
  );
}

function areCardsEqual(
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

function normalizeCardPlacements(cards: WebsiteContentCardState[]) {
  return cards.map((card, index) => ({
    ...card,
    cardPlacement: String(index + 1),
  }));
}

export function useWebsiteContentEditor(
  activeSection: WebsiteContentSection | null,
) {
  const [form, setForm] = useState<WebsiteContentFormState>(emptyForm);
  const [cards, setCards] = useState<WebsiteContentCardState[]>([]);
  const [
    hasPendingChangesForActiveSection,
    setHasPendingChangesForActiveSection,
  ] = useState(false);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const formRef = useRef(form);
  formRef.current = form;
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;
  const cardsBeforeDragRef = useRef<WebsiteContentCardState[] | null>(null);
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
  const [savedSectionContentBySection, setSavedSectionContentBySection] =
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
  const [saveSucceededCount, setSaveSucceededCount] = useState(0);

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
        // Use the ref to avoid stale closures capturing a previous
        // `activeSection` value when this callback was created.
        const section = activeSectionRef.current;
        setForm(data.form);
        setCards(data.cards);
        setHasPendingChangesForActiveSection(false);
        if (section) {
          setCachedSectionContentBySection((prev) => ({
            ...prev,
            [section]: {
              form: data.form,
              cards: data.cards,
            },
          }));
          setSavedSectionContentBySection((prev) => ({
            ...prev,
            [section]: {
              form: data.form,
              cards: data.cards,
            },
          }));

          setPlaceholdersBySection((prev) => ({
            ...prev,
            [section]: data.placeholders,
          }));

          if (data.updatedAt) {
            setUpdatedAtBySection((prev) => ({
              ...prev,
              [section]: data.updatedAt,
            }));
          }

          setCardCountBySection((prev) => ({
            ...prev,
            [section]: data.cards.length,
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
        const section = activeSectionRef.current;
        if (section) {
          setUpdatedAtBySection((prev) => ({
            ...prev,
            [section]: result.updatedAt,
          }));
        }
        setSaveSucceededCount((prev) => prev + 1);
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

  // Log card changes to track when reorders trigger state updates
  useEffect(() => {}, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only run on section switch, not on every cache mutation
  useEffect(() => {
    setIsDeleteMode(false);
    setSelectedCardEntryKeys(new Set());
    setHasPendingChangesForActiveSection(false);

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

  const hasUnsavedChangesForActiveSection = useMemo(() => {
    if (!activeSection) {
      return false;
    }

    const savedSection = savedSectionContentBySection[activeSection];
    if (!savedSection) {
      return false;
    }

    // explicit check for cardPlacement differences for certain sections
    const cardPlacementChangedForSpecialSections = (() => {
      if (
        activeSection !== "board_of_trustees" &&
        activeSection !== "secretariat"
      ) {
        return false;
      }

      const savedMap = new Map<string, string>();
      for (const c of savedSection.cards) {
        savedMap.set(c.entryKey, c.cardPlacement);
      }

      for (const c of cards) {
        const savedPlacement = savedMap.get(c.entryKey);
        if (
          savedPlacement !== undefined &&
          savedPlacement !== c.cardPlacement
        ) {
          return true;
        }
      }

      return false;
    })();

    return (
      hasPendingChangesForActiveSection ||
      !areFormsEqual(form, savedSection.form) ||
      !areCardsEqual(cards, savedSection.cards) ||
      cardPlacementChangedForSpecialSections
    );
  }, [
    activeSection,
    cards,
    form,
    hasPendingChangesForActiveSection,
    savedSectionContentBySection,
  ]);

  // Helper to check whether cardPlacement differs between saved snapshot
  // and current cached/active cards for a given section. Only relevant
  // for sections that use placements (secretariat, board_of_trustees).
  const hasCardPlacementChangedForSection = useMemo(
    () => (section: WebsiteContentSection | null) => {
      if (!section) return false;
      if (section !== "board_of_trustees" && section !== "secretariat") {
        return false;
      }

      // Prefer the authoritative saved snapshot; if it's not available use the
      // cached snapshot (this can happen when the hook restores from cache
      // and hasn't set `savedSectionContentBySection` yet).
      const saved =
        savedSectionContentBySection[section] ??
        cachedSectionContentBySection[section];
      if (!saved) {
        return false;
      }

      // prefer the active in-memory cards when the section is active,
      // otherwise use the cached snapshot for that section if available
      const currentCards =
        activeSection === section
          ? cards
          : (cachedSectionContentBySection[section]?.cards ?? saved.cards);

      const savedMap = new Map<string, string>();
      for (const c of saved.cards) {
        savedMap.set(c.entryKey, c.cardPlacement);
      }

      for (const c of currentCards) {
        const savedPlacement = savedMap.get(c.entryKey);
        if (
          savedPlacement !== undefined &&
          savedPlacement !== c.cardPlacement
        ) {
          return true;
        }
      }

      return false;
    },
    [
      activeSection,
      cards,
      cachedSectionContentBySection,
      savedSectionContentBySection,
    ],
  );

  const secretariatCardPlacementChanged = useMemo(
    () => hasCardPlacementChangedForSection("secretariat"),
    [hasCardPlacementChangedForSection],
  );

  const boardOfTrusteesCardPlacementChanged = useMemo(
    () => hasCardPlacementChangedForSection("board_of_trustees"),
    [hasCardPlacementChangedForSection],
  );

  // placement-change observability removed in production
  useEffect(() => {}, []);
  useEffect(() => {}, []);

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
    // Recompute whether there are pending changes compared to saved snapshot
    const saved =
      savedSectionContentBySection[activeSection as WebsiteContentSection];
    if (!activeSection || !saved) {
      setHasPendingChangesForActiveSection(true);
    } else {
      setHasPendingChangesForActiveSection(
        !areFormsEqual(next, saved.form) ||
          !areCardsEqual(cardsRef.current, saved.cards),
      );
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
    const saved =
      savedSectionContentBySection[activeSection as WebsiteContentSection];
    if (!activeSection || !saved) {
      setHasPendingChangesForActiveSection(true);
    } else {
      setHasPendingChangesForActiveSection(
        !areFormsEqual(formRef.current, saved.form) ||
          !areCardsEqual(next, saved.cards),
      );
    }
  };

  const replaceCards = (nextCards: WebsiteContentCardState[]) => {
    // Capture before-drag state if not already set
    if (!cardsBeforeDragRef.current) {
      cardsBeforeDragRef.current = [...cardsRef.current];
    }

    setCards(nextCards);
    const saved =
      savedSectionContentBySection[activeSection as WebsiteContentSection];

    // debug logs removed

    cardsBeforeDragRef.current = null; // Clear for next drag

    if (!activeSection || !saved) {
      setHasPendingChangesForActiveSection(true);
    } else {
      setHasPendingChangesForActiveSection(
        !areFormsEqual(formRef.current, saved.form) ||
          !areCardsEqual(nextCards, saved.cards),
      );
    }
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
    const saved =
      savedSectionContentBySection[activeSection as WebsiteContentSection];
    if (!activeSection || !saved) {
      setHasPendingChangesForActiveSection(true);
    } else {
      setHasPendingChangesForActiveSection(
        !areFormsEqual(formRef.current, saved.form) ||
          !areCardsEqual(next, saved.cards),
      );
    }

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
    const saved =
      savedSectionContentBySection[activeSection as WebsiteContentSection];
    if (!activeSection || !saved) {
      setHasPendingChangesForActiveSection(true);
    } else {
      setHasPendingChangesForActiveSection(
        !areFormsEqual(formRef.current, saved.form) ||
          !areCardsEqual(nextCards, saved.cards),
      );
    }

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
    const section = activeSectionRef.current;
    if (!section) {
      return;
    }

    const nextForm = snapshotForm ?? formRef.current;
    const nextCards = snapshotCards ?? cardsRef.current;
    const normalizedCards = normalizeCardPlacements(nextCards);

    // (previous save snapshot refs removed)

    const result = await saveSection({
      section,
      form: nextForm,
      cards: normalizedCards,
    });

    if (!result.success) {
      return result;
    }

    setCards(normalizedCards);
    setHasPendingChangesForActiveSection(false);

    setSavedSectionContentBySection((prev) => ({
      ...prev,
      [section]: {
        form: nextForm,
        cards: normalizedCards,
      },
    }));

    setCachedSectionContentBySection((prev) => ({
      ...prev,
      [section]: {
        form: nextForm,
        cards: normalizedCards,
      },
    }));

    return result;
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
    saveSucceededCount,
    isLoadingSection,
    placeholders,
    sectionUpdatedAt,
    placeholdersBySection,
    updatedAtBySection,
    cardCountBySection,
    hasLoadedSectionSummaries,
    hasUnsavedChangesForActiveSection,
    secretariatCardPlacementChanged,
    boardOfTrusteesCardPlacementChanged,
  };
}
