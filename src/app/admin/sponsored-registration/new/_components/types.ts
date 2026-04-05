export type CreateSREventOption = {
  eventId: string;
  eventTitle: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventType: "public" | "private" | null;
  registrationFee: number;
};
