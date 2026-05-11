"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Trash2, UploadCloud, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  IMAGE_UPLOAD_MAX_SIZE,
} from "@/lib/fileUpload";
import type {
  WebsiteContentCardState,
  WebsiteContentFormState,
} from "@/server/website-content/types";
import { usePendingUploadsContext } from "../../_context/PendingUploadsContext";
import { reorderByIndex } from "../../_hooks/reorderInList";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
import type { SecretariatSectionProps } from "../../_types/sectionProps";

interface SortableCardProps {
  card: WebsiteContentCardState;
  index: number;
  isDeleteMode: boolean;
  selectedCardEntryKeys: Set<string>;
  onToggleCardSelected: (entryKey: string, checked: boolean) => void;
  onCardClick: (entryKey: string) => void;
}

function SortableCard({
  card,
  index,
  isDeleteMode,
  selectedCardEntryKeys,
  onToggleCardSelected,
  onCardClick,
}: SortableCardProps) {
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
      <button
        aria-label="Drag card"
        className="absolute top-2 right-2 z-10 cursor-grab rounded-md border border-border bg-background/80 p-1 text-muted-foreground active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        ref={handleRef}
        tabIndex={0}
        type="button"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        className="relative aspect-square w-full overflow-hidden"
        onClick={() => {
          if (isDeleteMode) {
            onToggleCardSelected(
              card.entryKey,
              !selectedCardEntryKeys.has(card.entryKey),
            );
            return;
          }
          onCardClick(card.entryKey);
        }}
        type="button"
      >
        {card.imageUrl ? (
          <Image
            alt={card.title || "Secretariat member"}
            className="object-cover"
            fill
            src={card.imageUrl}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5">
            <User className="h-8 w-8 text-primary/30" />
          </div>
        )}
      </button>

      <div className="my-2 flex flex-col items-center">
        <h3 className="font-semibold text-base">
          {card.title || "Secretariat member"}
        </h3>
        <p className="text-primary text-xs">{card.subtitle || "Subtitle"}</p>
      </div>
    </div>
  );
}

interface SecretariatCardFormProps {
  card: WebsiteContentCardState;
  isSectionActionDisabled: boolean;
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
  placeholders: WebsiteContentFormState;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  createImageSelectHandler: (
    entryKey: string,
  ) => React.ChangeEventHandler<HTMLInputElement>;
}

function CardForm({
  card,
  isSectionActionDisabled,
  onCardFieldChange,
  placeholders,
  titleInputRef,
  createImageSelectHandler,
}: SecretariatCardFormProps) {
  const hasImage = card.imageUrl.trim().length > 0;
  const allowedTypesText = Object.values(IMAGE_UPLOAD_ACCEPT)
    .flat()
    .map((ext) => ext.replace(".", "").toUpperCase())
    .join(", ");
  const maxSizeMB = IMAGE_UPLOAD_MAX_SIZE / (1024 * 1024);

  return (
    <div className="space-y-3">
      <Input
        onChange={(e) =>
          onCardFieldChange(card.entryKey, "title", e.target.value)
        }
        placeholder={placeholders.title}
        ref={titleInputRef}
        value={card.title}
      />
      <Input
        onChange={(e) =>
          onCardFieldChange(card.entryKey, "subtitle", e.target.value)
        }
        placeholder={placeholders.subtitle}
        value={card.subtitle}
      />

      <div className="space-y-2">
        <p className="font-medium text-sm">Profile Image</p>

        {hasImage ? (
          <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
            <div className="mx-auto w-fit">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border/60 bg-muted/20">
                <Image
                  alt={card.title || "Secretariat member"}
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
                onClick={() => onCardFieldChange(card.entryKey, "imageUrl", "")}
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
}

export function SecretariatSection({
  cards,
  placeholders,
  isSectionActionDisabled,
  saveSucceededCount,
  onAddCard,
  onDeleteCardsClick,
  onToggleCardSelected,
  onCardFieldChange,
  onCardsReorder,
  isDeleteMode,
  selectedCardEntryKeys,
  onRegisterEditingFooter,
}: SecretariatSectionProps) {
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - refocus on card switch
  useEffect(() => {
    titleInputRef.current?.focus();
  }, [editingCardKey]);

  const prevSaveSucceededCountRef = useRef(saveSucceededCount);

  useEffect(() => {
    if (saveSucceededCount > prevSaveSucceededCountRef.current) {
      setEditingCardKey(null);
    }
    prevSaveSucceededCountRef.current = saveSucceededCount;
  }, [saveSucceededCount]);

  useEffect(() => {
    const hasEditingCard = cards.some((c) => c.entryKey === editingCardKey);
    if (hasEditingCard) {
      onRegisterEditingFooter?.({
        label: `Back to Secretariats`,
        onClick: () => setEditingCardKey(null),
      });
    } else {
      onRegisterEditingFooter?.(undefined);
      if (editingCardKey) {
        setEditingCardKey(null);
      }
    }
  }, [editingCardKey, cards, onRegisterEditingFooter]);

  const { registerUploadFunction, unregisterUploadFunction } =
    usePendingUploadsContext();
  const { createImageSelectHandler, uploadPendingImages } =
    usePersonalImageUpload({
      basePath: "website-content/secretariat",
      onUploaded: (entryKey, publicUrl) => {
        onCardFieldChange(entryKey, "imageUrl", publicUrl);
      },
      getOldImageUrl: (entryKey) => {
        const card = cards.find((c) => c.entryKey === entryKey);
        return card?.imageUrl;
      },
      deferred: true,
    });

  useEffect(() => {
    registerUploadFunction("secretariat", uploadPendingImages);
    return () => {
      unregisterUploadFunction("secretariat");
    };
  }, [registerUploadFunction, unregisterUploadFunction, uploadPendingImages]);

  const handleDeleteCard = (entryKey: string) => {
    onDeleteCardsClick(entryKey);
  };

  const editingCard = cards.find((c) => c.entryKey === editingCardKey);
  const editingCardIndex = cards.findIndex(
    (c) => c.entryKey === editingCardKey,
  );

  return (
    <>
      {editingCard ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

              <CardForm
                card={editingCard}
                createImageSelectHandler={createImageSelectHandler}
                isSectionActionDisabled={isSectionActionDisabled}
                onCardFieldChange={onCardFieldChange}
                placeholders={placeholders}
                titleInputRef={titleInputRef}
              />
            </div>

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

          <DragDropProvider
            onDragEnd={(event) => {
              if (event.canceled || !isSortableOperation(event.operation))
                return;

              const source = event.operation.source;
              if (!source) return;

              const { initialIndex, index } = source;

              if (initialIndex === index) return;

              const reordered = reorderByIndex(cards, initialIndex, index);

              const next = reordered.map((c, i) => ({
                ...c,
                cardPlacement: String(i + 1),
              }));
              onCardsReorder(next);
            }}
          >
            <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
              {cards.map((card, index) => (
                <SortableCard
                  card={card}
                  index={index}
                  isDeleteMode={isDeleteMode}
                  key={card.entryKey}
                  onCardClick={setEditingCardKey}
                  onToggleCardSelected={onToggleCardSelected}
                  selectedCardEntryKeys={selectedCardEntryKeys}
                />
              ))}
            </div>
          </DragDropProvider>
        </div>
      )}
    </>
  );
}
