"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompanyThrustsSectionProps } from "../../_types/section-props";
import { LucideIconPicker } from "../LucideIconPicker";
import { MarkdownTextarea } from "../RichTextEditorField";

export function CompanyThrustsSection({
  cards,
  placeholders,
  onAddCard,
  onCardFieldChange,
}: CompanyThrustsSectionProps) {
  const ThrustCardForm = ({
    card,
    index,
  }: {
    card: (typeof cards)[number];
    index: number;
  }) => {
    const form = useForm({
      defaultValues: {
        title: card.title,
        paragraph: card.paragraph,
        icon: card.icon,
      },
    });

    useEffect(() => {
      form.setFieldValue("title", card.title);
      form.setFieldValue("paragraph", card.paragraph);
      form.setFieldValue("icon", card.icon);
    }, [card.icon, card.paragraph, card.title, form]);

    return (
      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 font-semibold text-sm">Thrust Card {index + 1}</p>

        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex flex-row gap-4">
              <div className="pr-1">
                <form.Field name="icon">
                  {(field) => (
                    <LucideIconPicker
                      onSelect={(value) => {
                        field.handleChange(value);
                        onCardFieldChange(card.entryKey, "icon", value);
                      }}
                      selectedIcon={field.state.value}
                    />
                  )}
                </form.Field>
              </div>

              <div className="w-full space-y-2">
                <p className="font-medium text-sm">Thrust Title</p>
                <form.Field name="title">
                  {(field) => (
                    <Input
                      className="truncate"
                      onChange={(event) => {
                        const value = event.target.value;
                        field.handleChange(value);
                        onCardFieldChange(card.entryKey, "title", value);
                      }}
                      placeholder={
                        placeholders.title || "Policy Advisory & Advocacy"
                      }
                      value={field.state.value}
                    />
                  )}
                </form.Field>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-sm">Thrust Paragraph</p>
              <form.Field name="paragraph">
                {(field) => (
                  <MarkdownTextarea
                    onChange={(value) => {
                      field.handleChange(value);
                      onCardFieldChange(card.entryKey, "paragraph", value);
                    }}
                    placeholder={
                      placeholders.paragraph || "Enter thrust description"
                    }
                    rows={11}
                    value={field.state.value}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAddCard} type="button" variant="outline">
          Add Card
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card, index) => (
          <ThrustCardForm card={card} index={index} key={card.entryKey} />
        ))}
      </div>
    </div>
  );
}
