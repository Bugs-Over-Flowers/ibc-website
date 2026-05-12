"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type {
  WebsiteContentCardState,
  WebsiteContentFormState,
  WebsiteContentSection,
} from "@/server/website-content/types";
import {
  defaultCardsBySection,
  normalizeCardPlacements,
  type WebsiteContentSectionSnapshotsBySection,
} from "./websiteContentEditor.utils";

type UseWebsiteContentEditorActionsParams = {
  activeSection: WebsiteContentSection | null;
  form: WebsiteContentFormState;
  cards: WebsiteContentCardState[];
  setForm: Dispatch<SetStateAction<WebsiteContentFormState>>;
  setCards: Dispatch<SetStateAction<WebsiteContentCardState[]>>;
  setCachedSectionContentBySection: Dispatch<
    SetStateAction<WebsiteContentSectionSnapshotsBySection>
  >;
};

export function useWebsiteContentEditorActions({
  activeSection,
  cards,
  form,
  setCachedSectionContentBySection,
  setCards,
  setForm,
}: UseWebsiteContentEditorActionsParams) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCardEntryKeys, setSelectedCardEntryKeys] = useState<
    Set<string>
  >(() => new Set());

  const updateCachedSection = (
    nextForm: WebsiteContentFormState,
    nextCards: WebsiteContentCardState[],
  ) => {
    if (!activeSection) {
      return;
    }

    setCachedSectionContentBySection((prev) => ({
      ...prev,
      [activeSection]: {
        form: nextForm,
        cards: nextCards,
      },
    }));
  };

  const setField = <K extends keyof WebsiteContentFormState>(
    field: K,
    value: WebsiteContentFormState[K],
  ) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    updateCachedSection(nextForm, cards);
  };

  const setCardField = (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => {
    const nextCards = cards.map((card) =>
      card.entryKey === entryKey ? { ...card, [field]: value } : card,
    );
    setCards(nextCards);
    updateCachedSection(form, nextCards);
  };

  const replaceCards = (nextCards: WebsiteContentCardState[]) => {
    setCards(nextCards);
    updateCachedSection(form, nextCards);
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

    const nextCards: WebsiteContentCardState[] = [
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

    setCards(nextCards);
    updateCachedSection(form, nextCards);
  };

  const enterDeleteMode = () => {
    setIsDeleteMode(true);
  };

  const cancelDeleteMode = () => {
    setIsDeleteMode(false);
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
    const nextCards = normalizeCardPlacements(filtered, activeSection);

    setCards(nextCards);
    updateCachedSection(form, nextCards);

    setSelectedCardEntryKeys(new Set());
    setIsDeleteMode(false);
  };

  return {
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
  };
}
