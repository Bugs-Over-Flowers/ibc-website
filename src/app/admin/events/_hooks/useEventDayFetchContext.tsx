"use client";

import React, { createContext } from "react";
import type { getAllEventDaysByEventId } from "@/server/events/queries/getAllEventDaysByEventId";

type IEventDayFetchContext = {
  getAllEventDaysByEventId: ReturnType<typeof getAllEventDaysByEventId>;
};

const EventDayFetchContext = createContext<IEventDayFetchContext | null>(null);

interface EventDayFetchProviderProps {
  children: React.ReactNode;
  getAllEventDaysByEventId: ReturnType<typeof getAllEventDaysByEventId>;
}

export const useEventDayFetchContext = () => {
  const context = React.useContext(EventDayFetchContext);
  if (!context) {
    throw new Error(
      "useEventDayFetchContext must be used within a EventDayFetchProvider",
    );
  }
  return context;
};

export function EventDayFetchProvider({
  getAllEventDaysByEventId,
  children,
}: EventDayFetchProviderProps) {
  return (
    <EventDayFetchContext.Provider value={{ getAllEventDaysByEventId }}>
      {children}
    </EventDayFetchContext.Provider>
  );
}
