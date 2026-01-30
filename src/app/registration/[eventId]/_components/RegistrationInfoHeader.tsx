"use client";

import { format } from "date-fns";
import { useEffect, useEffectEvent } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import useRegistrationStore from "@/hooks/registration.store";
import Stepper from "./Stepper";

const RegistrationInfoHeader = (
  initialEventDetails: RegistrationStoreEventDetails,
) => {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const resetStore = useRegistrationStore((state) => state.resetStore);
  const setEventDetails = useRegistrationStore(
    (state) => state.setEventDetails,
  );

  const eventTitle = useRegistrationStore(
    (state) => state.eventDetails?.eventTitle,
  );
  const eventStartDate = useRegistrationStore(
    (state) => state.eventDetails?.eventStartDate,
  );

  // Extract the update logic into useEffectEvent so it doesn't re-trigger the effect
  const updateEventDetails = useEffectEvent(
    (newEventDetails: RegistrationStoreEventDetails) => {
      setEventDetails(newEventDetails);
    },
  );

  useEffect(() => {
    // Only update if the eventId actually changed
    if (initialEventDetails.eventId !== eventDetails?.eventId) {
      // Reset the store to clear old event data, but keep eventDetails
      resetStore();
      // Update with new event details
      updateEventDetails(initialEventDetails);
    }
  }, [initialEventDetails, eventDetails?.eventId, resetStore]);
  return (
    <div className="space-y-5 p-3 md:w-96">
      <Card>
        <CardContent className="flex-col items-start">
          <CardTitle>{eventTitle}</CardTitle>
          {format(
            new Date(eventStartDate || Date.now()),
            "iiii, MMMM dd, yyyy",
          )}
        </CardContent>
      </Card>
      <Stepper />
    </div>
  );
};

export default RegistrationInfoHeader;
