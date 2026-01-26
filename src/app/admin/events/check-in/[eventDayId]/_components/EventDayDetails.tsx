import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { formatDate } from "@/lib/events/eventUtils";
import type { Database } from "@/lib/supabase/db.types";

interface EventDayDetailsProps {
  eventDayData: Pick<
    Database["public"]["Tables"]["EventDay"]["Row"],
    "label" | "eventDate"
  > & {
    eventTitle: string;
  };
}

export default function EventDayDetails({
  eventDayData,
}: EventDayDetailsProps) {
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle className="h-4">{eventDayData.eventTitle}</ItemTitle>
        <ItemDescription>
          {eventDayData.label} - {formatDate(eventDayData.eventDate)}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
