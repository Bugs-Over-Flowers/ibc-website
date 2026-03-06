import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
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

const typeConfig: Record<
  ApplicationType,
  {
    preview: string;
    heading: string;
    subheading: string;
    bodyText: string;
    nextStepTitle: string;
    nextStepText: string;
  }
> = {
  newMember: {
    preview: "Your IBC Membership Application has been received",
    heading: "Application Received",
    subheading: "Thank you for applying to the Iloilo Business Club.",
    bodyText:
      "We have successfully received your membership application. We will review your submission and reach out to you regarding the next steps.",
    nextStepTitle: "What happens next?",
    nextStepText:
      "We will be checking your application details and verifying your information. If everything is in order, you will be scheduled for an interview with us. You will receive a separate email notification once the interview date and time have been decided. You may also track your application status at any time using your Application Identifier above at our website.",
  },
  renewal: {
    preview: "Your IBC Membership Renewal Request has been received",
    heading: "Renewal Request Received",
    subheading: "Welcome back to the Iloilo Business Club.",
    bodyText:
      "We have successfully received your membership renewal request. Our team is now processing your submission and will notify you once it has been reviewed.",
    nextStepTitle: "Processing Time",
    nextStepText:
      "Your renewal request is being reviewed by us. This may take a few business days to complete. If you have provided payment proof, our finance team will verify it as part of the renewal process. You will receive a confirmation email once your renewal has been approved.",
  },
  updating: {
    preview: "Your IBC Member Information Update Request has been received",
    heading: "Update Request Received",
    subheading: "Your update request is being reviewed.",
    bodyText:
      "We have received your request to update your membership information. Our team will review the changes and update your records accordingly. Please note that certain changes may require verification or additional documentation.",
    nextStepTitle: "Processing Time",
    nextStepText:
      "Information updates typically take 3\u20135 business days to process. Some updates may require additional review by us and may take longer to complete. You will receive a confirmation email once your information has been successfully updated in our system.",
  },
};

export default function MembershipApplicationConfirmation({
  companyName,
  applicationType,
  applicationIdentifier,
  contactEmail,
}: MembershipApplicationConfirmationProps) {
  const config = typeConfig[applicationType];

  return (
    <Html lang="en">
      <Head>
        <title>{config.preview}</title>
      </Head>
      <Preview>{config.preview}</Preview>
      <Body style={styles.body}>
        {/* Header bar */}
        <Section style={styles.header}>
          <Container style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Iloilo Business Club</Text>
          </Container>
        </Section>

        {/* Blue accent bar */}
        <Section style={styles.accentBar} />

        {/* Main card */}
        <Container style={styles.card}>
          <Section style={styles.cardTop}>
            {/* Status badge */}
            <Text style={styles.badge}>&#10003; Received</Text>

            {/* Heading */}
            <Heading as="h1" style={styles.heading}>
              {config.heading}
            </Heading>
            <Text style={styles.subheading}>{config.subheading}</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Greeting + body */}
          <Section style={styles.section}>
            <Text style={styles.text}>
              Dear <strong>{companyName}</strong>,
            </Text>
            <Text style={styles.bodyText}>{config.bodyText}</Text>
          </Section>

          {/* Application details card */}
          <Section style={styles.section}>
            <Section style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Application Details</Text>
              <Hr style={styles.detailsDivider} />

              <Row style={{ marginBottom: "12px" }}>
                <Column style={styles.detailLabel}>
                  <Text style={styles.detailLabelText}>Identifier</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValueMono}>
                    {applicationIdentifier}
                  </Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: "12px" }}>
                <Column style={styles.detailLabel}>
                  <Text style={styles.detailLabelText}>Company</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>{companyName}</Text>
                </Column>
              </Row>

              <Row>
                <Column style={styles.detailLabel}>
                  <Text style={styles.detailLabelText}>Contact Email</Text>
                </Column>
                <Column>
                  <Link
                    href={`mailto:${contactEmail}`}
                    style={styles.emailLink}
                  >
                    {contactEmail}
                  </Link>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Next steps section */}
          <Section style={styles.section}>
            <Row>
              <Column style={styles.accentBorder} />
              <Column style={{ paddingLeft: "16px" }}>
                <Text style={styles.nextStepTitle}>{config.nextStepTitle}</Text>
              </Column>
            </Row>
            <Text style={styles.bodyText}>{config.nextStepText}</Text>
          </Section>

          {/* Help section */}
          <Section style={styles.section}>
            <Section style={styles.helpBox}>
              <Text style={styles.helpText}>
                <strong>Need assistance?</strong> If you have any questions
                about your application, please do not hesitate to contact our
                Office. We are happy to help. You can get our contact details at
                our website.
              </Text>
            </Section>
          </Section>

          {/* Signature */}
          <Section style={styles.signatureSection}>
            <Text style={styles.signatureRegards}>Best regards,</Text>
            <Text style={styles.signatureName}>Iloilo Business Club</Text>
          </Section>
        </Container>

        {/* Footer */}
        <Container style={styles.footerContainer}>
          <Hr style={styles.footerDivider} />
          <Text style={styles.footerText}>
            This is an automated message from the Iloilo Business Club.
            <br />
            Please do not reply directly to this email.
          </Text>
          <Text style={styles.footerCopyright}>
            &copy; {new Date().getFullYear()} Iloilo Business Club. All rights
            reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif';

const styles = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily,
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  header: {
    backgroundColor: "#0f1729",
    padding: 0,
  } as React.CSSProperties,

  headerContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px 40px",
  } as React.CSSProperties,

  headerTitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "bold" as const,
    margin: 0,
    letterSpacing: "0.025em",
    fontFamily,
  } as React.CSSProperties,

  headerSubtitle: {
    color: "#7dd3fc",
    fontSize: "12px",
    margin: 0,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontFamily,
  } as React.CSSProperties,

  accentBar: {
    backgroundColor: "#0284c5",
    height: "4px",
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  card: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
  } as React.CSSProperties,

  cardTop: {
    padding: "48px 40px 8px",
  } as React.CSSProperties,

  badge: {
    display: "inline-block" as const,
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    padding: "4px 12px",
    borderRadius: "9999px",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  heading: {
    color: "#0f1729",
    fontSize: "28px",
    fontWeight: "bold" as const,
    margin: "16px 0 0 0",
    lineHeight: "1.2",
    fontFamily,
  } as React.CSSProperties,

  subheading: {
    color: "#0284c5",
    fontSize: "16px",
    margin: "6px 0 0 0",
    fontFamily,
  } as React.CSSProperties,

  divider: {
    borderColor: "#e2e8f0",
    margin: "24px 40px",
  } as React.CSSProperties,

  section: {
    padding: "0 40px",
    marginBottom: "0",
  } as React.CSSProperties,

  text: {
    color: "#0f1729",
    fontSize: "16px",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  bodyText: {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "26px",
    margin: "12px 0 0 0",
    fontFamily,
  } as React.CSSProperties,

  detailsCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "20px 24px",
    marginTop: "28px",
  } as React.CSSProperties,

  detailsTitle: {
    color: "#0284c5",
    fontSize: "11px",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  detailsDivider: {
    borderColor: "#e2e8f0",
    margin: "12px 0",
  } as React.CSSProperties,

  detailLabel: {
    width: "40%",
  } as React.CSSProperties,

  detailLabelText: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  detailValueMono: {
    color: "#0f1729",
    fontSize: "14px",
    fontWeight: "bold" as const,
    fontFamily:
      '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    margin: 0,
  } as React.CSSProperties,

  detailValue: {
    color: "#0f1729",
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  emailLink: {
    color: "#0284c5",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    fontFamily,
  } as React.CSSProperties,

  accentBorder: {
    width: "4px",
    backgroundColor: "#0284c5",
    borderRadius: "9999px",
  } as React.CSSProperties,

  nextStepTitle: {
    color: "#0f1729",
    fontSize: "16px",
    fontWeight: "bold" as const,
    margin: "32px 0 0 0",
    fontFamily,
  } as React.CSSProperties,

  helpBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "16px 20px",
    marginTop: "32px",
  } as React.CSSProperties,

  helpText: {
    color: "#0369a1",
    fontSize: "14px",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  signatureSection: {
    padding: "32px 40px 40px",
  } as React.CSSProperties,

  signatureRegards: {
    color: "#334155",
    fontSize: "14px",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  signatureName: {
    color: "#0f1729",
    fontSize: "15px",
    fontWeight: "bold" as const,
    margin: "4px 0 0 0",
    fontFamily,
  } as React.CSSProperties,

  signatureOrg: {
    color: "#0284c5",
    fontSize: "14px",
    margin: 0,
    fontFamily,
  } as React.CSSProperties,

  footerContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px 40px",
  } as React.CSSProperties,

  footerDivider: {
    borderColor: "#cbd5e1",
    margin: "0 0 20px 0",
  } as React.CSSProperties,

  footerText: {
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center" as const,
    margin: 0,
    lineHeight: "20px",
    fontFamily,
  } as React.CSSProperties,

  footerCopyright: {
    color: "#cbd5e1",
    fontSize: "11px",
    textAlign: "center" as const,
    margin: "8px 0 0 0",
    fontFamily,
  } as React.CSSProperties,
};

MembershipApplicationConfirmation.PreviewProps = {
  companyName: "ABC Corporation",
  applicationType: "newMember" as ApplicationType,
  applicationIdentifier: "IBC-APP-2026-001234",
  contactEmail: "contact@abccorp.com",
};
