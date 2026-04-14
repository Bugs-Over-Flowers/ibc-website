"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reorderInList } from "../../_hooks/reorderInList";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
import type { SecretariatSectionProps } from "../../_types/section-props";

export function SecretariatSection({
  cards,
  placeholders,
  onAddCard,
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

    return (
      <div
        className="aspect-[1/1.05] rounded-lg border border-border p-4"
        ref={ref}
        style={{ opacity: isDragSource ? 0.65 : 1 }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-semibold text-sm">Secretariat Card {index + 1}</p>
          <button
            aria-label="Drag card"
            className="cursor-grab rounded-md border border-border p-1 text-muted-foreground active:cursor-grabbing"
            ref={handleRef}
            type="button"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="space-y-2">
            <p className="font-medium text-sm">Card Title</p>
            <Input
              onChange={(event) =>
                onCardFieldChange(card.entryKey, "title", event.target.value)
              }
              placeholder={placeholders.title || "Herminia Ore"}
              value={card.title}
            />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">Card Subtitle</p>
            <Input
              onChange={(event) =>
                onCardFieldChange(card.entryKey, "subtitle", event.target.value)
              }
              placeholder={
                placeholders.subtitle || "Finance, Marketing, and Promotion"
              }
              value={card.subtitle}
            />
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
                accept="image/*"
                className="hidden"
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
      <div className="flex justify-end">
        <Button onClick={onAddCard} type="button" variant="outline">
          Add Card
        </Button>
      </div>
      <DragDropProvider
        onDragEnd={(event) => {
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
