import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { getEventDays } from "@/server/events/actions/getEventDays";

interface CheckInListTabWrapperProps {
  tabs: Awaited<ReturnType<typeof getEventDays>>;
  children: React.ReactNode;
}

export default function CheckInListTabWrapper({
  tabs,
  children,
}: CheckInListTabWrapperProps) {
  return (
    <Tabs defaultValue={tabs[0].eventDayId}>
      <TabsList className={"gap-3"}>
        {tabs?.map((eventDay) => (
          <TabsTrigger key={eventDay.eventDayId} value={eventDay.eventDayId}>
            {eventDay.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
