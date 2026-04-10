"use client";

import { Input } from "@/components/ui/input";
import type { LandingBenefitsSectionProps } from "../../_types/section-props";
import { LucideIconPicker } from "../LucideIconPicker";
import { MarkdownTextarea } from "../MarkdownTextarea";

export function LandingBenefitsSection({
  cards,
  placeholders,
  onCardFieldChange,
}: LandingBenefitsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card, index) => (
        <div
          className="rounded-lg border border-border p-4"
          key={card.entryKey}
        >
          <p className="mb-3 font-semibold text-sm">Benefit Card {index + 1}</p>

          <div className="flex flex-col gap-4">
            <div className="pr-1">
              <LucideIconPicker
                onSelect={(value) =>
                  onCardFieldChange(card.entryKey, "icon", value)
                }
                selectedIcon={card.icon}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-sm">Benefit Title</p>
                <Input
                  onChange={(event) =>
                    onCardFieldChange(
                      card.entryKey,
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder={placeholders.title || "Business Networking"}
                  value={card.title}
                />
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">Benefit Paragraph</p>
                <MarkdownTextarea
                  onChange={(value) =>
                    onCardFieldChange(card.entryKey, "paragraph", value)
                  }
                  placeholder={
                    placeholders.paragraph || "Enter benefit description"
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
  );
}
