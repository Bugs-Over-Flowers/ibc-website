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

interface ApplicationDecisionEmailProps {
  companyName: string;
  decision: "approved" | "rejected";
  notes?: string;
}

export default function ApplicationDecisionEmail({
  companyName,
  decision,
  notes,
}: ApplicationDecisionEmailProps) {
  const isApproved = decision === "approved";
  const previewText = isApproved
    ? "IBC Membership Application Approved"
    : "IBC Membership Application Update";

  const headingText = isApproved
    ? "Your membership application is approved"
    : "Your membership application update";

  const introText = isApproved
    ? `We are pleased to inform you that your membership application with the Iloilo Business Club has been approved.`
    : `Thank you for your interest in joining the Iloilo Business Club. After careful review, we are unable to proceed with your application at this time.`;

  const notesLines = (notes || "").trim().split("\n").filter(Boolean);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{headingText}</Heading>

          <Text style={text}>Dear {companyName},</Text>
          <Text style={text}>{introText}</Text>

          {isApproved ? (
            <Section style={detailsSection}>
              <Text style={detailLabel}>Next Steps</Text>
              <Text style={detailValue}>
                Our team will reach out with onboarding details and membership
                orientation. Please watch for a follow-up email with your
                account information.
              </Text>
            </Section>
          ) : (
            <Section style={detailsSection}>
              <Text style={detailLabel}>What this means</Text>
              <Text style={detailValue}>
                We encourage you to stay connected with our events and consider
                reapplying in the future.
              </Text>
            </Section>
          )}

          {notesLines.length > 0 && (
            <>
              <Text style={text}>Additional notes from our team:</Text>
              <Section style={notesSection}>
                {notesLines.map((line, idx) => (
                  <Text key={`${idx}-${line.substring(0, 16)}`} style={text}>
                    {line}
                  </Text>
                ))}
              </Section>
            </>
          )}

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
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 8px 0",
};

const notesSection = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "4px",
  margin: "16px 40px",
  padding: "16px",
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
