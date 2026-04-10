"use client";

import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import { Input } from "@/components/ui/input";
import type { SecretariatSectionProps } from "../../_types/section-props";

function reorderInList<T extends { entryKey: string }>(
  list: T[],
  activeId: string,
  overId: string,
) {
  const from = list.findIndex((item) => item.entryKey === activeId);
  const to = list.findIndex((item) => item.entryKey === overId);

  if (from < 0 || to < 0 || from === to) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function SecretariatSection({
  cards,
  placeholders,
  isPlacementMode,
  onCardFieldChange,
  onCardsReorder,
}: SecretariatSectionProps) {
  const handleImageSelect =
    (entryKey: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        onCardFieldChange(entryKey, "imageUrl", result);
      };
      reader.readAsDataURL(file);
    };

  const handleDrop = (event: DragEvent<HTMLElement>, overEntryKey: string) => {
    event.preventDefault();
    if (!isPlacementMode) {
      return;
    }

    const activeEntryKey = event.dataTransfer.getData("text/plain");
    if (!activeEntryKey) {
      return;
    }

    const reordered = reorderInList(cards, activeEntryKey, overEntryKey);
    const nextCards = reordered.map((card, index) => ({
      ...card,
      cardPlacement: String(index + 1),
    }));

    onCardsReorder(nextCards);
  };

  const renderCardContent = (card: (typeof cards)[number], index: number) => (
    <>
      <p className="mb-3 font-semibold text-sm">Secretariat Card {index + 1}</p>

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
              className="inline-flex w-fit cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm hover:bg-accent hover:text-accent-foreground"
              htmlFor={`secretariat-image-${card.entryKey}`}
            >
              Add Image
            </label>
            <input
              accept="image/*"
              className="hidden"
              id={`secretariat-image-${card.entryKey}`}
              onChange={handleImageSelect(card.entryKey)}
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
    </>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, index) => {
        if (isPlacementMode) {
          return (
            <button
              className="aspect-[1/1.05] cursor-move rounded-lg border border-border p-4 text-left"
              draggable
              key={card.entryKey}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", card.entryKey);
              }}
              onDrop={(event) => handleDrop(event, card.entryKey)}
              type="button"
            >
              <p className="mb-3 font-semibold text-sm">
                Secretariat Card {index + 1}
              </p>
              <p className="rounded-md border border-border border-dashed px-3 py-2 text-muted-foreground text-xs">
                Drag to reorder this card.
              </p>
            </button>
          );
        }

        return (
          <div
            className="aspect-[1/1.05] rounded-lg border border-border p-4"
            key={card.entryKey}
          >
            {renderCardContent(card, index)}
          </div>
        );
      })}
    </div>
  );
}
