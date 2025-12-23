import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationsListSkeleton() {
  const skeletonPlaceholders = Array.from({ length: 5 }, (_, i) => ({
    id: `skeleton-row-${i}`,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skeletonPlaceholders.map(({ id }) => (
          <div className="space-y-2" key={id}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
