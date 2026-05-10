"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  IMAGE_UPLOAD_MAX_SIZE,
} from "@/lib/fileUpload";
import { usePendingUploadsContext } from "../../_context/PendingUploadsContext";
import { reorderInList } from "../../_hooks/reorderInList";
import { useBoardCardGroups } from "../../_hooks/useBoardCardGroups";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
import type { BoardOfTrusteesSectionProps } from "../../_types/sectionProps";

type BoardGroup = "featured" | "officers" | "trustees" | "other";

export function BoardOfTrusteesSection({
  cards,
  placeholders,
  isSectionActionDisabled,
  onAddCard,
  onDeleteCardsClick,
  onToggleCardSelected,
  onCardFieldChange,
  onCardsReorder,
  isDeleteMode,
  selectedCardEntryKeys,
}: BoardOfTrusteesSectionProps) {
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const { registerUploadFunction, unregisterUploadFunction } =
    usePendingUploadsContext();
  const { createImageSelectHandler, uploadPendingImages } =
    usePersonalImageUpload({
      basePath: "website-content/board",
      onUploaded: (entryKey, publicUrl) => {
        onCardFieldChange(entryKey, "imageUrl", publicUrl);
      },
      getOldImageUrl: (entryKey) => {
        const card = cards.find((c) => c.entryKey === entryKey);
        return card?.imageUrl;
      },
    });

  useEffect(() => {
    registerUploadFunction("board_of_trustees", uploadPendingImages);
    return () => {
      unregisterUploadFunction("board_of_trustees");
    };
  }, [registerUploadFunction, unregisterUploadFunction, uploadPendingImages]);

  const { featuredCards, officerCards, trusteeCards, otherCards } =
    useBoardCardGroups(cards);

  const handleDeleteCard = (entryKey: string) => {
    onDeleteCardsClick(entryKey);
  };

  const editingCard = cards.find((c) => c.entryKey === editingCardKey);
  const editingCardIndex = cards.findIndex(
    (c) => c.entryKey === editingCardKey,
  );
  const renderSection = (
    group: BoardGroup,
    title: string,
    groupCards: (typeof cards)[number][],
    containerClassName: string,
  ) => (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-muted-foreground text-sm uppercase">
          {title}
        </p>

        <Button
          disabled={isSectionActionDisabled}
          onClick={() => onAddCard(group)}
          size="sm"
          variant="outline"
        >
          Add Card
        </Button>
      </div>

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled || !isSortableOperation(event.operation)) return;

          const activeEntryKey = String(event.operation.source?.id);
          const overEntryKey = String(event.operation.target?.id ?? "");

          if (!activeEntryKey || !overEntryKey) return;
          if (activeEntryKey === overEntryKey) return;

          handleGroupReorder(group, activeEntryKey, overEntryKey);
        }}
      >
        <div className={containerClassName}>
          {groupCards.map((card, index) => (
            <SortablePreviewCard
              card={card}
              group={group}
              index={index}
              key={card.entryKey}
            />
          ))}
        </div>
      </DragDropProvider>
    </section>
  );
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

    const merged = groupOrder.flatMap((g) => grouped[g]);

    const nextCards = merged.map((card, index) => ({
      ...card,
      cardPlacement: String(index + 1),
    }));

    onCardsReorder(nextCards);
  };

  const SortablePreviewCard = ({
    card,
    group,
    index,
  }: {
    card: (typeof cards)[number];
    group: BoardGroup;
    index: number;
  }) => {
    const { ref, handleRef, isDragSource } = useSortable({
      id: card.entryKey,
      index,
      group,
    });

    const isFeatured = group === "featured";

    return (
      <button
        className={`relative w-full ${
          isFeatured
            ? "flex h-[340px] w-[260px] flex-col items-center justify-center rounded-3xl bg-card/95 p-8 text-center shadow-xl ring-1 ring-border/50 backdrop-blur-xl"
            : "mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
        }`}
        onClick={() => {
          if (isDeleteMode) {
            onToggleCardSelected(
              card.entryKey,
              !selectedCardEntryKeys.has(card.entryKey),
            );
            return;
          }

          setEditingCardKey(card.entryKey);
        }}
        ref={ref}
        style={{ opacity: isDragSource ? 0.65 : 1 }}
        type="button"
      >
        <button
          aria-label="Drag card"
          className="absolute top-3 right-3 cursor-grab rounded-md border border-border bg-background/80 p-1 text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          ref={handleRef}
          type="button"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center">
          <div
            className={`relative mb-4 flex items-center justify-center rounded-full bg-primary/10 ${
              isFeatured ? "h-24 w-24" : "h-20 w-20"
            }`}
          >
            {card.imageUrl ? (
              <Image
                alt={card.title || "Board member"}
                className="rounded-full object-cover"
                height={isFeatured ? 96 : 80}
                src={card.imageUrl}
                unoptimized
                width={isFeatured ? 96 : 80}
              />
            ) : (
              <User
                className={`${
                  isFeatured
                    ? "h-16 w-16 text-primary/40"
                    : "h-12 w-12 text-primary/30"
                }`}
              />
            )}
          </div>

          <h3 className="mb-2 font-semibold text-base">
            {card.title || "Board member"}
          </h3>

          <p className="text-primary text-xs">{card.subtitle || "Subtitle"}</p>
        </div>
      </button>
    );
  };

  const BoardCardForm = ({ card }: { card: (typeof cards)[number] }) => {
    const hasImage = card.imageUrl.trim().length > 0;
    const allowedTypesText = Object.values(IMAGE_UPLOAD_ACCEPT)
      .flat()
      .map((ext) => ext.replace(".", "").toUpperCase())
      .join(", ");
    const maxSizeMB = IMAGE_UPLOAD_MAX_SIZE / (1024 * 1024);

    return (
      <div className="space-y-3">
        <div>
          <p className="font-medium text-sm">Card Title</p>
          <Input
            autoFocus
            onChange={(e) =>
              onCardFieldChange(card.entryKey, "title", e.target.value)
            }
            placeholder={placeholders.title}
            value={card.title}
          />
        </div>

        <div>
          <p className="font-medium text-sm">Card Subtitle</p>
          <Input
            autoFocus
            onChange={(e) =>
              onCardFieldChange(card.entryKey, "subtitle", e.target.value)
            }
            placeholder={placeholders.subtitle}
            value={card.subtitle}
          />
        </div>

        <div className="space-y-2">
          <p className="font-medium text-sm">Profile Image</p>

          {hasImage ? (
            <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
              <div className="mx-auto w-fit">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border/60 bg-muted/20">
                  <Image
                    alt={card.title || "Board member"}
                    className="object-cover"
                    fill
                    src={card.imageUrl}
                    unoptimized
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                  Image Uploaded Successfully
                </span>
                <Badge className="max-w-full" variant="outline">
                  {card.entryKey}
                </Badge>
              </div>

              <label className="block">
                <input
                  accept={IMAGE_UPLOAD_ACCEPT_ATTR}
                  className="hidden"
                  disabled={isSectionActionDisabled}
                  onChange={createImageSelectHandler(card.entryKey)}
                  type="file"
                />
                <div className="flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-muted-foreground/25 border-dashed bg-background p-4 text-center transition-all hover:border-primary hover:bg-primary/5">
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-sm">
                    Replace image
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Click to choose another file
                  </span>
                </div>
              </label>

              <div className="flex justify-center">
                <Button
                  className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isSectionActionDisabled}
                  onClick={() =>
                    onCardFieldChange(card.entryKey, "imageUrl", "")
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <X className="mr-1 h-4 w-4" />
                  Remove image
                </Button>
              </div>
            </div>
          ) : (
            <label className="block">
              <input
                accept={IMAGE_UPLOAD_ACCEPT_ATTR}
                className="hidden"
                disabled={isSectionActionDisabled}
                onChange={createImageSelectHandler(card.entryKey)}
                type="file"
              />
              <div className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted-foreground/25 border-dashed bg-background p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">
                  Click to upload image
                </span>
                <span className="text-muted-foreground text-xs">
                  {allowedTypesText} up to {maxSizeMB}MB
                </span>
              </div>
            </label>
          )}
        </div>
      </div>
    );
  };

  const PreviewCard = ({ card }: { card: (typeof cards)[number] }) => {
    const isFeatured = card.group === "featured";

    return (
      <div className="flex justify-center">
        <div
          className={`relative ${
            isFeatured
              ? "flex h-[340px] w-[260px] flex-col items-center justify-center rounded-3xl bg-card/95 p-8 text-center shadow-xl ring-1 ring-border/50"
              : "flex h-[300px] w-[220px] flex-col items-center justify-center rounded-xl border border-border bg-card"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`relative mb-4 flex items-center justify-center rounded-full bg-primary/10 ${
                isFeatured ? "h-24 w-24" : "h-20 w-20"
              }`}
            >
              {card.imageUrl ? (
                <Image
                  alt={card.title || "Board member"}
                  className="rounded-full object-cover"
                  height={isFeatured ? 96 : 80}
                  src={card.imageUrl}
                  unoptimized
                  width={isFeatured ? 96 : 80}
                />
              ) : (
                <User className="h-12 w-12 text-primary/30" />
              )}
            </div>

            <h3 className="mb-2 font-semibold text-base">
              {card.title || "Board member"}
            </h3>

            <p className="text-primary text-xs">
              {card.subtitle || "Subtitle"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {editingCard ? (
        <div className="space-y-4">
          <Button
            className="gap-2"
            onClick={() => setEditingCardKey(null)}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Board
          </Button>

          {/* ✅ FIXED: LEFT FORM / RIGHT PREVIEW */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">
                  Board Card {editingCardIndex + 1}
                </p>

                <Button
                  onClick={() => handleDeleteCard(editingCard.entryKey)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <BoardCardForm card={editingCard} />
            </div>

            {/* RIGHT PREVIEW */}
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-sm">Preview</p>
              {editingCard && <PreviewCard card={editingCard} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {renderSection(
            "featured",
            "Featured",
            featuredCards,
            "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4",
          )}
          {renderSection(
            "officers",
            "Officers",
            officerCards,
            "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
          )}
          {renderSection(
            "trustees",
            "Trustees",
            trusteeCards,
            "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
          )}
          {renderSection(
            "other",
            "Others",
            otherCards,
            "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
          )}
        </div>
      )}
    </>
  );
}
