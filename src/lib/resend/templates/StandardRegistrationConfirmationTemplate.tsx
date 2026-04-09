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
} from "@react-email/components";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import TermsAndConditions from "../components/TermsAndConditions";

interface StandardRegistrationConfirmationTemplateProps {
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    "eventTitle" | "eventHeaderUrl"
  >;
  eventDateRange: string;
  eventVenue: string;
  registrationIdentifier: string;
  self: {
    fullName: string;
    email: string;
  };
  otherParticipants?: {
    fullName: string;
    email: string;
  }[];
}

export default function StandardRegistrationConfirmationTemplate({
  eventDetails,
  eventDateRange,
  eventVenue,
  registrationIdentifier,
  otherParticipants,
  self,
}: StandardRegistrationConfirmationTemplateProps) {
  if (!eventDetails.eventHeaderUrl) {
    throw new Error("Event header URL is required");
  }

  const previewString = `Registration Confirmation: ${eventDetails.eventTitle}`;
  const otherParticipantsString =
    otherParticipants && otherParticipants.length > 0
      ? ` and the following participants`
      : "";

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

          <Heading style={h1}>Registration Successful</Heading>

          <Text style={text}>
            You have successfully registered for{" "}
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

          <Text style={text}>Here is your Check-in Registration Code:</Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            {/** biome-ignore lint/performance/noImgElement: using react-email */}
            <img
              alt="Check-in QR Code"
              height="300"
              src="cid:qrCodeCID"
              style={{ maxWidth: "300px", margin: "0 auto" }}
              width="300"
            />
          </Section>

          <Text style={text}>
            Please keep a copy of the QR code for you {otherParticipantsString}{" "}
            to sign in to the event.
          </Text>

          <Section style={detailsSection}>
            <Text style={detailLabel}>Registration Identifier</Text>
            <Text style={detailValue}>
              <code style={detailValueMono}>{registrationIdentifier}</code>
            </Text>

            <Text style={detailLabel}>
              Participants under this registration
            </Text>
            <Text style={detailValue}>
              • {self.fullName} ({self.email}) - <strong>Registrant</strong>
            </Text>
            {otherParticipants &&
              otherParticipants.length > 0 &&
              otherParticipants.map((participant) => (
                <Text key={participant.email} style={detailValue}>
                  • {participant.fullName} ({participant.email})
                </Text>
              ))}
          </Section>

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

StandardRegistrationConfirmationTemplate.PreviewProps = {
  eventDetails: {
    eventId: "1010",
    eventTitle: "Awarding Ceremony 2024",
    eventHeaderUrl: "https://placehold.co/600x400",
  },
  eventDateRange: "January 20, 2024, 12:00 PM to January 25, 2024, 8:00 PM",
  eventVenue: "Grand Ballroom, Iloilo Convention Center",
  registrationIdentifier: "IBC-REG-2026-0001",
  otherParticipants: [
    { fullName: "John Doe", email: "john.doe@example.com" },
    { fullName: "Jane Smith", email: "jane.smith@example.com" },
  ],
  self: {
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
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
