"use client";
import React from "react";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import useRegistrationStore from "@/hooks/registration.store";
import type { getAllMembers } from "@/server/members/queries/getAllMembers";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

interface RegistrationFormProps {
  members: Awaited<ReturnType<typeof getAllMembers>>;
  initialEventDetails: RegistrationStoreEventDetails;
  sponsorUuid?: string;
  sponsoredRegistrationId?: string;
  sponsorFeeDeduction?: number;
  sponsorName?: string;
}

export default function RegistrationForm({
  members,
  initialEventDetails,
  sponsorUuid,
  sponsoredRegistrationId,
  sponsorFeeDeduction,
  sponsorName,
}: RegistrationFormProps) {
  const step = useRegistrationStore((state) => state.step);
  const eventDetails = useRegistrationStore((state) => state.eventDetails);
  const currentEventId = useRegistrationStore(
    (state) => state.eventDetails?.eventId,
  );
  const setEventDetails = useRegistrationStore(
    (state) => state.setEventDetails,
  );
  const resetStore = useRegistrationStore((state) => state.resetStore);
  const setSponsorInfo = useRegistrationStore((state) => state.setSponsorInfo);
  const clearSponsorInfo = useRegistrationStore(
    (state) => state.clearSponsorInfo,
  );

  React.useEffect(() => {
    if (initialEventDetails.eventId !== currentEventId) {
      resetStore();
    }

    setEventDetails(initialEventDetails);
  }, [initialEventDetails, currentEventId, resetStore, setEventDetails]);

  // Sync sponsor info from validated URL params
  React.useEffect(() => {
    if (!currentEventId) {
      return;
    }

    if (
      sponsorUuid &&
      sponsoredRegistrationId &&
      sponsorName &&
      sponsorFeeDeduction !== undefined &&
      sponsorFeeDeduction !== null
    ) {
      setSponsorInfo({
        sponsorUuid,
        sponsoredRegistrationId,
        sponsoredBy: sponsorName,
        feeDeduction: Number(sponsorFeeDeduction),
      });
      return;
    }

    clearSponsorInfo();
  }, [
    currentEventId,
    sponsorUuid,
    sponsoredRegistrationId,
    sponsorFeeDeduction,
    sponsorName,
    setSponsorInfo,
    clearSponsorInfo,
  ]);

  if (!eventDetails) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        Loading Registration Form...
      </div>
    );
  }

  return (
    <main>
      {step === 1 ? (
        <Step1 members={members} />
      ) : step === 2 ? (
        <Step2 />
      ) : step === 3 ? (
        <Step3 />
      ) : (
        <Step4 members={members} />
      )}
    </main>
  );
}
