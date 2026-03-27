import { Users } from "lucide-react";
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
    <div className="mx-auto max-w-md rounded-2xl p-12 backdrop-blur-xl">
      <Empty>
        <EmptyMedia>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No members found</EmptyTitle>
          <EmptyDescription>
            No members match your current filters.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-center text-muted-foreground text-sm">
            Adjust your filters or invite new members from the dashboard to see
            them listed here.
          </p>
        </EmptyContent>
      </Empty>
    </div>
  );
}
