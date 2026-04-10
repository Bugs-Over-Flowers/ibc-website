import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentSectionCardProps } from "../../_types/section-props";

export function ContentSectionCard({
  title,
  description,
  icon: Icon,
  accentClass,
  iconClass,
  children,
}: ContentSectionCardProps) {
  return (
    <Card className="relative h-full overflow-hidden border border-border/80 bg-card/95 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <CardHeader className="space-y-2">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
