import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyApplicationsStateProps {
  status: "new" | "pending" | "finished";
}

function getDescription(status: "new" | "pending" | "finished"): string {
  const descriptions = {
    new: "new",
    pending: "pending",
    finished: "approved",
  };
  return `There are no ${descriptions[status]} applications at the moment.`;
}

export function EmptyApplicationsState({
  status,
}: EmptyApplicationsStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Empty>
          <EmptyMedia />
          <EmptyHeader>
            <EmptyTitle>No applications found</EmptyTitle>
            <EmptyDescription>{getDescription(status)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-center text-muted-foreground text-sm">
              New applications will appear here once they are submitted.
            </p>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}
