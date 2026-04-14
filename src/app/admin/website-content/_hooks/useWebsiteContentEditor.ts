"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { getWebsiteContentSection } from "@/server/website-content/actions/getWebsiteContentSection";
import { saveWebsiteContentSection } from "@/server/website-content/actions/saveWebsiteContentSection";
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

export function useWebsiteContentEditor(
  activeSection: WebsiteContentSection | null,
) {
  const [form, setForm] = useState<WebsiteContentFormState>(emptyForm);
  const [cards, setCards] = useState<WebsiteContentCardState[]>([]);
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

  const { execute: loadSection, isPending: isLoadingSection } = useAction(
    tryCatch(getWebsiteContentSection),
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
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const { execute: saveSection, isPending: isSavingSection } = useAction(
    tryCatch(saveWebsiteContentSection),
    {
      onSuccess: async (result: { updatedAt: string }) => {
        if (activeSection) {
          setUpdatedAtBySection((prev) => ({
            ...prev,
            [activeSection]: result.updatedAt,
          }));
          await loadSection(activeSection);
        }
        toast.success("Website content saved");
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  useEffect(() => {
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

      const next = [
        ...prev,
        {
          entryKey,
          title: "",
          subtitle: "",
          paragraph: "",
          icon: "",
          imageUrl: "",
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
    save,
    isSavingSection,
    isLoadingSection,
    placeholders,
    sectionUpdatedAt,
    placeholdersBySection,
    updatedAtBySection,
  };
}
