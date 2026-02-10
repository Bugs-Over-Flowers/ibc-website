export type OptimisticCheckIn = {
  checkInId: string;
  checkInTime: string;
  remarks: string | null;
  eventDayId: string;
};
export type CheckInInput = {
  eventDayId: string;
  participants: Array<{
    participantId: string;
    remarks?: string;
  }>;
};
