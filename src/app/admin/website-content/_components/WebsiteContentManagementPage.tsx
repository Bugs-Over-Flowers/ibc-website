"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Building2,
  Compass,
  Landmark,
  Sparkles,
  Target,
  Users,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebsiteContentEditor } from "../_hooks/useWebsiteContentEditor";
import { BoardOfTrusteesSection } from "./sections/BoardOfTrusteesSection";
import { CompanyThrustsSection } from "./sections/CompanyThrustsSection";
import { GoalsSection } from "./sections/GoalsSection";
import { LandingBenefitsSection } from "./sections/LandingBenefitsSection";
import { SecretariatSection } from "./sections/SecretariatSection";
import { VisionMissionSection } from "./sections/VisionMissionSection";

type SectionKey =
  | "vision_mission"
  | "goals"
  | "company_thrusts"
  | "board_of_trustees"
  | "secretariat"
  | "landing_page_benefits";

const sectionCards = [
  {
    key: "vision_mission" as const,
    title: "Vision and Mission",
    description: "Paragraph content for organization vision and mission.",
    accentClass: "bg-sky-500",
    iconClass: "bg-sky-50 text-sky-600",
    icon: Compass,
  },
  {
    key: "goals" as const,
    title: "Goals",
    description: "Title, paragraph, and icon setup for goals section cards.",
    accentClass: "bg-emerald-500",
    iconClass: "bg-emerald-50 text-emerald-600",
    icon: Target,
  },
  {
    key: "company_thrusts" as const,
    title: "Company Thrusts",
    description: "Title, paragraph, and icon values for thrust items.",
    accentClass: "bg-amber-500",
    iconClass: "bg-amber-50 text-amber-600",
    icon: Building2,
  },
  {
    key: "board_of_trustees" as const,
    title: "Board of Trustees",
    description: "Manage title, subtitle, image, and optional card placement.",
    accentClass: "bg-rose-500",
    iconClass: "bg-rose-50 text-rose-600",
    icon: Landmark,
  },
  {
    key: "secretariat" as const,
    title: "Secretariat",
    description: "Manage title, subtitle, and image for staff cards.",
    accentClass: "bg-cyan-500",
    iconClass: "bg-cyan-50 text-cyan-600",
    icon: Users,
  },
  {
    key: "landing_page_benefits" as const,
    title: "Landing Page Benefits",
    description: "Set title, paragraph copy, and icon for home benefits.",
    accentClass: "bg-indigo-500",
    iconClass: "bg-indigo-50 text-indigo-600",
    icon: Sparkles,
  },
];

export function WebsiteContentManagementPage() {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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
    isLoadingSection,
    updatedAtBySection,
    cardCountBySection,
    hasLoadedSectionSummaries,
  } = useWebsiteContentEditor(activeSection);

  const hasSelectedCards = selectedCardEntryKeys.size > 0;
  const selectedCount = selectedCardEntryKeys.size;
  const isSectionActionDisabled = isSavingSection || isLoadingSection;

  const handleDeleteCardsClick = () => {
    if (!isDeleteMode) {
      enterDeleteMode();
      return;
    }

    if (!hasSelectedCards) {
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const selectedCard = useMemo(
    () => sectionCards.find((section) => section.key === activeSection) ?? null,
    [activeSection],
  );

  const updatedAtDisplay = (section: SectionKey) => {
    if (!hasLoadedSectionSummaries) {
      return "Loading...";
    }

    const updatedAt = updatedAtBySection[section];
    if (!updatedAt) {
      return "Not updated yet";
    }

    return new Date(updatedAt).toLocaleString();
  };

  const savedCardsDisplay = (section: SectionKey) => {
    if (!hasLoadedSectionSummaries) {
      return "Loading...";
    }

    return String(cardCountBySection[section] ?? 0);
  };

  const renderActiveForm = () => {
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
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
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
            isSectionActionDisabled={isSectionActionDisabled}
            onAddCard={() => addCard()}
            onCancelDeleteMode={cancelDeleteMode}
            onCardFieldChange={setCardField}
            onCardsReorder={replaceCards}
            onDeleteCardsClick={handleDeleteCardsClick}
            onSelectAllCards={selectAllCards}
            onToggleCardSelected={toggleCardSelected}
            onUnselectAllCards={unselectAllCards}
            placeholders={placeholders}
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

      default:
        return null;
    }
  };

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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sectionCards.map((section) => {
          const Icon = section.icon;

          return (
            <button
              className="group text-left"
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              type="button"
            >
              <Card className="relative h-full overflow-hidden border border-border/80 bg-card/95 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${section.accentClass}`}
                />
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2.5 ${section.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground text-sm">
                  <p>Saved cards: {savedCardsDisplay(section.key)}</p>
                  <p>Updated: {updatedAtDisplay(section.key)}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <DialogPrimitive.Root
        onOpenChange={(open) => {
          if (!open) {
            cancelDeleteMode();
            setActiveSection(null);
          }
        }}
        open={!!activeSection}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
          <DialogPrimitive.Viewport className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6">
            <div className="flex min-h-full items-start justify-center py-3">
              <DialogPrimitive.Popup className="relative flex max-h-[calc(100vh-2rem)] w-[min(97vw,1550px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                <DialogPrimitive.Close
                  className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  render={<button type="button" />}
                >
                  <XIcon className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>

                <div className="space-y-1.5 border-border border-b px-6 py-5 pr-12 sm:px-7">
                  <DialogPrimitive.Title className="font-bold text-4xl text-foreground">
                    {selectedCard?.title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-base text-muted-foreground">
                    {selectedCard?.description}
                  </DialogPrimitive.Description>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">
                  <div className="space-y-4">
                    {isLoadingSection ? (
                      <p className="text-muted-foreground text-sm">
                        Loading content...
                      </p>
                    ) : (
                      renderActiveForm()
                    )}
                  </div>
                </div>

                <div className="border-border border-t bg-background px-6 py-4 sm:px-7">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      disabled={
                        isSavingSection || isLoadingSection || isDeleteMode
                      }
                      onClick={save}
                    >
                      {isSavingSection ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </DialogPrimitive.Popup>
            </div>
          </DialogPrimitive.Viewport>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <AlertDialog
        onOpenChange={setIsDeleteConfirmOpen}
        open={isDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected cards?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedCardEntryKeys.size} selected card
              {selectedCardEntryKeys.size === 1 ? "" : "s"} from the editor.
              Click Save Changes to persist this deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!hasSelectedCards}
              onClick={() => {
                deleteSelectedCards();
                setIsDeleteConfirmOpen(false);
              }}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
