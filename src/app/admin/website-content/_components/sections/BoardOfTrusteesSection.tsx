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
import { reorderInList } from "../../_hooks/reorderInList";
import { useBoardCardGroups } from "../../_hooks/useBoardCardGroups";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
import type { BoardOfTrusteesSectionProps } from "../../_types/sectionProps";

type BoardGroup = "featured" | "officers" | "trustees" | "other";

export function BoardOfTrusteesSection({
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
}: BoardOfTrusteesSectionProps) {
  const { createImageSelectHandler } = usePersonalImageUpload({
    basePath: "website-content/board",
    onUploaded: (entryKey, publicUrl) => {
      onCardFieldChange(entryKey, "imageUrl", publicUrl);
    },
  });
  const { featuredCards, officerCards, trusteeCards, otherCards } =
    useBoardCardGroups(cards);

  const handleGroupReorder = (
    group: BoardGroup,
    activeEntryKey: string,
    overEntryKey: string,
  ) => {
    const groupOrder: BoardGroup[] = [
      "featured",
      "officers",
      "trustees",
      "other",
    ];
    const grouped = {
      featured: [...featuredCards],
      officers: [...officerCards],
      trustees: [...trusteeCards],
      other: [...otherCards],
    };

    grouped[group] = reorderInList(
      grouped[group],
      activeEntryKey,
      overEntryKey,
    );

    const merged = groupOrder.flatMap((groupKey) => grouped[groupKey]);
    const nextCards = merged.map((card, index) => ({
      ...card,
      cardPlacement: String(index + 1),
    }));

    onCardsReorder(nextCards);
  };

  const SortableCard = ({
    card,
    group,
    label,
    index,
  }: {
    card: (typeof cards)[number];
    group: BoardGroup;
    label: string;
    index: number;
  }) => {
    const { ref, handleRef, isDragSource } = useSortable({
      id: card.entryKey,
      index,
      group,
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
        className="relative aspect-[1/1.05] w-full overflow-hidden rounded-lg border border-border p-4 sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
        ref={ref}
        style={{ opacity: isDragSource ? 0.65 : 1 }}
      >
        {isDeleteMode ? (
          <>
            <button
              aria-label={`Toggle ${label.toLowerCase()} card ${index + 1} selection`}
              className="absolute inset-0 z-10 bg-white/50"
              onClick={() => onToggleCardSelected(card.entryKey, !isSelected)}
              type="button"
            />
            <div className="absolute top-3 right-3 z-20">
              <Checkbox
                aria-label={`Select ${label.toLowerCase()} card ${index + 1}`}
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
              {label} {index + 1}
            </p>
            <div className="flex items-center gap-2">
              {card.group ? (
                <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase">
                  {card.group}
                </span>
              ) : null}
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
                  placeholder={placeholders.title || "Juan Jose Jamora III"}
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
                  placeholder={placeholders.subtitle || "Chairman Emeritus"}
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
                htmlFor={`board-image-${card.entryKey}`}
              >
                Insert Image Here
              </label>
              <input
                accept="image/*"
                className="hidden"
                disabled={isDeleteMode}
                id={`board-image-${card.entryKey}`}
                onChange={createImageSelectHandler(card.entryKey)}
                type="file"
              />
              {card.imageUrl ? (
                <Image
                  alt={`${card.title || "Board member"} preview`}
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

  const renderSection = (
    group: BoardGroup,
    title: string,
    cardLabel: string,
    groupCards: (typeof cards)[number][],
    showDeleteActions = false,
  ) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showDeleteActions && isDeleteMode ? (
            <>
              <Button
                disabled={isSectionActionDisabled || cards.length === 0}
                onClick={onSelectAllCards}
                size="sm"
                type="button"
                variant="ghost"
              >
                Select All
              </Button>
              <Button
                disabled={isSectionActionDisabled || selectedCount === 0}
                onClick={onUnselectAllCards}
                size="sm"
                type="button"
                variant="ghost"
              >
                Unselect All
              </Button>
              <Button
                disabled={isSectionActionDisabled}
                onClick={onCancelDeleteMode}
                size="sm"
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </>
          ) : null}
          <Button
            disabled={isSectionActionDisabled || isDeleteMode}
            onClick={() => onAddCard(group)}
            size="sm"
            type="button"
            variant="outline"
          >
            Add Card
          </Button>
          {showDeleteActions ? (
            <Button
              disabled={
                isSectionActionDisabled || (isDeleteMode && !hasSelectedCards)
              }
              onClick={onDeleteCardsClick}
              size="sm"
              type="button"
              variant={isDeleteMode ? "destructive" : "outline"}
            >
              {isDeleteMode ? "Confirm Delete" : "Delete Cards"}
            </Button>
          ) : null}
        </div>
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

          handleGroupReorder(group, activeEntryKey, overEntryKey);
        }}
      >
        <div className="flex flex-wrap justify-center gap-4">
          {groupCards.map((card, index) => (
            <SortableCard
              card={card}
              group={group}
              index={index}
              key={card.entryKey}
              label={cardLabel}
            />
          ))}
        </div>
      </DragDropProvider>
    </section>
  );

  return (
    <div className="space-y-6">
      {renderSection("featured", "Featured", "Featured", featuredCards, true)}
      {renderSection("officers", "Officers", "Officer", officerCards)}
      {renderSection("trustees", "Trustees", "Trustee", trusteeCards)}
      {renderSection("other", "Others", "Board Card", otherCards)}
    </div>
  );
}
