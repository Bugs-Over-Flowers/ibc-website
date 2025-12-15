"use client";

import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationIdentifier } from "@/lib/validation/qr/standard";
import { getRegistrationIdentifierDetails } from "@/server/attendance/mutations/getRegistrationIdentifierDetails";
import ParticipantSelection from "./ParticipantSelection";
import QRCamera from "./QRCamera";
import RegistrationDetails from "./RegistrationDetails";

export default function CheckIn() {
  const {
    execute: decodeQR,
    data: res,
    reset,
    isPending,
  } = useAction(tryCatch(getRegistrationIdentifierDetails), {
    onError: (error) => {
      toast.error(error);
    },
  });

  const [identifier, setIdentifier] = useState<RegistrationIdentifier | null>(
    null,
  );

  const handleScan = async (codes: IDetectedBarcode[]) => {
    if (!codes.length || codes.length === 0) return;

    const { rawValue } = codes[0];
    if (identifier === rawValue) return;

    setIdentifier(rawValue);
    const { data } = await decodeQR(rawValue);
    console.log(data);

    if (data?.status === "complete") {
      toast.success(data.message);
    }
  };
  return (
    <>
      <div className="flex flex-col gap-4">
        <QRCamera handleScan={handleScan} isPaused={isPending || !!res} />
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
      {res && res.status === "partial" && (
        <div className="w-full">
          {identifier && (
            <RegistrationDetails
              eventTitle={res?.data.eventDetails.eventTitle}
              registrationIdentifier={identifier}
            />
          )}
          {res?.data.participantList.length > 1 && (
            <ParticipantSelection
              eventDayId={res.data.eventDays[0].eventDayId}
              participantList={res.data.participantList}
            />
          )}
        </div>
      )}
    </>
  );
}
