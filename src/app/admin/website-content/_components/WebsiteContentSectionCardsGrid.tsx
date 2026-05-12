"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  WebsiteContentSection,
  WebsiteContentSectionKey,
} from "./websiteContentSections";

type WebsiteContentSectionCardsGridProps = {
  sections: readonly WebsiteContentSection[];
  getSavedCardsDisplay: (section: WebsiteContentSectionKey) => string | null;
  getUpdatedAtDisplay: (section: WebsiteContentSectionKey) => string | null;
  onOpenSection: (section: WebsiteContentSectionKey) => void;
};

function WebsiteContentSectionCard({
  section,
  getSavedCardsDisplay,
  getUpdatedAtDisplay,
  onOpenSection,
}: {
  section: WebsiteContentSection;
  getSavedCardsDisplay: (section: WebsiteContentSectionKey) => string | null;
  getUpdatedAtDisplay: (section: WebsiteContentSectionKey) => string | null;
  onOpenSection: (section: WebsiteContentSectionKey) => void;
}) {
  const Icon = section.icon;
  const savedCardsValue = getSavedCardsDisplay(section.key);
  const updatedAtValue = getUpdatedAtDisplay(section.key);

  return (
    <button
      className="group text-left"
      onClick={() => onOpenSection(section.key)}
      type="button"
    >
      <Card className="relative h-full overflow-hidden border border-border/80 bg-card/95 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div
          className={`absolute inset-x-0 top-0 h-1 ${section.accentClass}`}
        />
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className={`rounded-xl p-2.5 ${section.iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">{section.title}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {section.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground text-sm">
          <div className="flex items-center justify-between gap-3">
            <span>Saved cards:</span>
            {savedCardsValue ? (
              <span className="tabular-nums">{savedCardsValue}</span>
            ) : (
              <Skeleton className="h-4 w-10" />
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Updated:</span>
            {updatedAtValue ? (
              <span className="truncate">{updatedAtValue}</span>
            ) : (
              <Skeleton className="h-4 w-28" />
            )}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export function WebsiteContentSectionCardsGrid({
  sections,
  getSavedCardsDisplay,
  getUpdatedAtDisplay,
  onOpenSection,
}: WebsiteContentSectionCardsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sections.map((section) => (
        <WebsiteContentSectionCard
          getSavedCardsDisplay={getSavedCardsDisplay}
          getUpdatedAtDisplay={getUpdatedAtDisplay}
          key={section.key}
          onOpenSection={onOpenSection}
          section={section}
        />
      ))}
    </div>
  );
}
