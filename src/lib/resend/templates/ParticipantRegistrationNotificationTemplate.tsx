import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "react-email";
import TermsAndConditions from "../components/TermsAndConditions";
import TicketCard from "../components/TicketCard";

interface ParticipantRegistrationNotificationTemplateProps {
  participants: {
    participantName: string;
    participantIdentifier: string;
    affiliation: string;
    email: string;
  }[];
  registrantName: string;
  eventDetails: {
    eventTitle: string;
    eventHeaderUrl: string | null;
  };
  eventDateRange: string;
  eventVenue: string;
  registrationIdentifier: string;
}

export default function ParticipantRegistrationNotificationTemplate({
  participants,
  registrantName,
  eventDetails,
  eventDateRange,
  eventVenue,
  registrationIdentifier,
}: ParticipantRegistrationNotificationTemplateProps) {
  if (!eventDetails.eventHeaderUrl) {
    throw new Error("Event header URL is required");
  }

  const previewString = `You're registered for ${eventDetails.eventTitle}`;

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

          <Heading style={h1}>You've Been Registered!</Heading>

          <Text style={text}>
            Hello <strong>{participants[0]?.participantName}</strong>,
          </Text>

          <Text style={text}>
            <strong>{registrantName}</strong> has registered you for{" "}
            <strong>{eventDetails.eventTitle}</strong>!
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
            Here are your check-in QR code/s. Present these at the event to
            check-in.
          </Text>

          <Hr style={hr} />

          <Section style={contextSection}>
            <Text style={contextText}>
              Registered by <strong>{registrantName}</strong> (Group
              Registration Identifier:{" "}
              <code style={detailValueMono}>{registrationIdentifier}</code>)
            </Text>
          </Section>

          {participants.map((participant) => (
            <TicketCard
              cid={`participantQrCodeCID-${participant.participantIdentifier}`}
              email={participant.email}
              identifier={participant.participantIdentifier}
              key={participant.participantIdentifier}
              subtitle={participant.affiliation}
              title={participant.participantName}
            />
          ))}

          <TermsAndConditions />

          <Hr style={hr} />

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

ParticipantRegistrationNotificationTemplate.PreviewProps = {
  participants: [
    {
      participantName: "John Doe",
      participantIdentifier: "ibc-par-abc12345",
      affiliation: "Acme Corp",
      email: "john.doe@acme.com",
    },
    {
      participantName: "Jane Smith",
      participantIdentifier: "ibc-par-def67890",
      affiliation: "Acme Corp",
      email: "jane.smith@acme.com",
    },
  ],
  registrantName: "Alice Johnson",
  eventDetails: {
    eventId: "1010",
    eventTitle: "Awarding Ceremony 2024",
    eventHeaderUrl: "https://placehold.co/600x400",
  },
  eventDateRange: "January 20, 2024, 12:00 PM to January 25, 2024, 8:00 PM",
  eventVenue: "Grand Ballroom, Iloilo Convention Center",
  registrationIdentifier: "ibc-reg-abc12345",
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

const contextSection = {
  padding: "0 40px",
  marginBottom: "24px",
};

const contextText = {
  color: "#71717a",
  fontSize: "14px",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 40px",
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
  width: "auto",
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

const detailValueMono = {
  fontFamily:
    'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace',
};
