import { CircleAlert } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DraftEventEmptyComponent() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>This event may be a draft</EmptyTitle>
        <EmptyDescription>
          The check in list is not yet available for this event.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
