import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MeetingNotificationEmailProps {
  companyName: string;
  interviewDate: string;
  interviewVenue: string;
  customMessage?: string;
}

export default function MeetingNotificationEmail({
  companyName,
  interviewDate,
  interviewVenue,
  customMessage,
}: MeetingNotificationEmailProps) {
  // interviewDate is already formatted from the server (e.g., "December 25, 2024, 10:00 AM GMT+8")
  // Use it directly without re-parsing

  // If customMessage is provided, replace placeholders with actual values
  const renderCustomMessage = () => {
    if (!customMessage) return null;

    const processedMessage = customMessage
      .replace(/\{INTERVIEW_DATE\}/g, interviewDate)
      .replace(/\{INTERVIEW_VENUE\}/g, interviewVenue);

    const lines = processedMessage.split("\n");
    return lines.map((line, i) => (
      <Text key={`msg-${line.substring(0, 20)}-${i}`} style={text}>
        {line || "\u00A0"}
      </Text>
    ));
  };

  return (
    <Html>
      <Head />
      <Preview>
        Your IBC Membership Application Interview has been scheduled
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Interview Scheduled</Heading>

          {customMessage ? (
            // Render custom message if provided
            renderCustomMessage()
          ) : (
            // Render default message
            <>
              <Text style={text}>Dear {companyName},</Text>
              <Text style={text}>
                We are pleased to inform you that your membership application
                interview with the Iloilo Business Club has been scheduled.
              </Text>

              <Section style={detailsSection}>
                <Text style={detailLabel}>Date and Time:</Text>
                <Text style={detailValue}>{interviewDate}</Text>

                <Text style={detailLabel}>Venue:</Text>
                <Text style={detailValue}>{interviewVenue}</Text>
              </Section>

              <Hr style={hr} />

              <Text style={text}>
                Please arrive 10 minutes early and bring the following
                documents:
              </Text>
              <ul style={list}>
                <li>Valid ID of company representative(s)</li>
                <li>DTI/SEC Registration Certificate (if applicable)</li>
                <li>Business Permit or Mayor's Permit</li>
              </ul>

              <Text style={text}>
                If you need to reschedule or have any questions, please contact
                us immediately.
              </Text>

              <Text style={footer}>
                Best regards,
                <br />
                Iloilo Business Club
              </Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

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

const detailsSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  margin: "24px 40px",
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
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const list = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  margin: "16px 0",
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
