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
} from "react-email";

interface ApplicationDecisionEmailProps {
  applicationType: "newMember" | "renewal" | "updating";
  companyName: string;
  decision: "approved" | "rejected";
  notes?: string;
}

export default function ApplicationDecisionEmail({
  applicationType,
  companyName,
  decision,
  notes,
}: ApplicationDecisionEmailProps) {
  const contentMap = {
    approved: {
      newMember: {
        detailsLabel: "Next Steps",
        detailsText:
          "Your membership for the current year is now in good standing. Please note that membership dues are billed annually and must be paid each year to keep your membership active.",
        headingText: "Your membership application is approved",
        introText:
          "We are pleased to inform you that your membership application with the Iloilo Business Club has been approved.",
        previewText: "IBC Membership Application Approved",
      },
      renewal: {
        detailsLabel: "What this means",
        detailsText:
          "Your membership for the current year remains in good standing. Please be reminded that membership dues are paid annually and must be settled each year to maintain active membership status.",
        headingText: "Your membership renewal is approved",
        introText:
          "We are pleased to inform you that your membership renewal request with the Iloilo Business Club has been approved.",
        previewText: "IBC Membership Renewal Approved",
      },
      updating: {
        detailsLabel: "What this means",
        detailsText:
          "Your member records will be updated in our system based on your approved submission. If further verification is needed for specific fields, our team will contact you.",
        headingText: "Your information update is approved",
        introText:
          "We are pleased to inform you that your request to update your membership information has been approved.",
        previewText: "IBC Membership Information Update Approved",
      },
    },
    rejected: {
      newMember: {
        detailsLabel: "What this means",
        detailsText:
          "You may review your submission details and reapply in the future. We also encourage you to stay connected with Iloilo Business Club events and programs.",
        headingText: "Your membership application update",
        introText:
          "Thank you for your interest in joining the Iloilo Business Club. After careful review, we are unable to proceed with your membership application at this time.",
        previewText: "IBC Membership Application Update",
      },
      renewal: {
        detailsLabel: "What this means",
        detailsText:
          "Your current membership status will follow existing club policy until renewal requirements are completed. If you need guidance on the requirements, please contact our office.",
        headingText: "Your membership renewal update",
        introText:
          "Thank you for submitting your membership renewal request. After careful review, we are unable to approve your renewal at this time.",
        previewText: "IBC Membership Renewal Update",
      },
      updating: {
        detailsLabel: "What this means",
        detailsText:
          "Some submitted changes may require correction or additional verification. Please coordinate with our office so we can guide you on the required next steps.",
        headingText: "Your information update request update",
        introText:
          "Thank you for submitting your member information update request. After review, we are unable to approve the request at this time.",
        previewText: "IBC Membership Information Update Request Update",
      },
    },
  } as const;

  const { detailsLabel, detailsText, headingText, introText, previewText } =
    contentMap[decision][applicationType];

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

          <Section style={detailsSection}>
            <Text style={detailLabel}>{detailsLabel}</Text>
            <Text style={detailValue}>{detailsText}</Text>
          </Section>

          {notesLines.length > 0 && (
            <>
              <Text style={text}>Additional notes from our team:</Text>
              <Section style={notesSection}>
                {notesLines.map((line) => {
                  // Create a stable hash for each line content
                  const lineHash = line
                    .split("")
                    .reduce(
                      (acc, char) => (acc << 5) - acc + char.charCodeAt(0),
                      0,
                    );
                  return (
                    <Text key={`line-${lineHash}`} style={text}>
                      {line}
                    </Text>
                  );
                })}
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
