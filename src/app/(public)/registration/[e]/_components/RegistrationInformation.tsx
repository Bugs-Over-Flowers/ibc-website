"use client";

import { format } from "date-fns";
import { useEffect, useEffectEvent } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { RegistrationStoreEventDetails } from "../../../../../hooks/registration.store";
import useRegistrationStore from "../../../../../hooks/registration.store";
import Stepper from "./Stepper";

const RegistrationInformation = (
  initialEventDetails: RegistrationStoreEventDetails,
) => {
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const setEventDetails = useRegistrationStore(
    (state) => state.setEventDetails,
  );

  const setInitialEventDetails = useEffectEvent(() => {
    if (initialEventDetails && !eventDetails) {
      setEventDetails(initialEventDetails);
    }
  });

  useEffect(() => {
    setInitialEventDetails();
  }, []);
  return (
    <div className="space-y-5 p-3 md:w-96">
      <Card>
        <CardContent className="flex-col items-start">
          <CardTitle>{eventDetails?.eventTitle}</CardTitle>
          {format(
            new Date(eventDetails?.eventStartDate || Date.now()),
            "iiii, MMMM dd, yyyy",
          )}
        </CardContent>
      </Card>
      <Stepper />
    </div>
  );
};

export default RegistrationInformation;
