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
import { useWebsiteContentEditorActions } from "./useWebsiteContentEditorActions";
import {
  emptyForm,
  normalizeCardPlacements,
  type WebsiteContentSectionSnapshotsBySection,
} from "./websiteContentEditor.utils";

export function useWebsiteContentEditor(
  activeSection: WebsiteContentSection | null,
) {
  const [form, setForm] = useState<WebsiteContentFormState>(emptyForm);
  const [cards, setCards] = useState<WebsiteContentCardState[]>([]);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const formRef = useRef(form);
  formRef.current = form;
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;
  const [cachedSectionContentBySection, setCachedSectionContentBySection] =
    useState<WebsiteContentSectionSnapshotsBySection>({});
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
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const [saveSucceededCount, setSaveSucceededCount] = useState(0);
  const lastRequestedSectionRef = useRef<WebsiteContentSection | null>(null);
  const loadSectionRequestIdRef = useRef(0);

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

  const applyLoadedSectionData = (
    section: WebsiteContentSection,
    data: WebsiteContentSectionData,
  ) => {
    setForm(data.form);
    setCards(data.cards);
    setCachedSectionContentBySection((prev) => ({
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
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only run on section switch, not on every cache mutation
  useEffect(() => {
    const requestId = loadSectionRequestIdRef.current + 1;
    loadSectionRequestIdRef.current = requestId;

    if (!activeSection) {
      lastRequestedSectionRef.current = null;
      setIsLoadingSection(false);
      return;
    }

    lastRequestedSectionRef.current = activeSection;

    const cachedSection = cachedSectionContentBySection[activeSection];
    if (cachedSection) {
      setForm(cachedSection.form);
      setCards(cachedSection.cards);
      setIsLoadingSection(false);
      return;
    }

    setIsLoadingSection(true);

    void (async () => {
      const result = await getWebsiteContentSectionAction(activeSection);

      if (requestId !== loadSectionRequestIdRef.current) {
        return;
      }

      if (lastRequestedSectionRef.current !== activeSection) {
        return;
      }

      if (!result.success) {
        toast.error(result.error);
        setForm(emptyForm);
        setCards([]);
        setIsLoadingSection(false);
        return;
      }

      applyLoadedSectionData(activeSection, result.data);
      setIsLoadingSection(false);
    })();
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

  const {
    addCard,
    cancelDeleteMode,
    deleteSelectedCards,
    enterDeleteMode,
    isDeleteMode,
    replaceCards,
    selectedCardEntryKeys,
    selectAllCards,
    setCardField,
    setField,
    toggleCardSelected,
    unselectAllCards,
  } = useWebsiteContentEditorActions({
    activeSection,
    cards,
    form,
    setCachedSectionContentBySection,
    setCards,
    setForm,
  });

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
    const normalizedCards = normalizeCardPlacements(nextCards, section);

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
  };
}
