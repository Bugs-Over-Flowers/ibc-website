import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  badge?: string;
  icon: ReactNode;
};

export function StatCard({
  title,
  value,
  description,
  badge,
  icon,
}: StatCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="border-border/40 border-b pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-xs uppercase tracking-wide">
            {title}
          </CardDescription>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <CardTitle className="font-semibold text-2xl">{value}</CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">{description}</p>
          {badge ? (
            <Badge className="rounded-full" variant="secondary">
              {badge}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
