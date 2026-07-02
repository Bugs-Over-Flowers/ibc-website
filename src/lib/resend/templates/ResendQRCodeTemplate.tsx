import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "react-email";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import TermsAndConditions from "../components/TermsAndConditions";
import TicketCard from "../components/TicketCard";

interface ResendQRCodeProps {
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    "eventTitle" | "eventHeaderUrl"
  >;
  eventDateRange: string;
  eventVenue: string;
  self: {
    fullName: string;
    email: string;
    participantIdentifier: string;
  };
  participants?: {
    fullName: string;
    email: string;
    participantIdentifier: string;
  }[];
}

export default function ResendQRCode({
  eventDetails,
  eventDateRange,
  eventVenue,
  participants,
  self,
}: ResendQRCodeProps) {
  if (!eventDetails.eventHeaderUrl) {
    throw new Error("Event header URL is required");
  }

  const previewString = `Resend Sign-in QR Code for ${eventDetails.eventTitle}`;
  const hasOthers = participants && participants.length > 0;

  return (
    <Html>
      <Head />
      <Preview>{previewString}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            alt={eventDetails.eventTitle}
            src={eventDetails.eventHeaderUrl}
            style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}
          />

          <Heading style={h1}>QR Code for Sign In</Heading>

          <Text style={text}>
            Your QR Code{hasOthers ? "s" : ""} for Sign In to{" "}
            <strong>{eventDetails.eventTitle}</strong>{" "}
            {hasOthers ? "have" : "has"} been resent to you.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailLabel}>Event</Text>
            <Text style={detailValue}>{eventDetails.eventTitle}</Text>
            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{eventDateRange}</Text>
            <Text style={detailLabel}>Venue</Text>
            <Text style={detailValue}>{eventVenue}</Text>
          </Section>

          <Text style={text}>
            Please keep a copy of the QR code{hasOthers ? "s" : ""} below to
            sign in to the event.
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <TicketCard
              cid="participantQrCodeCID"
              email={self.email}
              identifier={self.participantIdentifier}
              subtitle={self.email}
              title={self.fullName}
            />
            {participants?.map((participant) => (
              <TicketCard
                cid={`participantQrCodeCID-${participant.participantIdentifier}`}
                email={participant.email}
                identifier={participant.participantIdentifier}
                key={participant.participantIdentifier}
                subtitle={participant.email}
                title={participant.fullName}
              />
            ))}
          </Section>

          <Section style={detailsSection}>
            <Text style={detailLabel}>People under this registration</Text>
            <Text style={detailValue}>
              • {self.fullName} ({self.email}) - <strong>Registrant</strong>
            </Text>
            {hasOthers &&
              participants.map((participant) => (
                <Text key={participant.email} style={detailValue}>
                  • {participant.fullName} ({participant.email})
                </Text>
              ))}
          </Section>

          <TermsAndConditions />

          <Text style={footer}>
            If you have questions, reply to this email and we will be happy to
            assist.
            <br />
            <br />
            Best regards,
            <br />
            Iloilo Business Club
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ResendQRCode.PreviewProps = {
  eventDetails: {
    eventId: "1010",
    eventTitle: "Awarding Ceremony 2024",
    eventHeaderUrl: "https://placehold.co/600x400",
  },
  eventDateRange: "January 20, 2024, 12:00 PM to January 25, 2024, 8:00 PM",
  eventVenue: "Grand Ballroom, Iloilo Convention Center",
  participants: [
    {
      fullName: "John Doe",
      email: "john.doe@example.com",
      participantIdentifier: "ibc-par-e5f6g7h8",
    },
    {
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      participantIdentifier: "ibc-par-i9j0k1l2",
    },
  ],
  self: {
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    participantIdentifier: "ibc-par-a1b2c3d4",
  },
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};

const detailsSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  margin: "24px auto",
  maxWidth: "520px",
  padding: "24px",
};

const detailLabel = {
  color: "#71717a",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
  marginTop: "16px",
};

const detailValue = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 8px 0",
};
