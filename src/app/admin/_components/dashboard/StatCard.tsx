import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  badge?: string;
  icon: ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "violet" | "rose" | "cyan";
  className?: string;
};

const TONE_STYLES: Record<
  NonNullable<StatCardProps["tone"]>,
  {
    border: string;
    iconWrap: string;
    value: string;
  }
> = {
  neutral: {
    border: "border-border/60",
    iconWrap: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
  blue: {
    border: "border-status-blue/30",
    iconWrap: "bg-status-blue/10 text-status-blue",
    value: "text-status-blue",
  },
  green: {
    border: "border-status-green/30",
    iconWrap: "bg-status-green/10 text-status-green",
    value: "text-status-green",
  },
  amber: {
    border: "border-status-orange/30",
    iconWrap: "bg-status-orange/10 text-status-orange",
    value: "text-status-orange",
  },
  violet: {
    border: "border-status-purple/30",
    iconWrap: "bg-status-purple/10 text-status-purple",
    value: "text-status-purple",
  },
  rose: {
    border: "border-status-red/30",
    iconWrap: "bg-status-red/10 text-status-red",
    value: "text-status-red",
  },
  cyan: {
    border: "border-status-teal/30",
    iconWrap: "bg-status-teal/10 text-status-teal",
    value: "text-status-teal",
  },
};

export function StatCard({
  title,
  value,
  description,
  badge,
  icon,
  tone = "neutral",
  className,
}: StatCardProps) {
  const style = TONE_STYLES[tone];

  return (
    <Card
      className={cn(
        "h-full min-h-[170px] bg-card/90 shadow-sm",
        style.border,
        className,
      )}
    >
      <CardHeader className="border-border/40 border-b pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-xs uppercase tracking-wide">
            {title}
          </CardDescription>
          <div
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${style.iconWrap}`}
          >
            {icon}
          </div>
        </div>
        <CardTitle
          className={`font-semibold text-2xl tabular-nums ${style.value}`}
        >
          {value}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex min-h-10 items-start justify-between gap-3">
          <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
          {badge ? (
            <Badge className="shrink-0 rounded-full" variant="secondary">
              {badge}
            </Badge>
          ) : (
            <span className="invisible shrink-0 rounded-full px-2 py-0.5 text-xs">
              placeholder
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
