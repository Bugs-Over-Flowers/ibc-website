"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { GoalsSectionProps } from "../../_types/sectionProps";
import { LucideIconPicker } from "../LucideIconPicker";
import { MarkdownTextarea } from "../RichTextEditorField";

export function GoalsSection({
  cards,
  placeholders,
  isSectionActionDisabled,
  isDeleteMode,
  hasSelectedCards,
  selectedCount,
  selectedCardEntryKeys,
  onAddCard,
  onDeleteCardsClick,
  onCancelDeleteMode,
  onSelectAllCards,
  onUnselectAllCards,
  onToggleCardSelected,
  onCardFieldChange,
}: GoalsSectionProps) {
  const GoalCardForm = ({
    card,
    index,
  }: {
    card: (typeof cards)[number];
    index: number;
  }) => {
    const form = useForm({
      defaultValues: {
        title: card.title,
        paragraph: card.paragraph,
        icon: card.icon,
      },
    });

    useEffect(() => {
      form.setFieldValue("title", card.title);
      form.setFieldValue("paragraph", card.paragraph);
      form.setFieldValue("icon", card.icon);
    }, [card.icon, card.paragraph, card.title, form]);

    const isSelected = selectedCardEntryKeys.has(card.entryKey);

    return (
      <div className="relative overflow-hidden rounded-lg border border-border p-4">
        {isDeleteMode ? (
          <>
            <button
              aria-label={`Toggle goal card ${index + 1} selection`}
              className="absolute inset-0 z-10 bg-white/50"
              onClick={() => onToggleCardSelected(card.entryKey, !isSelected)}
              type="button"
            />
            <div className="absolute top-3 right-3 z-20">
              <Checkbox
                aria-label={`Select goal card ${index + 1}`}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onToggleCardSelected(card.entryKey, checked === true)
                }
              />
            </div>
          </>
        ) : null}

        <div
          className={`flex flex-col gap-4 ${isDeleteMode ? "pointer-events-none select-none" : ""}`}
        >
          <p className="font-semibold text-sm">Goal Card {index + 1}</p>
          <div className="space-y-4">
            <div className="flex flex-row gap-4">
              <div className="pr-1">
                <form.Field name="icon">
                  {(field) => (
                    <LucideIconPicker
                      disabled={isDeleteMode}
                      onSelect={(value) => {
                        field.handleChange(value);
                        onCardFieldChange(card.entryKey, "icon", value);
                      }}
                      selectedIcon={field.state.value}
                    />
                  )}
                </form.Field>
              </div>

              <div className="w-full space-y-2">
                <p className="font-medium text-sm">Goal Title</p>
                <form.Field name="title">
                  {(field) => (
                    <Input
                      className="truncate"
                      disabled={isDeleteMode}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.handleChange(value);
                        onCardFieldChange(card.entryKey, "title", value);
                      }}
                      placeholder={
                        placeholders.title || "Increase Trailblazer Companies"
                      }
                      value={field.state.value}
                    />
                  )}
                </form.Field>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-sm">Goal Paragraph</p>
              <form.Field name="paragraph">
                {(field) => (
                  <MarkdownTextarea
                    disabled={isDeleteMode}
                    onChange={(value) => {
                      field.handleChange(value);
                      onCardFieldChange(card.entryKey, "paragraph", value);
                    }}
                    placeholder={
                      placeholders.paragraph || "Enter goal description"
                    }
                    rows={10}
                    value={field.state.value}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isDeleteMode ? (
          <>
            <Button
              disabled={isSectionActionDisabled || cards.length === 0}
              onClick={onSelectAllCards}
              type="button"
              variant="ghost"
            >
              Select All
            </Button>
            <Button
              disabled={isSectionActionDisabled || selectedCount === 0}
              onClick={onUnselectAllCards}
              type="button"
              variant="ghost"
            >
              Unselect All
            </Button>
            <Button
              disabled={isSectionActionDisabled}
              onClick={onCancelDeleteMode}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </>
        ) : null}
        <Button
          disabled={isSectionActionDisabled || isDeleteMode}
          onClick={onAddCard}
          type="button"
          variant="outline"
        >
          Add Card
        </Button>
        <Button
          disabled={
            isSectionActionDisabled || (isDeleteMode && !hasSelectedCards)
          }
          onClick={onDeleteCardsClick}
          type="button"
          variant={isDeleteMode ? "destructive" : "outline"}
        >
          {isDeleteMode ? "Confirm Delete" : "Delete Cards"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card, index) => (
          <GoalCardForm card={card} index={index} key={card.entryKey} />
        ))}
      </div>
    </div>
  );
}
