"use client";

import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationIdentifier } from "@/lib/validation/qr/standard";
import { getRegistrationListCheckInRPC } from "@/server/attendance/actions/getRegistrationListCheckInRPC";
import { useCheckIn } from "../_hooks/useCheckIn";
import ParticipantSelection from "./ParticipantSelection";
import QRCamera from "./QRCamera";
import RegistrationDetails from "./RegistrationDetails";

export default function CheckIn() {
  const {
    data: checkInDetails,
    execute: decodeQR,
    reset: resetDecodeQR,
    isPending,
  } = useAction(tryCatch(getRegistrationListCheckInRPC), {
    persist: true,
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    optimistic: optimisticCheckInList,
    execute: optimisticCheckInExecute,
    isPending: optimisticCheckInIsPending,
  } = useCheckIn({
    checkInList: checkInDetails?.checkInList,
  });

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

    if (!checkInDetails || !checkInDetails.eventDays.length) {
      toast.error("Event not found");
      return;
    }

    if (!identifier) {
      toast.error("No identifier found");
      return;
    }

    const { data } = await optimisticCheckInExecute(
      participantIds,
      checkInDetails.eventDays[0].eventDayId,
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

    if (data?.allIsCheckedIn) {
      toast.success("All participants checked in");
    }
  };
  return (
    <>
      <div className="flex flex-col gap-4">
        <QRCamera
          handleScan={handleScan}
          isPaused={isPending || !!checkInDetails}
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
      {checkInDetails && (
        <div className="w-full">
          {identifier && (
            <RegistrationDetails
              day={checkInDetails.eventDays[0].label}
              eventTitle={checkInDetails.eventDetails.eventTitle}
              registrationIdentifier={identifier}
            />
          )}
          <ParticipantSelection
            handleCheckIn={handleCheckIn}
            isPending={optimisticCheckInIsPending}
            participantList={
              optimisticCheckInList.checkInList ?? checkInDetails.checkInList
            }
          />
        </div>
      )}
    </>
  );
}
