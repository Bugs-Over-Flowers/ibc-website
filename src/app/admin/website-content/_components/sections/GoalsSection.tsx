"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Anchor,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  CheckSquare2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Cloud,
  Cog,
  Compass,
  Cpu,
  CreditCard,
  DollarSign,
  FileCheck2,
  FileText,
  Flag,
  Gem,
  Gift,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Home,
  IdCard,
  Landmark,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Phone,
  QrCode,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  UploadCloud,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import RichTextDisplay from "@/components/RichTextDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GoalsSectionProps } from "../../_types/sectionProps";
import { LucideIconPicker } from "../LucideIconPicker";
import { MarkdownTextarea } from "../RichTextEditorField";

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Anchor,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  CheckSquare2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Cloud,
  Cog,
  Compass,
  Cpu,
  CreditCard,
  DollarSign,
  FileCheck2,
  FileText,
  Flag,
  Gem,
  Gift,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Home,
  IdCard,
  Landmark,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Phone,
  QrCode,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Tag,
  Target,
  TrendingUp,
  Trophy,
  UploadCloud,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Zap,
};

export function GoalsSection({
  cards,
  placeholders,
  isSectionActionDisabled,
  onAddCard,
  onDeleteCardsClick,
  onToggleCardSelected,
  onCardFieldChange,
}: GoalsSectionProps) {
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);

  const handleDeleteCard = (entryKey: string) => {
    onToggleCardSelected(entryKey, true); // select it
    onDeleteCardsClick(); // let parent handle dialog
  };

  const editingCard = cards.find((card) => card.entryKey === editingCardKey);
  const editingCardIndex = cards.findIndex(
    (card) => card.entryKey === editingCardKey,
  );

  const PreviewCard = ({ card }: { card: (typeof cards)[number] }) => {
    return (
      <button
        className="relative overflow-hidden rounded-lg border border-border p-4 text-left text-sm transition-colors hover:bg-accent/50"
        onClick={() => setEditingCardKey(card.entryKey)}
        type="button"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            {card.icon && (
              <div className="shrink-0">
                {typeof card.icon === "string" && ICON_MAP[card.icon] ? (
                  (() => {
                    const IconComponent = ICON_MAP[card.icon];
                    return <IconComponent className="h-5 w-5 text-primary" />;
                  })()
                ) : (
                  <span className="text-base">{card.icon}</span>
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{card.title}</p>
            </div>
          </div>
          <div className="line-clamp-3 text-muted-foreground">
            {card.paragraph ? (
              <RichTextDisplay content={card.paragraph} />
            ) : null}
          </div>
        </div>
      </button>
    );
  };

  const GoalCardForm = ({ card }: { card: (typeof cards)[number] }) => {
    return (
      <div className="space-y-4">
        <div className="flex flex-row gap-4">
          <div className="pr-1">
            <LucideIconPicker
              onSelect={(value) => {
                onCardFieldChange(card.entryKey, "icon", value);
              }}
              selectedIcon={card.icon}
            />
          </div>

          <div className="w-full space-y-2">
            <p className="font-medium text-sm">Goal Title</p>
            <Input
              className="truncate"
              onChange={(e) => {
                onCardFieldChange(card.entryKey, "title", e.target.value);
              }}
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
            className="max-h-[150px] overflow-y-auto"
            onChange={(value) => {
              onCardFieldChange(card.entryKey, "paragraph", value);
            }}
            placeholder={placeholders.paragraph || "Enter goal description"}
            rows={4}
            value={card.paragraph}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {editingCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-start">
            <Button
              className="gap-2"
              disabled={isSectionActionDisabled}
              onClick={() => setEditingCardKey(null)}
              type="button"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Goals
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left side - Edit form */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">
                    Goal Card {editingCardIndex + 1}
                  </p>
                  <Button
                    aria-label="Delete card"
                    disabled={isSectionActionDisabled}
                    onClick={() => handleDeleteCard(editingCard.entryKey)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <GoalCardForm card={editingCard} />
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="flex flex-col gap-4">
              <p className="font-semibold text-sm">Preview</p>
              <Card className="group relative max-h-96 overflow-hidden border-0 bg-card/95 shadow-xl ring-1 ring-border/50 backdrop-blur-xl transition-all duration-300">
                <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
                <CardContent className="flex max-h-96 flex-col items-center overflow-y-auto p-6 text-center">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm transition-transform duration-300">
                      {editingCard.icon &&
                        (typeof editingCard.icon === "string" &&
                        ICON_MAP[editingCard.icon] ? (
                          (() => {
                            const IconComponent = ICON_MAP[editingCard.icon];
                            return (
                              <IconComponent className="h-7 w-7 text-primary" />
                            );
                          })()
                        ) : (
                          <span className="text-lg">{editingCard.icon}</span>
                        ))}
                    </div>
                  </div>
                  <h3 className="mb-3 font-bold text-foreground text-xl">
                    {editingCard.title || "Goal Title"}
                  </h3>
                  {editingCard.paragraph ? (
                    <RichTextDisplay
                      className="mb-4 text-foreground/80 leading-relaxed"
                      content={editingCard.paragraph}
                    />
                  ) : (
                    <p className="mb-4 text-foreground/80 leading-relaxed">
                      Goal description will appear here...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              disabled={isSectionActionDisabled}
              onClick={onAddCard}
              type="button"
              variant="outline"
            >
              Add Card
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <PreviewCard card={card} key={card.entryKey} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
