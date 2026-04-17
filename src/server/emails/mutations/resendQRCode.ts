"use server";
import { revalidatePath } from "next/cache";
import { render } from "react-email";
import { sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/events/eventUtils";
import { generateQRBuffer } from "@/lib/qr/generateQRCode";
import ResendQRCodeTemplate from "@/lib/resend/templates/ResendQRCodeTemplate";
import { createActionClient } from "@/lib/supabase/server";

interface SendRegistrationConfirmationEmailProps {
  toEmail: string;
  registrationId: string;
  eventId: string;
  qrData: string;
}

export const resendQRCode = async ({
  toEmail,
  registrationId,
  eventId,
  qrData,
}: SendRegistrationConfirmationEmailProps) => {
  const qrBuffer = await generateQRBuffer(qrData);

  const supabase = await createActionClient();

  // get event details
  const { data: eventDetails } = await supabase
    .from("Event")
    .select(
      `eventTitle,
      eventId,
      eventTitle,
      description,
      venue,
      eventHeaderUrl,
      eventStartDate,
      eventEndDate,
      eventType,
      registrationFee`,
    )
    .eq("eventId", eventId)
    .single()
    .throwOnError();

  if (!eventDetails) {
    throw new Error("Event not found");
  }

  const eventDateRange =
    eventDetails.eventStartDate && eventDetails.eventEndDate
      ? `${formatDate(
          eventDetails.eventStartDate,
          "MMMM d, yyyy, h:mm a",
          "Asia/Manila",
        )} to ${formatDate(
          eventDetails.eventEndDate,
          "MMMM d, yyyy, h:mm a",
          "Asia/Manila",
        )}`
      : formatDate(
          eventDetails.eventStartDate || eventDetails.eventEndDate || null,
          "MMMM d, yyyy, h:mm a",
          "Asia/Manila",
        );

  // get registration details
  const { data: participants } = await supabase
    .from("Participant")
    .select("firstName, lastName, email, isPrincipal, participantId")
    .eq("registrationId", registrationId)
    .throwOnError();

  if (!participants || participants.length === 0) {
    throw new Error("Participants not found");
  }

  // get the registrant details
  const registrantDetails = participants.find(
    (participant) => participant.isPrincipal,
  );

  if (!registrantDetails) {
    throw new Error("Registrant details not found");
  }

  const html = await render(
    ResendQRCodeTemplate({
      eventDetails,
      eventDateRange,
      eventVenue: eventDetails.venue ?? "TBA",
      registrationIdentifier: qrData,
      self: {
        email: toEmail,
        fullName: `${registrantDetails.firstName} ${registrantDetails.lastName}`,
      },
      otherParticipants: participants
        .filter((participant) => !participant.isPrincipal)
        .map((participant) => ({
          email: participant.email,
          fullName: `${participant.firstName} ${participant.lastName}`,
        })),
    }),
  );

  await sendEmail({
    to: toEmail,
    subject: `Resend QR Code for ${eventDetails.eventTitle}`,
    html,
    attachments: [
      {
        filename: `${qrData}.png`,
        content: qrBuffer,
        cid: "qrCodeCID",
      },
    ],
  });

  // change the email if does not match participant email
  if (toEmail !== registrantDetails.email) {
    await supabase
      .from("Participant")
      .update({ email: toEmail })
      .eq("participantId", registrantDetails.participantId)
      .throwOnError();
  }
  // updateTag(CACHE_TAGS.registrations.details);
  // updateTag(CACHE_TAGS.registrations.list);
  // updateTag(CACHE_TAGS.registrations.event);
  // updateTag(CACHE_TAGS.events.registrations);
  revalidatePath("/admin/events/[eventId]/registration-list", "page");
};
