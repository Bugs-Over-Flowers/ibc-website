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
import type { LandingBenefitsSectionProps } from "../../_types/sectionProps";
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

export function LandingBenefitsSection({
  cards,
  placeholders,
  isSectionActionDisabled,
  onAddCard,
  onDeleteCardsClick,
  onToggleCardSelected,
  onCardFieldChange,
}: LandingBenefitsSectionProps) {
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
        className="text-left"
        onClick={() => setEditingCardKey(card.entryKey)}
        type="button"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-all duration-300">
          <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3">
            {card.icon ? (
              typeof card.icon === "string" && ICON_MAP[card.icon] ? (
                (() => {
                  const IconComponent = ICON_MAP[card.icon];
                  return <IconComponent className="h-6 w-6 text-primary" />;
                })()
              ) : (
                <span className="text-lg">{card.icon}</span>
              )
            ) : null}
          </div>
          <h3 className="mb-3 font-semibold text-foreground text-xl">
            {card.title || "Benefit Title"}
          </h3>
          {card.paragraph ? (
            <RichTextDisplay
              className="text-muted-foreground leading-relaxed **:text-inherit"
              content={card.paragraph}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              Benefit description will appear here...
            </p>
          )}
        </div>
      </button>
    );
  };

  const BenefitCardForm = ({ card }: { card: (typeof cards)[number] }) => {
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
            <p className="font-medium text-sm">Benefit Title</p>
            <Input
              className="truncate"
              onChange={(event) => {
                const value = event.target.value;
                onCardFieldChange(card.entryKey, "title", value);
              }}
              placeholder={placeholders.title || "Business Networking"}
              value={card.title}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-sm">Benefit Paragraph</p>
          <MarkdownTextarea
            className="max-h-[150px] overflow-y-auto"
            onChange={(value) => {
              onCardFieldChange(card.entryKey, "paragraph", value);
            }}
            placeholder={placeholders.paragraph || "Enter benefit description"}
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
              Back to Benefits
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left side - Edit form */}
            <div className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">
                    Benefit Card {editingCardIndex + 1}
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
                <BenefitCardForm card={editingCard} />
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="flex flex-col gap-4">
              <p className="font-semibold text-sm">Preview</p>
              <Card className="max-h-96 overflow-hidden">
                <CardContent className="max-h-96 overflow-y-auto p-8">
                  <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3">
                    {editingCard.icon &&
                      (typeof editingCard.icon === "string" &&
                      ICON_MAP[editingCard.icon] ? (
                        (() => {
                          const IconComponent = ICON_MAP[editingCard.icon];
                          return (
                            <IconComponent className="h-6 w-6 text-primary" />
                          );
                        })()
                      ) : (
                        <span className="text-lg">{editingCard.icon}</span>
                      ))}
                  </div>
                  <h3 className="mb-3 font-semibold text-foreground text-xl">
                    {editingCard.title || "Benefit Title"}
                  </h3>
                  {editingCard.paragraph ? (
                    <RichTextDisplay
                      className="text-muted-foreground leading-relaxed **:text-inherit"
                      content={editingCard.paragraph}
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      Benefit description will appear here...
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
