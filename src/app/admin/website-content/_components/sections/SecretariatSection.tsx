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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  IMAGE_UPLOAD_MAX_SIZE,
} from "@/lib/fileUpload";
import { usePendingUploadsContext } from "../../_context/PendingUploadsContext";
import { reorderInList } from "../../_hooks/reorderInList";
import { usePersonalImageUpload } from "../../_hooks/usePersonalImageUpload";
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
  isDeleteMode,
  selectedCardEntryKeys,
}: SecretariatSectionProps) {
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
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

        {/* IMAGE BUTTON */}
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
            setEditingCardKey(card.entryKey);
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

        {/* TEXT CONTENT */}
        <div className="my-2 flex flex-col items-center">
          <h3 className="font-semibold text-base">
            {card.title || "Secretariat member"}
          </h3>
          <p className="text-primary text-xs">{card.subtitle || "Subtitle"}</p>
        </div>
      </div>
    );
  };

  const Form = ({ card }: { card: (typeof cards)[number] }) => {
    const hasImage = card.imageUrl.trim().length > 0;
    const allowedTypesText = Object.values(IMAGE_UPLOAD_ACCEPT)
      .flat()
      .map((ext) => ext.replace(".", "").toUpperCase())
      .join(", ");
    const maxSizeMB = IMAGE_UPLOAD_MAX_SIZE / (1024 * 1024);

    return (
      <div className="space-y-3">
        <Input
          autoFocus
          onChange={(e) =>
            onCardFieldChange(card.entryKey, "title", e.target.value)
          }
          placeholder={placeholders.title}
          value={card.title}
        />
        <Input
          autoFocus
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
