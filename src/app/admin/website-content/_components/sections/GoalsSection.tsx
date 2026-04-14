"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GoalsSectionProps } from "../../_types/section-props";
import { LucideIconPicker } from "../LucideIconPicker";
import { MarkdownTextarea } from "../RichTextEditorField";

export function GoalsSection({
  cards,
  placeholders,
  onAddCard,
  onCardFieldChange,
}: GoalsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAddCard} type="button" variant="outline">
          Add Card
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card, index) => (
          <div
            className="rounded-lg border border-border p-4"
            key={card.entryKey}
          >
            <p className="mb-3 font-semibold text-sm">Goal Card {index + 1}</p>

            <div className="flex flex-col gap-4">
              <div className="space-y-4">
                <div className="flex flex-row gap-4">
                  <div className="pr-1">
                    <LucideIconPicker
                      onSelect={(value) =>
                        onCardFieldChange(card.entryKey, "icon", value)
                      }
                      selectedIcon={card.icon}
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <p className="font-medium text-sm">Goal Title</p>
                    <Input
                      className="truncate"
                      onChange={(event) =>
                        onCardFieldChange(
                          card.entryKey,
                          "title",
                          event.target.value,
                        )
                      }
                      placeholder={
                        placeholders.title || "Increase Trailblazer Companies"
                      }
                      value={card.title}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Goal Paragraph</p>
                  <MarkdownTextarea
                    onChange={(value) =>
                      onCardFieldChange(card.entryKey, "paragraph", value)
                    }
                    placeholder={
                      placeholders.paragraph || "Enter goal description"
                    }
                    rows={10}
                    value={card.paragraph}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
