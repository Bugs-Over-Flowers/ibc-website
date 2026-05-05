import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  WebsiteContentCardState,
  WebsiteContentFormState,
} from "@/server/website-content/types";

export interface ContentSectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  iconClass: string;
  children: ReactNode;
}

export interface VisionMissionSectionProps {
  visionParagraph: string;
  missionParagraph: string;
  placeholders: WebsiteContentFormState;
  onVisionParagraphChange: (value: string) => void;
  onMissionParagraphChange: (value: string) => void;
}

export interface GoalsSectionProps {
  cards: WebsiteContentCardState[];
  placeholders: WebsiteContentFormState;
  isSectionActionDisabled: boolean;
  onAddCard: () => void;
  isDeleteMode: boolean;
  hasSelectedCards: boolean;
  selectedCount: number;
  selectedCardEntryKeys: Set<string>;
  onDeleteCardsClick: (entryKey?: string) => void;
  onCancelDeleteMode: () => void;
  onSelectAllCards: () => void;
  onUnselectAllCards: () => void;
  onToggleCardSelected: (entryKey: string, checked: boolean) => void;
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
}

export interface CompanyThrustsSectionProps {
  cards: WebsiteContentCardState[];
  placeholders: WebsiteContentFormState;
  isSectionActionDisabled: boolean;
  onAddCard: () => void;
  isDeleteMode: boolean;
  hasSelectedCards: boolean;
  selectedCount: number;
  selectedCardEntryKeys: Set<string>;
  onDeleteCardsClick: (entryKey?: string) => void;
  onCancelDeleteMode: () => void;
  onSelectAllCards: () => void;
  onUnselectAllCards: () => void;
  onToggleCardSelected: (entryKey: string, checked: boolean) => void;
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
}

export interface BoardOfTrusteesSectionProps {
  cards: WebsiteContentCardState[];
  placeholders: WebsiteContentFormState;
  isSectionActionDisabled: boolean;
  onAddCard: (group: "featured" | "officers" | "trustees" | "other") => void;
  isDeleteMode: boolean;
  hasSelectedCards: boolean;
  selectedCount: number;
  selectedCardEntryKeys: Set<string>;
  onDeleteCardsClick: (entryKey?: string) => void;
  onCancelDeleteMode: () => void;
  onSelectAllCards: () => void;
  onUnselectAllCards: () => void;
  onToggleCardSelected: (entryKey: string, checked: boolean) => void;
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
  onCardsReorder: (nextCards: WebsiteContentCardState[]) => void;
}

export interface SecretariatSectionProps {
  cards: WebsiteContentCardState[];
  placeholders: WebsiteContentFormState;
  isSectionActionDisabled: boolean;
  onAddCard: () => void;
  isDeleteMode: boolean;
  hasSelectedCards: boolean;
  selectedCount: number;
  selectedCardEntryKeys: Set<string>;
  onDeleteCardsClick: (entryKey?: string) => void;
  onCancelDeleteMode: () => void;
  onSelectAllCards: () => void;
  onUnselectAllCards: () => void;
  onToggleCardSelected: (entryKey: string, checked: boolean) => void;
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
  onCardsReorder: (nextCards: WebsiteContentCardState[]) => void;
}

export interface LandingBenefitsSectionProps {
  cards: WebsiteContentCardState[];
  placeholders: WebsiteContentFormState;
  isSectionActionDisabled: boolean;
  onAddCard: () => void;
  isDeleteMode: boolean;
  hasSelectedCards: boolean;
  selectedCount: number;
  selectedCardEntryKeys: Set<string>;
  onDeleteCardsClick: (entryKey?: string) => void;
  onCancelDeleteMode: () => void;
  onSelectAllCards: () => void;
  onUnselectAllCards: () => void;
  onToggleCardSelected: (entryKey: string, checked: boolean) => void;
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
}

export interface HeroSectionCarouselProps {
  cards: WebsiteContentCardState[];
  onCardFieldChange: (
    entryKey: string,
    field: keyof WebsiteContentCardState,
    value: string,
  ) => void;
  onCardsReorder: (nextCards: WebsiteContentCardState[]) => void;
}
