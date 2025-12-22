import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyMembersState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Empty>
          <EmptyMedia />
          <EmptyHeader>
            <EmptyTitle>No members found</EmptyTitle>
            <EmptyDescription>
              No members match your current filters.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-center text-muted-foreground text-sm">
              Adjust your filters or invite new members from the dashboard to
              see them listed here.
            </p>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}
