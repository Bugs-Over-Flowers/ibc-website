"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { HeroSectionCarouselProps } from "../../_types/section-props";

const HERO_PAGES = [
  { key: "about", label: "About" },
  { key: "events", label: "Events" },
  { key: "members", label: "Members" },
  { key: "networks", label: "Networks" },
  { key: "contact", label: "Contact" },
] as const;

const HERO_SLOT_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const HERO_BUCKET_NAME = "heroimages";

function getHeroImagePathFromUrl(imageUrl: string): string | null {
  const marker = `/storage/v1/object/public/${HERO_BUCKET_NAME}/`;

  try {
    const parsedUrl = new URL(imageUrl);
    const markerIndex = parsedUrl.pathname.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = parsedUrl.pathname.slice(markerIndex + marker.length);
    return decodeURIComponent(encodedPath);
  } catch {
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = imageUrl.slice(markerIndex + marker.length);
    return decodeURIComponent(encodedPath);
  }
}

export function HeroSectionCarouselSection({
  cards,
  onCardFieldChange,
  onCardsReorder,
}: HeroSectionCarouselProps) {
  const [processingEntryKeys, setProcessingEntryKeys] = useState<string[]>([]);

  const normalizedCards = useMemo(() => {
    const mappedCards = HERO_PAGES.flatMap((page) => {
      return Array.from({ length: HERO_SLOT_COUNT }, (_, index) => {
        const placement = String(index + 1);
        const existingCard = cards.find(
          (card) => card.group === page.key && card.cardPlacement === placement,
        );

        if (existingCard) {
          return existingCard;
        }

        return {
          entryKey: `${page.key}_hero_${placement}`,
          title: `${page.label} hero image ${placement}`,
          subtitle: "",
          paragraph: "",
          icon: "",
          imageUrl: "",
          cardPlacement: placement,
          group: page.key,
        };
      });
    });

    return mappedCards;
  }, [cards]);

  useEffect(() => {
    const hasDifferentLength = cards.length !== normalizedCards.length;
    const hasDifferentEntries = normalizedCards.some((normalizedCard) => {
      const existing = cards.find(
        (card) => card.entryKey === normalizedCard.entryKey,
      );

      if (!existing) {
        return true;
      }

      return (
        existing.group !== normalizedCard.group ||
        existing.cardPlacement !== normalizedCard.cardPlacement
      );
    });

    if (hasDifferentLength || hasDifferentEntries) {
      onCardsReorder(normalizedCards);
    }
  }, [cards, normalizedCards, onCardsReorder]);

  const isImageUrlUsedInOtherSlot = useCallback(
    (imageUrl: string, currentEntryKey: string): boolean => {
      return normalizedCards.some(
        (card) =>
          card.entryKey !== currentEntryKey && card.imageUrl === imageUrl,
      );
    },
    [normalizedCards],
  );

  const setEntryProcessing = useCallback(
    (entryKey: string, processing: boolean) => {
      setProcessingEntryKeys((previousKeys) => {
        if (processing) {
          if (previousKeys.includes(entryKey)) {
            return previousKeys;
          }

          return [...previousKeys, entryKey];
        }

        return previousKeys.filter((key) => key !== entryKey);
      });
    },
    [],
  );

  const handleImageReplace = useCallback(
    (entryKey: string) =>
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }

        if (!file.type.startsWith("image/")) {
          toast.error("Invalid file type. Please select an image.");
          event.target.value = "";
          return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          toast.error("Image too large. Maximum size is 5MB.");
          event.target.value = "";
          return;
        }

        const currentCard = normalizedCards.find(
          (card) => card.entryKey === entryKey,
        );
        const previousImageUrl = currentCard?.imageUrl.trim() ?? "";
        const toastId = toast.loading(
          previousImageUrl ? "Replacing image..." : "Uploading image...",
        );
        setEntryProcessing(entryKey, true);

        try {
          const supabase = await createClient();
          const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const filePath = `website-content/hero/${entryKey}-${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from(HERO_BUCKET_NAME)
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) {
            toast.error(`Image upload failed: ${uploadError.message}`, {
              id: toastId,
            });
            event.target.value = "";
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(HERO_BUCKET_NAME).getPublicUrl(filePath);

          onCardFieldChange(entryKey, "imageUrl", publicUrl);

          if (previousImageUrl && previousImageUrl !== publicUrl) {
            if (isImageUrlUsedInOtherSlot(previousImageUrl, entryKey)) {
              toast.success(
                "Image replaced. Previous image kept because it is used in another slot.",
                { id: toastId },
              );
            } else {
              const previousPath = getHeroImagePathFromUrl(previousImageUrl);
              if (!previousPath) {
                toast.error(
                  "New image uploaded, but old image cleanup failed. Please remove the old image manually.",
                  { id: toastId },
                );
              } else {
                const { error: deleteError } = await supabase.storage
                  .from(HERO_BUCKET_NAME)
                  .remove([previousPath]);

                if (deleteError) {
                  toast.error(
                    `New image uploaded, but old cleanup failed: ${deleteError.message}`,
                    { id: toastId },
                  );
                } else {
                  toast.success("Image replaced successfully.", {
                    id: toastId,
                  });
                }
              }
            }
          } else {
            toast.success("Image uploaded successfully.", { id: toastId });
          }
        } catch {
          toast.error("Image upload failed. Please try again.", {
            id: toastId,
          });
        } finally {
          setEntryProcessing(entryKey, false);
          event.target.value = "";
        }
      },
    [
      isImageUrlUsedInOtherSlot,
      normalizedCards,
      onCardFieldChange,
      setEntryProcessing,
    ],
  );

  const handleImageRemove = useCallback(
    async (entryKey: string) => {
      const currentCard = normalizedCards.find(
        (card) => card.entryKey === entryKey,
      );
      const currentImageUrl = currentCard?.imageUrl.trim() ?? "";
      if (!currentImageUrl) {
        return;
      }

      const toastId = toast.loading("Removing image...");
      setEntryProcessing(entryKey, true);

      try {
        if (isImageUrlUsedInOtherSlot(currentImageUrl, entryKey)) {
          onCardFieldChange(entryKey, "imageUrl", "");
          toast.success(
            "Image removed from this slot. File kept because it is used in another slot.",
            { id: toastId },
          );
          return;
        }

        const imagePath = getHeroImagePathFromUrl(currentImageUrl);
        if (!imagePath) {
          toast.error(
            "Could not determine image path for deletion. Please replace the image and try again.",
            { id: toastId },
          );
          return;
        }

        const supabase = await createClient();
        const { error: deleteError } = await supabase.storage
          .from(HERO_BUCKET_NAME)
          .remove([imagePath]);

        if (deleteError) {
          toast.error(`Image removal failed: ${deleteError.message}`, {
            id: toastId,
          });
          return;
        }

        onCardFieldChange(entryKey, "imageUrl", "");
        toast.success("Image removed successfully.", { id: toastId });
      } catch {
        toast.error("Image removal failed. Please try again.", { id: toastId });
      } finally {
        setEntryProcessing(entryKey, false);
      }
    },
    [
      isImageUrlUsedInOtherSlot,
      normalizedCards,
      onCardFieldChange,
      setEntryProcessing,
    ],
  );

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Upload 5 images for each page. These images will rotate in the hero
        background while preserving existing text and layout.
      </p>

      {HERO_PAGES.map((page) => {
        const pageCards = normalizedCards.filter(
          (card) => card.group === page.key,
        );

        return (
          <section className="space-y-3" key={page.key}>
            <p className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              {page.label} page
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {pageCards.map((card, index) => (
                <div
                  className="rounded-lg border border-border p-4"
                  key={card.entryKey}
                >
                  <p className="mb-3 font-semibold text-sm">
                    Image Slot {index + 1}
                  </p>
                  <div className="flex flex-col gap-2">
                    <label
                      className="flex h-24 w-full cursor-pointer items-center justify-center rounded-md border border-border border-dashed bg-muted/30 px-4 py-2 text-center font-medium text-muted-foreground text-sm transition-colors hover:border-primary hover:bg-muted"
                      htmlFor={`hero-image-${card.entryKey}`}
                    >
                      Insert Image Here
                    </label>
                    <input
                      accept="image/*"
                      className="hidden"
                      disabled={processingEntryKeys.includes(card.entryKey)}
                      id={`hero-image-${card.entryKey}`}
                      onChange={handleImageReplace(card.entryKey)}
                      type="file"
                    />
                    {card.imageUrl ? (
                      <>
                        <Image
                          alt={`${page.label} hero ${index + 1} preview`}
                          className="h-20 w-full rounded-md border border-border object-cover"
                          height={80}
                          src={card.imageUrl}
                          unoptimized
                          width={220}
                        />
                        <Button
                          disabled={processingEntryKeys.includes(card.entryKey)}
                          onClick={() => {
                            void handleImageRemove(card.entryKey);
                          }}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          Remove Image
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
