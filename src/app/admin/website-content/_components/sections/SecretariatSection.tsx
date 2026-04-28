"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import { useForm } from "@tanstack/react-form";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { IMAGE_UPLOAD_ACCEPT_ATTR } from "@/lib/fileUpload";
import { reorderInList } from "../../_hooks/reorderInList";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
import type { SecretariatSectionProps } from "../../_types/sectionProps";

export function SecretariatSection({
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
  onCardsReorder,
}: SecretariatSectionProps) {
  const { createImageSelectHandler } = usePersonalImageUpload({
    basePath: "website-content/secretariat",
    onUploaded: (entryKey, publicUrl) => {
      onCardFieldChange(entryKey, "imageUrl", publicUrl);
    },
  });

  const SortableCard = ({
    card,
    index,
  }: {
    card: (typeof cards)[number];
    index: number;
  }) => {
    const { ref, handleRef, isDragSource } = useSortable({
      id: card.entryKey,
      index,
      group: "secretariat",
    });

    const form = useForm({
      defaultValues: {
        title: card.title,
        subtitle: card.subtitle,
      },
    });

    useEffect(() => {
      form.setFieldValue("title", card.title);
      form.setFieldValue("subtitle", card.subtitle);
    }, [card.subtitle, card.title, form]);

    const isSelected = selectedCardEntryKeys.has(card.entryKey);

    return (
      <div
        className="relative aspect-[1/1.05] overflow-hidden rounded-lg border border-border p-4"
        ref={ref}
        style={{ opacity: isDragSource ? 0.65 : 1 }}
      >
        {isDeleteMode ? (
          <>
            <button
              aria-label={`Toggle secretariat card ${index + 1} selection`}
              className="absolute inset-0 z-10 bg-white/50"
              onClick={() => onToggleCardSelected(card.entryKey, !isSelected)}
              type="button"
            />
            <div className="absolute top-3 right-3 z-20">
              <Checkbox
                aria-label={`Select secretariat card ${index + 1}`}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onToggleCardSelected(card.entryKey, checked === true)
                }
              />
            </div>
          </>
        ) : null}

        <div
          className={`flex flex-col gap-3 ${isDeleteMode ? "pointer-events-none select-none" : ""}`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">
              Secretariat Card {index + 1}
            </p>
            {!isDeleteMode ? (
              <button
                aria-label="Drag card"
                className="cursor-grab rounded-md border border-border p-1 text-muted-foreground active:cursor-grabbing"
                ref={handleRef}
                type="button"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Card Title</p>
            <form.Field name="title">
              {(field) => (
                <Input
                  disabled={isDeleteMode}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.handleChange(value);
                    onCardFieldChange(card.entryKey, "title", value);
                  }}
                  placeholder={placeholders.title || "Herminia Ore"}
                  value={field.state.value}
                />
              )}
            </form.Field>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">Card Subtitle</p>
            <form.Field name="subtitle">
              {(field) => (
                <Input
                  disabled={isDeleteMode}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.handleChange(value);
                    onCardFieldChange(card.entryKey, "subtitle", value);
                  }}
                  placeholder={
                    placeholders.subtitle || "Finance, Marketing, and Promotion"
                  }
                  value={field.state.value}
                />
              )}
            </form.Field>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">Image</p>
            <div className="flex flex-col gap-2">
              <label
                className="flex h-24 w-full cursor-pointer items-center justify-center rounded-md border border-border border-dashed bg-muted/30 px-4 py-2 text-center font-medium text-muted-foreground text-sm transition-colors hover:border-primary hover:bg-muted"
                htmlFor={`secretariat-image-${card.entryKey}`}
              >
                Insert Image Here
              </label>
              <input
                accept={IMAGE_UPLOAD_ACCEPT_ATTR}
                className="hidden"
                disabled={isDeleteMode}
                id={`secretariat-image-${card.entryKey}`}
                onChange={createImageSelectHandler(card.entryKey)}
                type="file"
              />
              {card.imageUrl ? (
                <Image
                  alt={`${card.title || "Secretariat member"} preview`}
                  className="h-20 w-20 rounded-md border border-border object-cover"
                  height={80}
                  src={card.imageUrl}
                  unoptimized
                  width={80}
                />
              ) : null}
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
      <DragDropProvider
        onDragEnd={(event) => {
          if (isDeleteMode) {
            return;
          }

          if (event.canceled || !isSortableOperation(event.operation)) {
            return;
          }

          if (!event.operation.source) {
            return;
          }

          const activeEntryKey = String(event.operation.source.id);
          const overEntryKey = String(event.operation.target?.id ?? "");

          if (
            !activeEntryKey ||
            !overEntryKey ||
            activeEntryKey === overEntryKey
          ) {
            return;
          }

          const reordered = reorderInList(cards, activeEntryKey, overEntryKey);
          const nextCards = reordered.map((card, index) => ({
            ...card,
            cardPlacement: String(index + 1),
          }));

          onCardsReorder(nextCards);
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card, index) => (
            <SortableCard card={card} index={index} key={card.entryKey} />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
