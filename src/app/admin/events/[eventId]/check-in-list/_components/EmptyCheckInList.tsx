import { UserX } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function EmptyCheckInList() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserX />
        </EmptyMedia>
        <EmptyTitle>No check-ins yet</EmptyTitle>
        <EmptyDescription>
          No participants have checked in for this event day.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
