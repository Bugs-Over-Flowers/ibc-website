"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reorderInList } from "../../_hooks/reorderInList";
import { useBoardCardGroups } from "../../_hooks/useBoardCardGroups";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
import type { BoardOfTrusteesSectionProps } from "../../_types/section-props";

type BoardGroup = "featured" | "officers" | "trustees" | "other";

export function BoardOfTrusteesSection({
  cards,
  placeholders,
  onAddCard,
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

    return (
      <div
        className="aspect-[1/1.05] w-full rounded-lg border border-border p-4 sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
        ref={ref}
        style={{ opacity: isDragSource ? 0.65 : 1 }}
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
            <button
              aria-label="Drag card"
              className="cursor-grab rounded-md border border-border p-1 text-muted-foreground active:cursor-grabbing"
              ref={handleRef}
              type="button"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="space-y-2">
            <p className="font-medium text-sm">Card Title</p>
            <Input
              onChange={(event) =>
                onCardFieldChange(card.entryKey, "title", event.target.value)
              }
              placeholder={placeholders.title || "Juan Jose Jamora III"}
              value={card.title}
            />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-sm">Card Subtitle</p>
            <Input
              onChange={(event) =>
                onCardFieldChange(card.entryKey, "subtitle", event.target.value)
              }
              placeholder={placeholders.subtitle || "Chairman Emeritus"}
              value={card.subtitle}
            />
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
  ) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          {title}
        </p>
        <Button
          onClick={() => onAddCard(group)}
          size="sm"
          type="button"
          variant="outline"
        >
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
      {renderSection("featured", "Featured", "Featured", featuredCards)}
      {renderSection("officers", "Officers", "Officer", officerCards)}
      {renderSection("trustees", "Trustees", "Trustee", trusteeCards)}
      {renderSection("other", "Others", "Board Card", otherCards)}
    </div>
  );
}
