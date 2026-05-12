"use client";

import { PendingUploadsProvider } from "../_context/PendingUploadsContext";
import { useWebsiteContentManagementPage } from "../_hooks/useWebsiteContentManagementPage";
import { DeleteSelectedCardsDialog } from "./DeleteSelectedCardsDialog";
import { WebsiteContentEditorDialog } from "./WebsiteContentEditorDialog";
import { WebsiteContentSectionCardsGrid } from "./WebsiteContentSectionCardsGrid";
import { websiteContentSections } from "./websiteContentSections";

export function WebsiteContentManagementPage() {
  return (
    <PendingUploadsProvider>
      <WebsiteContentManagementPageContent />
    </PendingUploadsProvider>
  );
}

function WebsiteContentManagementPageContent() {
  const {
    activeSectionContent,
    editingFooter,
    handleConfirmDeleteSelectedCards,
    handleEditorOpenChange,
    handleSave,
    hasSelectedCards,
    isDeleteConfirmOpen,
    isEditorOpen,
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
  } = useWebsiteContentManagementPage();

  return (
    <section className="space-y-6 px-2">
      <header className="space-y-2">
        <h1 className="font-bold text-3xl text-foreground">
          Website Content Management
        </h1>
        <p className="text-muted-foreground">
          Click a section card to edit content in a modal.
        </p>
      </header>

      <WebsiteContentSectionCardsGrid
        getSavedCardsDisplay={savedCardsDisplay}
        getUpdatedAtDisplay={updatedAtDisplay}
        onOpenSection={openSection}
        sections={websiteContentSections}
      />

      <WebsiteContentEditorDialog
        editingFooter={editingFooter}
        isLoadingSection={isLoadingSection}
        isSaveDisabled={isSaveDisabled}
        isSavingSection={isSavingSection}
        isSectionActionDisabled={isSectionActionDisabled}
        isUploadingImages={isUploadingImages}
        onOpenChange={handleEditorOpenChange}
        onSave={handleSave}
        open={isEditorOpen}
        selectedCard={selectedCard}
      >
        {activeSectionContent}
      </WebsiteContentEditorDialog>

      <DeleteSelectedCardsDialog
        hasSelectedCards={hasSelectedCards}
        onConfirmDelete={handleConfirmDeleteSelectedCards}
        onOpenChange={setIsDeleteConfirmOpen}
        open={isDeleteConfirmOpen}
        selectedCount={selectedCount}
      />
    </section>
  );
}
