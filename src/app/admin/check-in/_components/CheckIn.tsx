"use client";

import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { formatDate } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { ParticipantCheckInItem } from "@/lib/validation/checkin/checkin-list";
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
  const newRemarksMap = useCheckInStore((state) => state.newRemarks);

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

  const eventDayToday = useMemo(() => {
    const localToday = formatDate(new Date(), "yyyy-MM-dd");

    return (
      checkInData?.eventDays.find((day) => day.eventDate === localToday) || null
    );
  }, [checkInData]);

  const checkInListExistingToday = (
    participantList: ParticipantCheckInItem[],
  ) => {
    if (!checkInData || !eventDayToday) return [];

    const dateToday = formatDate(new Date(), "yyyy-MM-dd");

    return participantList.filter((participant) => {
      if (!participant.date) return false;
      const participantCheckInDate = formatDate(
        new Date(participant.date),
        "yyyy-MM-dd",
      );
      return participantCheckInDate === dateToday;
    });
  };

  const handleScan = async (codes: IDetectedBarcode[]) => {
    // validation
    if (!codes.length || codes.length === 0) return;

    const { rawValue } = codes[0];
    if (identifier === rawValue) return;

    // setting data
    setIdentifier(rawValue);
    await handleDecodeData(rawValue);
  };

  const handleCheckIn = async (checkInParticipants: string[]) => {
    if (!checkInData || !checkInData.eventDays.length) {
      toast.error("Event not found");
      return;
    }

    if (!identifier) {
      toast.error("No identifier found");
      return;
    }
    // get local date

    if (!eventDayToday) {
      toast.error("Today may not be an event date");
      return;
    }

    const { data } = await optimisticCheckInExecute({
      participantIds: checkInParticipants,
      remarksMap: newRemarksMap,
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

    // setting store data
    setCheckInData(data);
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
          {identifier && eventDayToday && (
            <RegistrationDetails
              day={eventDayToday.label}
              eventTitle={checkInData.eventDetails.eventTitle}
              registrationIdentifier={identifier}
            />
          )}
          <ParticipantSelectionTable
            handleCheckIn={handleCheckIn}
            isPending={optimisticCheckInIsPending}
            // participantList={
            //   checkInListExistingToday(optimisticCheckInList.checkInList) ??
            //   checkInListExistingToday(checkInData.checkInList)
            // }

            participantList={
              optimisticCheckInList.checkInList ?? checkInData.checkInList
            }
          />
        </div>
      )}
    </>
  );
}
