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
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import TermsAndConditions from "../components/TermsAndConditions";
import TicketCard from "../components/TicketCard";

interface StandardRegistrationConfirmationTemplateProps {
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    "eventTitle" | "eventHeaderUrl"
  >;
  eventDateRange: string;
  eventVenue: string;
  registrationIdentifier: string;
  participantIdentifier: string;
  self: {
    fullName: string;
    email: string;
    affiliation: string;
  };
  participants?: {
    fullName: string;
    email: string;
    affiliation: string;
    participantIdentifier: string;
  }[];
}

export default function StandardRegistrationConfirmationTemplate({
  eventDetails,
  eventDateRange,
  eventVenue,
  registrationIdentifier,
  participantIdentifier,
  participants,
  self,
}: StandardRegistrationConfirmationTemplateProps) {
  if (!eventDetails.eventHeaderUrl) {
    throw new Error("Event header URL is required");
  }

  const previewString = `Registration Confirmation: ${eventDetails.eventTitle}`;

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

          <Text style={text}>
            Here are the check-in QR codes for everyone under this registration.
            Please present the appropriate QR code at the event entrance.
          </Text>

          <Hr style={hr} />

          <Text style={text}>Registration QR Code</Text>
          <Text style={subtext}>
            Use this code to check in multiple people during the event.
          </Text>
          <TicketCard
            cid="qrCodeCID"
            email={self.email}
            identifier={registrationIdentifier}
            subtitle={self.fullName}
            title={self.affiliation}
          />

          <Hr style={hr} />

          <Heading style={h2}>Individual Passes</Heading>
          <Text style={subtext}>
            Use these to check in individual participants.
          </Text>

          <TicketCard
            cid="participantQrCodeCID"
            email={self.email}
            identifier={participantIdentifier}
            subtitle={self.affiliation}
            title={self.fullName}
          />

          {participants?.map((participant) => (
            <TicketCard
              cid={`participantQrCodeCID-${participant.participantIdentifier}`}
              email={participant.email}
              identifier={participant.participantIdentifier}
              key={participant.participantIdentifier}
              subtitle={participant.affiliation}
              title={participant.fullName}
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

StandardRegistrationConfirmationTemplate.PreviewProps = {
  eventDetails: {
    eventTitle: "Awarding Ceremony 2024",
    eventHeaderUrl: "https://placehold.co/600x400",
  },
  eventDateRange: "January 20, 2024, 12:00 PM to January 25, 2024, 8:00 PM",
  eventVenue: "Grand Ballroom, Iloilo Convention Center",
  registrationIdentifier: "ibc-reg-a1b2c3d4",
  participantIdentifier: "ibc-par-a1b2c3d4",
  participants: [
    {
      fullName: "John Doe",
      email: "john.doe@example.com",
      affiliation: "Acme Corp",
      participantIdentifier: "ibc-par-e5f6g7h8",
    },
    {
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      affiliation: "Acme Corp",
      participantIdentifier: "ibc-par-i9j0k1l2",
    },
  ],
  self: {
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    affiliation: "Acme Corp",
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

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "32px 0 16px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const subtext = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "4px",
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
