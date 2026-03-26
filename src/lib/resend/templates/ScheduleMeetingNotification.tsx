import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { sanitizeEmailHtml } from "@/lib/resend/utils/sanitizeEmailHtml";

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
  const sanitizeEmailRichText = (html: string) =>
    sanitizeEmailHtml(html, {
      allowedTags: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
      ],
      allowedAttributes: {},
    });

  const hasDatePlaceholder = customMessage?.includes("{INTERVIEW_DATE}");
  const hasVenuePlaceholder = customMessage?.includes("{INTERVIEW_VENUE}");

  const processCustomMessage = () => {
    if (!customMessage) return null;

    let processed = customMessage
      .replace(/\{INTERVIEW_DATE\}/g, interviewDate)
      .replace(/\{INTERVIEW_VENUE\}/g, interviewVenue);

    if (!hasDatePlaceholder && !hasVenuePlaceholder) {
      processed = `${processed}<p><strong>Interview Details:</strong></p><p>Date &amp; Time: ${interviewDate}</p><p>Venue: ${interviewVenue}</p>`;
    }

    return sanitizeEmailRichText(processed);
  };

  const processedMessage = processCustomMessage();

  return (
    <Html lang="en">
      <Head>
        <title>Interview Scheduled — Iloilo Business Club</title>
      </Head>
      <Preview>
        Your IBC Membership Application Interview has been scheduled
      </Preview>
      <Body style={styles.body}>
        {/* Header bar */}
        <Section style={styles.header}>
          <Container style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Iloilo Business Club</Text>
          </Container>
        </Section>

        {/* Accent bar */}
        <Section style={styles.accentBar} />

        {/* Main card */}
        <Container style={styles.card}>
          <Section style={styles.cardTop}>
            {/* Status badge */}
            <Text style={styles.badge}>&#128197; Scheduled</Text>

            {/* Heading */}
            <Heading as="h1" style={styles.heading}>
              Interview Scheduled
            </Heading>
            <Text style={styles.subheading}>
              Your interview has been confirmed.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {processedMessage ? (
            <>
              {/* Custom rich text message */}
              <Section style={styles.section}>
                <div
                  dangerouslySetInnerHTML={{ __html: processedMessage }}
                  style={styles.richTextBlock}
                />
              </Section>
            </>
          ) : (
            <>
              {/* Default message */}
              <Section style={styles.section}>
                <Text style={styles.text}>
                  Dear <strong>{companyName}</strong>,
                </Text>
                <Text style={styles.bodyText}>
                  We are pleased to inform you that your membership application
                  interview with the Iloilo Business Club has been scheduled.
                </Text>
              </Section>

              {/* Interview details card */}
              <Section style={styles.section}>
                <Section style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Interview Details</Text>
                  <Hr style={styles.detailsDivider} />

                  <Row style={{ marginBottom: "12px" }}>
                    <Column style={styles.detailLabel}>
                      <Text style={styles.detailLabelText}>Date & Time</Text>
                    </Column>
                    <Column>
                      <Text style={styles.detailValue}>{interviewDate}</Text>
                    </Column>
                  </Row>

                  <Row>
                    <Column style={styles.detailLabel}>
                      <Text style={styles.detailLabelText}>Venue</Text>
                    </Column>
                    <Column>
                      <Text style={styles.detailValue}>{interviewVenue}</Text>
                    </Column>
                  </Row>
                </Section>
              </Section>

              {/* What to bring */}
              <Section style={styles.section}>
                <Row>
                  <Column style={styles.accentBorder} />
                  <Column style={{ paddingLeft: "16px" }}>
                    <Text style={styles.nextStepTitle}>What to Bring</Text>
                  </Column>
                </Row>
                <Text style={styles.bodyText}>
                  Please arrive 10 minutes early and bring the following
                  documents: a valid ID of company representative(s), DTI/SEC
                  Registration Certificate (if applicable), and your Business
                  Permit or Mayor&apos;s Permit.
                </Text>
              </Section>

              {/* Help box */}
              <Section style={styles.section}>
                <Section style={styles.helpBox}>
                  <Text style={styles.helpText}>
                    <strong>Need to reschedule?</strong> If you need to
                    reschedule or have any questions, please contact our Office
                    directly. You can get our contact details on our website.
                  </Text>
                </Section>
              </Section>
            </>
          )}

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
    backgroundColor: "#dbeafe",
    color: "#1e40af",
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

  richTextBlock: {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "26px",
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

  detailValue: {
    color: "#0f1729",
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
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

MeetingNotificationEmail.PreviewProps = {
  companyName: "ABC Corporation",
  interviewDate: "March 15, 2026, 10:00 AM GMT+8",
  interviewVenue: "IBC Office, Iloilo City",
  customMessage: undefined,
};
