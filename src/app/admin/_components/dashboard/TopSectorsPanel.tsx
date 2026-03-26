import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TopSectorsPanelProps = {
  sectors: Array<{ sectorName: string; count: number }>;
};

export function TopSectorsPanel({ sectors }: TopSectorsPanelProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Top Performing Sectors</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {sectors.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No sector data available.
          </p>
        ) : null}

        {sectors.map((sector, index) => (
          <div
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-border/50 bg-background/80 px-3 py-2"
            key={sector.sectorName}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
              {index + 1}
            </span>
            <span className="line-clamp-1 font-medium text-sm">
              {sector.sectorName}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {sector.count} members
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
