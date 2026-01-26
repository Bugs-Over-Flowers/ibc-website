import { AlertCircle } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ErrorCheckInList() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>Failed to load check-ins</EmptyTitle>
        <EmptyDescription>
          An error occurred while loading the check-in list. Please try
          refreshing the page.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
