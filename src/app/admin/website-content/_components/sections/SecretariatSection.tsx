"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import { ArrowLeft, GripVertical, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reorderInList } from "../../_hooks/reorderInList";
import type { SecretariatSectionProps } from "../../_types/sectionProps";

export function SecretariatSection({
  cards,
  placeholders,
  isSectionActionDisabled,
  onAddCard,
  onDeleteCardsClick,
  onToggleCardSelected,
  onCardFieldChange,
  onCardsReorder,
}: SecretariatSectionProps) {
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);

  const handleDeleteCard = (entryKey: string) => {
    onToggleCardSelected(entryKey, true);
    onDeleteCardsClick();
  };

  const editingCard = cards.find((c) => c.entryKey === editingCardKey);
  const editingCardIndex = cards.findIndex(
    (c) => c.entryKey === editingCardKey,
  );

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
        className="group relative overflow-hidden rounded-md border border-border bg-background"
        ref={ref}
        style={{
          opacity: isDragSource ? 0.6 : 1,
          touchAction: "none",
        }}
      >
        {/* DRAG HANDLE */}
        <button
          className="absolute top-2 right-2 z-10 cursor-grab rounded-md border border-border bg-background/80 p-1 text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          ref={handleRef}
          type="button"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* IMAGE + TEXT */}
        <div className="flex flex-col items-center p-4">
          <div className="relative mb-3 flex aspect-square w-full items-center justify-center rounded-md bg-primary/5">
            {card.imageUrl ? (
              <Image
                alt={`${card.title || "Secretariat member"} preview`}
                className="h-20 w-20 rounded-md border border-border object-cover"
                height={80}
                src={card.imageUrl}
                unoptimized
                width={80}
              />
            ) : (
              <User className="h-8 w-8 text-primary/30" />
            )}
          </div>

          <h3 className="font-semibold text-xs">
            {card.title || "Secretariat member"}
          </h3>
          <p className="text-[10px] text-primary">
            {card.subtitle || "Subtitle"}
          </p>
        </div>
      </div>
    );
  };

  const Form = ({ card }: { card: (typeof cards)[number] }) => (
    <div className="space-y-3">
      <Input
        onChange={(e) =>
          onCardFieldChange(card.entryKey, "title", e.target.value)
        }
        placeholder={placeholders.title}
        value={card.title}
      />
      <Input
        onChange={(e) =>
          onCardFieldChange(card.entryKey, "subtitle", e.target.value)
        }
        placeholder={placeholders.subtitle}
        value={card.subtitle}
      />
    </div>
  );

  return (
    <>
      {editingCard ? (
        <div className="space-y-4">
          {/* BACK BUTTON (ADDED) */}
          <div className="flex items-center justify-start">
            <Button
              className="gap-2"
              disabled={isSectionActionDisabled}
              onClick={() => setEditingCardKey(null)}
              type="button"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Secretariats
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* FORM */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">
                  Card {editingCardIndex + 1}
                </p>

                <Button
                  onClick={() => handleDeleteCard(editingCard.entryKey)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Form card={editingCard} />
            </div>

            {/* PREVIEW */}
            <Card className="flex items-center justify-center">
              <CardContent className="p-4">
                <div className="w-[180px] overflow-hidden rounded-md border">
                  <div className="relative aspect-square">
                    {editingCard.imageUrl ? (
                      <Image
                        alt="preview"
                        className="object-cover"
                        fill
                        src={editingCard.imageUrl}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/5">
                        <User className="h-8 w-8 text-primary/30" />
                      </div>
                    )}
                  </div>

                  <div className="p-2 text-center">
                    <p className="font-semibold text-xs">
                      {editingCard.title || "Secretariat member"}
                    </p>
                    <p className="text-[10px] text-primary">
                      {editingCard.subtitle || "Subtitle"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* ADD BUTTON */}
          <div className="flex justify-end">
            <Button
              disabled={isSectionActionDisabled}
              onClick={onAddCard}
              size="sm"
              variant="outline"
            >
              Add Card
            </Button>
          </div>

          {/* GRID + DRAG */}
          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled || !isSortableOperation(event.operation))
                return;

              const active = String(event.operation.source?.id);
              const over = String(event.operation.target?.id);

              if (!active || !over || active === over) return;

              const reordered = reorderInList(cards, active, over);

              const next = reordered.map((c, i) => ({
                ...c,
                cardPlacement: String(i + 1),
              }));

              onCardsReorder(next);
            }}
          >
            <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
              {cards.map((card, index) => (
                <SortableCard card={card} index={index} key={card.entryKey} />
              ))}
            </div>
          </DragDropProvider>
        </div>
      )}
    </>
  );
}
