"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { BoardOfTrusteesSection } from "../_components/sections/BoardOfTrusteesSection";
import { CompanyThrustsSection } from "../_components/sections/CompanyThrustsSection";
import { GoalsSection } from "../_components/sections/GoalsSection";
import { HeroSectionCarouselSection } from "../_components/sections/HeroSectionCarouselSection";
import { LandingBenefitsSection } from "../_components/sections/LandingBenefitsSection";
import { SecretariatSection } from "../_components/sections/SecretariatSection";
import { VisionMissionSection } from "../_components/sections/VisionMissionSection";
import type { WebsiteContentEditingFooter } from "../_components/WebsiteContentEditorDialog";
import {
  type WebsiteContentSection as WebsiteContentSectionCard,
  type WebsiteContentSectionKey,
  websiteContentSections,
} from "../_components/websiteContentSections";
import { usePendingUploadsContext } from "../_context/PendingUploadsContext";
import { useWebsiteContentEditor } from "./useWebsiteContentEditor";

export function useWebsiteContentManagementPage() {
  const [activeSection, setActiveSection] =
    useState<WebsiteContentSectionKey | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const { uploadAllPendingImages } = usePendingUploadsContext();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingFooter, setEditingFooter] = useState<
    WebsiteContentEditingFooter | undefined
  >(undefined);

  const {
    form,
    cards,
    placeholders,
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
    updatedAtBySection,
    cardCountBySection,
    hasLoadedSectionSummaries,
  } = useWebsiteContentEditor(activeSection);

  const hasSelectedCards = selectedCardEntryKeys.size > 0;
  const selectedCount = selectedCardEntryKeys.size;
  const isSectionActionDisabled = isSavingSection || isLoadingSection;
  const isSaveDisabled =
    isSavingSection || isLoadingSection || isDeleteMode || isUploadingImages;

  const selectedCard: Pick<
    WebsiteContentSectionCard,
    "title" | "description"
  > | null =
    websiteContentSections.find((section) => section.key === activeSection) ??
    null;

  const openSection = (section: WebsiteContentSectionKey) => {
    setIsDeleteConfirmOpen(false);
    setEditingFooter(undefined);
    setActiveSection(section);
  };

  const handleDeleteCardsClick = (entryKey?: string) => {
    if (entryKey) {
      setIsDeleteConfirmOpen(true);
      if (!selectedCardEntryKeys.has(entryKey) || selectedCount !== 1) {
        // Replace any existing selection so a card-level trash click deletes only that card.
        unselectAllCards();
        toggleCardSelected(entryKey, true);
      }
      return;
    }

    if (!isDeleteMode) {
      enterDeleteMode();
      return;
    }

    if (!hasSelectedCards) {
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteSelectedCards = () => {
    deleteSelectedCards();
    setIsDeleteConfirmOpen(false);
  };

  const handleEditorOpenChange = (open: boolean) => {
    if (!open) {
      cancelDeleteMode();
      setActiveSection(null);
      setEditingFooter(undefined);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSave = async () => {
    const snapshotForm = form;
    const snapshotCards = cards;
    let finalCards = snapshotCards;

    setIsUploadingImages(true);
    try {
      const uploadedImages = await uploadAllPendingImages();
      finalCards = snapshotCards.map((card) => {
        const publicUrl = uploadedImages[card.entryKey];

        if (!publicUrl) {
          return card;
        }

        return {
          ...card,
          imageUrl: publicUrl,
        };
      });

      const hasPreviewUrls = finalCards.some((card) => {
        const imageUrl = card.imageUrl.trim().toLowerCase();
        return imageUrl.startsWith("blob:") || imageUrl.startsWith("data:");
      });

      if (hasPreviewUrls) {
        console.warn(
          `Images still have preview URLs after upload: ${finalCards
            .filter((c) => {
              const imageUrl = c.imageUrl.trim().toLowerCase();
              return (
                imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")
              );
            })
            .map((c) => c.entryKey)
            .join(", ")}`,
        );
        toast.error(
          "Image upload is taking too long. Please check your connection and try again.",
        );
        return;
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
      return;
    } finally {
      setIsUploadingImages(false);
    }

    await save(finalCards, snapshotForm);
  };

  const updatedAtDisplay = (section: WebsiteContentSectionKey) => {
    if (!hasLoadedSectionSummaries) {
      return null;
    }

    const updatedAt = updatedAtBySection[section];
    if (!updatedAt) {
      return "Not updated yet";
    }

    return new Date(updatedAt).toLocaleString();
  };

  const savedCardsDisplay = (section: WebsiteContentSectionKey) => {
    if (!hasLoadedSectionSummaries) {
      return null;
    }

    return String(cardCountBySection[section] ?? 0);
  };

  const activeSectionContent: ReactNode = (() => {
    if (!activeSection) {
      return null;
    }

    switch (activeSection) {
      case "vision_mission":
        return (
          <VisionMissionSection
            missionParagraph={form.missionParagraph}
            onMissionParagraphChange={(value) =>
              setField("missionParagraph", value)
            }
            onVisionParagraphChange={(value) =>
              setField("visionParagraph", value)
            }
            placeholders={placeholders}
            visionParagraph={form.visionParagraph}
          />
        );

      case "goals":
        return (
          <GoalsSection
            cards={cards}
            hasSelectedCards={hasSelectedCards}
            isDeleteMode={isDeleteMode}
            isSectionActionDisabled={isSectionActionDisabled}
            onAddCard={() => addCard()}
            onCancelDeleteMode={cancelDeleteMode}
            onCardFieldChange={setCardField}
            onDeleteCardsClick={handleDeleteCardsClick}
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
            selectedCardEntryKeys={selectedCardEntryKeys}
            selectedCount={selectedCount}
          />
        );

      case "company_thrusts":
        return (
          <CompanyThrustsSection
            cards={cards}
            hasSelectedCards={hasSelectedCards}
            isDeleteMode={isDeleteMode}
            isSectionActionDisabled={isSectionActionDisabled}
            onAddCard={() => addCard()}
            onCancelDeleteMode={cancelDeleteMode}
            onCardFieldChange={setCardField}
            onDeleteCardsClick={handleDeleteCardsClick}
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
            selectedCardEntryKeys={selectedCardEntryKeys}
            selectedCount={selectedCount}
          />
        );

      case "board_of_trustees":
        return (
          <BoardOfTrusteesSection
            cards={cards}
            hasSelectedCards={hasSelectedCards}
            isDeleteMode={isDeleteMode}
            isSectionActionDisabled={isSectionActionDisabled}
            onAddCard={(group) => addCard(group)}
            onCancelDeleteMode={cancelDeleteMode}
            onCardFieldChange={setCardField}
            onCardsReorder={replaceCards}
            onDeleteCardsClick={handleDeleteCardsClick}
            onRegisterEditingFooter={setEditingFooter}
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
            saveSucceededCount={saveSucceededCount}
            selectedCardEntryKeys={selectedCardEntryKeys}
            selectedCount={selectedCount}
          />
        );

      case "secretariat":
        return (
          <SecretariatSection
            cards={cards}
            hasSelectedCards={hasSelectedCards}
            isDeleteMode={isDeleteMode}
            isSavingSection={isSavingSection}
            isSectionActionDisabled={isSectionActionDisabled}
            onAddCard={() => addCard()}
            onCancelDeleteMode={cancelDeleteMode}
            onCardFieldChange={setCardField}
            onCardsReorder={replaceCards}
            onDeleteCardsClick={handleDeleteCardsClick}
            onRegisterEditingFooter={setEditingFooter}
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
            saveSucceededCount={saveSucceededCount}
            selectedCardEntryKeys={selectedCardEntryKeys}
            selectedCount={selectedCount}
          />
        );

      case "landing_page_benefits":
        return (
          <LandingBenefitsSection
            cards={cards}
            hasSelectedCards={hasSelectedCards}
            isDeleteMode={isDeleteMode}
            isSectionActionDisabled={isSectionActionDisabled}
            onAddCard={() => addCard()}
            onCancelDeleteMode={cancelDeleteMode}
            onCardFieldChange={setCardField}
            onDeleteCardsClick={handleDeleteCardsClick}
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
            selectedCardEntryKeys={selectedCardEntryKeys}
            selectedCount={selectedCount}
          />
        );

      case "hero_section":
        return (
          <HeroSectionCarouselSection
            cards={cards}
            onCardFieldChange={setCardField}
            onCardsReorder={replaceCards}
          />
        );

      default:
        return null;
    }
  })();

  return {
    activeSectionContent,
    editingFooter,
    handleConfirmDeleteSelectedCards,
    handleEditorOpenChange,
    handleSave,
    hasSelectedCards,
    isEditorOpen: Boolean(activeSection),
    isDeleteConfirmOpen,
    isLoadingSection,
    isSaveDisabled,
    isSavingSection,
    isSectionActionDisabled,
    isUploadingImages,
    openSection,
    savedCardsDisplay,
    selectedCard,
    selectedCount,
    setIsDeleteConfirmOpen,
    updatedAtDisplay,
  };
}
