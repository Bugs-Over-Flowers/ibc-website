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
import { useCheckInStore } from "../_hooks/useCheckInStore.store";
import ParticipantSelectionTable from "./ParticipantSelectionTable";
import QRCamera from "./QRCamera";
import RegistrationDetails from "./RegistrationDetails";

export default function CheckIn() {
  const {
    execute: decodeQR,
    reset: resetDecodeQR,
    isPending,
  } = useAction(tryCatch(getRegistrationListCheckInRPC), {
    persist: true,
    onError: (error) => {
      toast.error(error);
    },
  });
  const setCheckInData = useCheckInStore((state) => state.setCheckInData);
  const checkInData = useCheckInStore((state) => state.checkInData);
  const updateRemarks = useCheckInStore((state) => state.updateRemarks);
  const remarksMap = useCheckInStore((state) => state.remarks || {});

  const {
    optimistic: optimisticCheckInList,
    execute: optimisticCheckInExecute,
    isPending: optimisticCheckInIsPending,
  } = useCheckIn({
    checkInList: checkInData?.checkInList,
  });

  const reset = () => {
    resetDecodeQR();
    useCheckInStore.setState({
      checkInData: null,
      participantIds: null,
      remarks: {},
    });
  };
  const [identifier, setIdentifier] = useState<RegistrationIdentifier | null>(
    null,
  );

  const handleScan = async (codes: IDetectedBarcode[]) => {
    // validation
    if (!codes.length || codes.length === 0) return;

    const { rawValue } = codes[0];
    if (identifier === rawValue) return;

    // setting data
    setIdentifier(rawValue);
    await handleDecodeData(rawValue);
  };

  const handleCheckIn = async (participantIds: string[]) => {
    if (!checkInData || !checkInData.eventDays.length) {
      toast.error("Event not found");
      return;
    }

    if (!identifier) {
      toast.error("No identifier found");
      return;
    }

    if (!participantIds || participantIds.length === 0) {
      toast.error("No participants selected");
      return;
    }

    const { data } = await optimisticCheckInExecute({
      participantIds,
      remarksMap,
      eventDayId: checkInData.eventDays[0].eventDayId,
    });

    if (!data) {
      return;
    }

    handleDecodeData(identifier);
  };

  const handleDecodeData = async (identifier: string) => {
    const { data } = await decodeQR(identifier);

    // validation for fetching data
    if (!data) {
      toast.error("No registration found for this QR code");
      return;
    }
    if (data?.allIsCheckedIn) {
      toast.success("All participants checked in");
    }
    // setting store data
    setCheckInData(data);
    updateRemarks(
      data.checkInList.reduce(
        (acc, curr) => {
          acc[curr.participantId] = curr.remarks;
          return acc;
        },
        {} as Record<string, string | null>,
      ),
    );
  };
  return (
    <>
      <div className="flex flex-col gap-4">
        <QRCamera
          handleScan={handleScan}
          isPaused={isPending || !!checkInData}
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
      {checkInData && (
        <div className="w-full">
          {identifier && (
            <RegistrationDetails
              day={checkInData.eventDays[0].label}
              eventTitle={checkInData.eventDetails.eventTitle}
              registrationIdentifier={identifier}
            />
          )}
          <ParticipantSelectionTable
            handleCheckIn={handleCheckIn}
            isPending={optimisticCheckInIsPending}
            participantList={
              optimisticCheckInList.checkInList ?? checkInData.checkInList
            }
          />
        </div>
      )}
    </>
  );
}
