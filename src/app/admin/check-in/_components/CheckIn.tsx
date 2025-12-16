"use client";

import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationIdentifier } from "@/lib/validation/qr/standard";
import { getRegistrationIdentifierDetails } from "@/server/attendance/mutations/getRegistrationIdentifierDetails";

import { useCheckIn } from "../_hooks/useCheckIn";
import ParticipantSelection from "./ParticipantSelection";
import QRCamera from "./QRCamera";
import RegistrationDetails from "./RegistrationDetails";

export default function CheckIn() {
  const {
    data: registrationState,
    execute: decodeQR,
    reset: resetDecodeQR,
    isPending,
  } = useAction(tryCatch(getRegistrationIdentifierDetails), {
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    optimistic: optimisticCheckIn,
    execute: optimisticCheckInExecute,
    isPending: optimisticCheckInIsPending,
  } = useCheckIn(registrationState);

  const reset = () => {
    resetDecodeQR();
  };
  const [identifier, setIdentifier] = useState<RegistrationIdentifier | null>(
    null,
  );

  const handleCheckIn = async (participantIds: string[]) => {
    if (!participantIds.length) {
      toast.error("Please select at least one participant");
      return;
    }

    if (!optimisticCheckIn || !optimisticCheckIn.data.eventDays.length) {
      toast.error("Event not found");
      return;
    }

    if (!identifier) {
      toast.error("No identifier found");
      return;
    }

    const { data } = await optimisticCheckInExecute(
      participantIds,
      optimisticCheckIn.data.eventDays[0].eventDayId,
    );

    if (!data) {
      return;
    }

    decodeQR(identifier);
  };

  const handleScan = async (codes: IDetectedBarcode[]) => {
    if (!codes.length || codes.length === 0) return;

    const { rawValue } = codes[0];
    if (identifier === rawValue) return;

    setIdentifier(rawValue);
    const { data } = await decodeQR(rawValue);

    if (data?.message) {
      toast.success(data.message);
    }
  };
  return (
    <>
      <div className="flex flex-col gap-4">
        <QRCamera
          handleScan={handleScan}
          isPaused={isPending || !!registrationState}
        />
        {identifier !== null && (
          <Button
            onClick={() => {
              reset();
              setIdentifier(null);
            }}
          >
            Reset
          </Button>
        )}
      </div>
      {optimisticCheckIn?.data && (
        <div className="w-full">
          {identifier && (
            <RegistrationDetails
              eventTitle={optimisticCheckIn.data.eventDetails.eventTitle}
              registrationIdentifier={identifier}
            />
          )}
          {optimisticCheckIn.data.participantList.length > 1 && (
            <ParticipantSelection
              handleCheckIn={handleCheckIn}
              isPending={optimisticCheckInIsPending}
              participantList={optimisticCheckIn.data.participantList}
            />
          )}
        </div>
      )}
    </>
  );
}
