"use client";

import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import { Input } from "@/components/ui/input";
import type { BoardOfTrusteesSectionProps } from "../../_types/section-props";

type BoardGroup = "featured" | "officers" | "trustees" | "other";

function getGroup(card: { group: string | null }): BoardGroup {
  if (card.group === "featured") {
    return "featured";
  }
  if (card.group === "officers") {
    return "officers";
  }
  if (card.group === "trustees") {
    return "trustees";
  }
  return "other";
}

function getCardPlacementValue(card: {
  cardPlacement: string;
  entryKey: string;
}) {
  const placementValue = Number(card.cardPlacement);
  if (Number.isFinite(placementValue) && placementValue > 0) {
    return placementValue;
  }

  const entryKeyValue = Number(card.entryKey.split("_").at(-1));
  return Number.isFinite(entryKeyValue)
    ? entryKeyValue
    : Number.MAX_SAFE_INTEGER;
}

function sortCardsByPlacement(
  a: { cardPlacement: string; entryKey: string },
  b: { cardPlacement: string; entryKey: string },
) {
  const aPlacement = getCardPlacementValue(a);
  const bPlacement = getCardPlacementValue(b);
  if (aPlacement === bPlacement) {
    return a.entryKey.localeCompare(b.entryKey);
  }
  return aPlacement - bPlacement;
}

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

function toPlacementString(value: number) {
  return String(value);
}

export function BoardOfTrusteesSection({
  cards,
  placeholders,
  isPlacementMode,
  onCardFieldChange,
  onCardsReorder,
}: BoardOfTrusteesSectionProps) {
  const featuredCards = cards
    .filter((card) => getGroup(card) === "featured")
    .sort(sortCardsByPlacement);
  const officerCards = cards
    .filter((card) => getGroup(card) === "officers")
    .sort(sortCardsByPlacement);
  const trusteeCards = cards
    .filter((card) => getGroup(card) === "trustees")
    .sort(sortCardsByPlacement);
  const otherCards = cards
    .filter((card) => getGroup(card) === "other")
    .sort(sortCardsByPlacement);

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

  const handleDropInGroup = (
    event: DragEvent<HTMLElement>,
    group: BoardGroup,
    overEntryKey: string,
  ) => {
    event.preventDefault();
    if (!isPlacementMode) {
      return;
    }

    const activeEntryKey = event.dataTransfer.getData("text/plain");
    const activeGroup = event.dataTransfer.getData(
      "application/x-group",
    ) as BoardGroup;

    if (!activeEntryKey || !activeGroup || activeGroup !== group) {
      return;
    }

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
      cardPlacement: toPlacementString(index + 1),
    }));

    onCardsReorder(nextCards);
  };

  const renderCardContent = (
    card: (typeof cards)[number],
    label: string,
    index: number,
  ) => (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-semibold text-sm">
          {label} {index + 1}
        </p>
        {card.group ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase">
            {card.group}
          </span>
        ) : null}
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
              className="inline-flex w-fit cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm hover:bg-accent hover:text-accent-foreground"
              htmlFor={`board-image-${card.entryKey}`}
            >
              Add Image
            </label>
            <input
              accept="image/*"
              className="hidden"
              id={`board-image-${card.entryKey}`}
              onChange={handleImageSelect(card.entryKey)}
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
    </>
  );

  return (
    <div className="space-y-6">
      {featuredCards.length > 0 ? (
        <section className="space-y-3">
          <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Featured
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {featuredCards.map((card, index) => {
              if (isPlacementMode) {
                return (
                  <button
                    className="aspect-[1/1.05] w-full cursor-move rounded-lg border border-border p-4 text-left sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                    draggable
                    key={card.entryKey}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", card.entryKey);
                      event.dataTransfer.setData(
                        "application/x-group",
                        "featured",
                      );
                    }}
                    onDrop={(event) =>
                      handleDropInGroup(event, "featured", card.entryKey)
                    }
                    type="button"
                  >
                    <p className="rounded-md border border-border border-dashed px-3 py-2 text-muted-foreground text-xs">
                      Drag to reorder within featured.
                    </p>
                  </button>
                );
              }

              return (
                <div
                  className="aspect-[1/1.05] w-full rounded-lg border border-border p-4 sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                  key={card.entryKey}
                >
                  {renderCardContent(card, "Featured", index)}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {officerCards.length > 0 ? (
        <section className="space-y-3">
          <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Officers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {officerCards.map((card, index) => {
              if (isPlacementMode) {
                return (
                  <button
                    className="aspect-[1/1.05] w-full cursor-move rounded-lg border border-border p-4 text-left sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                    draggable
                    key={card.entryKey}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", card.entryKey);
                      event.dataTransfer.setData(
                        "application/x-group",
                        "officers",
                      );
                    }}
                    onDrop={(event) =>
                      handleDropInGroup(event, "officers", card.entryKey)
                    }
                    type="button"
                  >
                    <p className="rounded-md border border-border border-dashed px-3 py-2 text-muted-foreground text-xs">
                      Drag to reorder within officers.
                    </p>
                  </button>
                );
              }

              return (
                <div
                  className="aspect-[1/1.05] w-full rounded-lg border border-border p-4 sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                  key={card.entryKey}
                >
                  {renderCardContent(card, "Officer", index)}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {trusteeCards.length > 0 ? (
        <section className="space-y-3">
          <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Trustees
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {trusteeCards.map((card, index) => {
              if (isPlacementMode) {
                return (
                  <button
                    className="aspect-[1/1.05] w-full cursor-move rounded-lg border border-border p-4 text-left sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                    draggable
                    key={card.entryKey}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", card.entryKey);
                      event.dataTransfer.setData(
                        "application/x-group",
                        "trustees",
                      );
                    }}
                    onDrop={(event) =>
                      handleDropInGroup(event, "trustees", card.entryKey)
                    }
                    type="button"
                  >
                    <p className="rounded-md border border-border border-dashed px-3 py-2 text-muted-foreground text-xs">
                      Drag to reorder within trustees.
                    </p>
                  </button>
                );
              }

              return (
                <div
                  className="aspect-[1/1.05] w-full rounded-lg border border-border p-4 sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                  key={card.entryKey}
                >
                  {renderCardContent(card, "Trustee", index)}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {otherCards.length > 0 ? (
        <section className="space-y-3">
          <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Others
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {otherCards.map((card, index) => {
              if (isPlacementMode) {
                return (
                  <button
                    className="aspect-[1/1.05] w-full cursor-move rounded-lg border border-border p-4 text-left sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                    draggable
                    key={card.entryKey}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", card.entryKey);
                      event.dataTransfer.setData(
                        "application/x-group",
                        "other",
                      );
                    }}
                    onDrop={(event) =>
                      handleDropInGroup(event, "other", card.entryKey)
                    }
                    type="button"
                  >
                    <p className="rounded-md border border-border border-dashed px-3 py-2 text-muted-foreground text-xs">
                      Drag to reorder within others.
                    </p>
                  </button>
                );
              }

              return (
                <div
                  className="aspect-[1/1.05] w-full rounded-lg border border-border p-4 sm:max-w-[calc((100%-2rem)/3)] sm:basis-[calc((100%-2rem)/3)]"
                  key={card.entryKey}
                >
                  {renderCardContent(card, "Board Card", index)}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
