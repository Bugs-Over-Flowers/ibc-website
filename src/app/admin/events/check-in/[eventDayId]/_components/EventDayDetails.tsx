import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { formatDate } from "@/lib/events/eventUtils";
import type { Database } from "@/lib/supabase/db.types";

interface EventDayDetailsProps {
  eventDay: Pick<
    Database["public"]["Tables"]["EventDay"]["Row"],
    "label" | "eventDate"
  >;
}

export default function EventDayDetails({ eventDay }: EventDayDetailsProps) {
  return (
    <Item variant={"outline"}>
      <ItemContent>
        <ItemTitle>{eventDay.label}</ItemTitle>
        <ItemDescription>{formatDate(eventDay.eventDate)}</ItemDescription>
      </ItemContent>
    </Item>
  );
}
