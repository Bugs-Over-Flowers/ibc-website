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

type ApplicationType = "newMember" | "renewal" | "updating";

interface MembershipApplicationConfirmationProps {
  companyName: string;
  applicationType: ApplicationType;
  applicationIdentifier: string;
  contactEmail: string;
}

export default function MembershipApplicationConfirmation({
  companyName,
  applicationType,
  applicationIdentifier,
  contactEmail,
}: MembershipApplicationConfirmationProps) {
  const getPreview = () => {
    switch (applicationType) {
      case "newMember":
        return "Your IBC Membership Application has been received";
      case "renewal":
        return "Your IBC Membership Renewal Request has been received";
      case "updating":
        return "Your IBC Member Information Update Request has been received";
      default:
        return "Your IBC Application has been received";
    }
  };

  const getHeading = () => {
    switch (applicationType) {
      case "newMember":
        return "Application Received!";
      case "renewal":
        return "Welcome Back!";
      case "updating":
        return "Update Request Received";
      default:
        return "Application Received";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{getPreview()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{getHeading()}</Heading>
          <Text style={text}>Dear {companyName},</Text>

          {applicationType === "newMember" && (
            <Section>
              <Text style={text}>
                Thank you for applying for membership at the Iloilo Business
                Club. We have successfully received your application and our
                team is now reviewing your submission.
              </Text>
              <Text style={text}>
                <strong>What happens next?</strong>
              </Text>
              <Text style={text}>
                Our Membership Committee will review your application. If
                approved for the next step, you will be scheduled for an
                interview with our committee members. You will receive a
                separate email notification once the interview date and time
                have been decided.
              </Text>
            </Section>
          )}

          {applicationType === "renewal" && (
            <Section>
              <Text style={text}>
                It is great to have you back! We have received your membership
                renewal request and our team is now processing it.
              </Text>
              <Text style={text}>
                Thank you for your continued trust and support of the Iloilo
                Business Club. Your membership renewal helps strengthen our
                business community.
              </Text>
            </Section>
          )}

          {applicationType === "updating" && (
            <Section>
              <Text style={text}>
                We have received your request to update your membership
                information. Our team will review the changes and update your
                records accordingly.
              </Text>
              <Text style={text}>
                Please note that certain changes may require verification or
                additional documentation.
              </Text>
            </Section>
          )}

          <Section style={detailsSection}>
            <Text style={detailLabel}>Application Identifier:</Text>
            <Text style={detailValue}>{applicationIdentifier}</Text>

            <Text style={detailLabel}>Company Name:</Text>
            <Text style={detailValue}>{companyName}</Text>

            <Text style={detailLabel}>Contact Email:</Text>
            <Text style={detailValue}>{contactEmail}</Text>
          </Section>

          <Hr style={hr} />

          {applicationType === "newMember" && (
            <Section>
              <Text style={text}>
                <strong>Track Your Application</strong>
              </Text>
              <Text style={text}>
                You can check the status of your application anytime using your
                Application Identifier. The application tracking page will show
                your current application status, interview schedule (once
                confirmed), and any updates or requirements.
              </Text>
              <Text style={text}>
                Please check the application tracking regularly for updates on
                your membership application status.
              </Text>
            </Section>
          )}

          {applicationType === "renewal" && (
            <Section>
              <Text style={text}>
                <strong>Processing Time</strong>
              </Text>
              <Text style={text}>
                Your renewal request is being processed by our Membership
                Committee. This may take a few business days to complete. You
                will receive a confirmation email once your renewal has been
                approved and processed.
              </Text>
              <Text style={text}>
                If you have provided payment proof, our finance team will verify
                it as part of the renewal process.
              </Text>
            </Section>
          )}

          {applicationType === "updating" && (
            <Section>
              <Text style={text}>
                <strong>Processing Time</strong>
              </Text>
              <Text style={text}>
                Information updates typically take 3-5 business days to process.
                Some updates may require additional review by our Membership
                Committee and may take longer to complete.
              </Text>
              <Text style={text}>
                You will receive a confirmation email once your information has
                been successfully updated in our system.
              </Text>
            </Section>
          )}

          <Text style={text}>
            If you have any questions or need assistance, please do not hesitate
            to contact us.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            Iloilo Business Club
          </Text>

          <Text style={footerNote}>
            This is an automated message. Please do not reply directly to this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1: React.CSSProperties = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0 20px",
  padding: "0 40px",
};

const text: React.CSSProperties = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const detailsSection: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  margin: "24px 40px",
  padding: "24px",
};

const detailLabel: React.CSSProperties = {
  color: "#71717a",
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "4px",
  marginTop: "16px",
};

const detailValue: React.CSSProperties = {
  color: "#18181b",
  fontSize: "18px",
  fontWeight: 600,
  margin: "0 0 8px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#e6ebf1",
  margin: "20px 40px",
};

const footer: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};

const footerNote: React.CSSProperties = {
  color: "#a0aec0",
  fontSize: "12px",
  fontStyle: "italic",
  padding: "0 40px",
  marginTop: "16px",
};

MembershipApplicationConfirmation.PreviewProps = {
  companyName: "ABC Corporation",
  applicationType: "newMember" as ApplicationType,
  applicationIdentifier: "IBC-APP-2026-001234",
  contactEmail: "contact@abccorp.com",
};
