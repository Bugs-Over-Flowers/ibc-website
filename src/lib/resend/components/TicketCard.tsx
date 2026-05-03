import { Section, Text } from "react-email";

interface TicketCardProps {
  title: string;
  subtitle?: string;
  email?: string;
  cid: string;
  identifier: string;
}

export default function TicketCard({
  title,
  subtitle,
  email,
  cid,
  identifier,
}: TicketCardProps) {
  return (
    <Section style={ticketContainer}>
      <Section style={qrBox}>
        {/** biome-ignore lint/performance/noImgElement: using react-email */}
        <img
          alt={title}
          height="150"
          src={`cid:${cid}`}
          style={qrImage}
          width="150"
        />
        <Text style={identifierStyle}>{identifier}</Text>
      </Section>

      <Text style={titleStyle}>{title}</Text>
      {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
      {email && <Text style={emailStyle}>{email}</Text>}
    </Section>
  );
}

const ticketContainer = {
  margin: "24px auto",
  maxWidth: "280px",
  backgroundColor: "#ffffff",
  border: "2px solid #e5e7eb",
  borderRadius: "16px",
  padding: "20px 24px",
  textAlign: "center" as const,
};

const qrBox = {
  backgroundColor: "#e2e8f0",
  borderRadius: "12px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "0 auto 16px auto",
};

const qrImage = {
  display: "block",
  margin: "0 auto 12px auto",
  maxWidth: "150px",
  backgroundColor: "#ffffff",
  padding: "8px",
  borderRadius: "8px",
};

const identifierStyle = {
  color: "#0f172a",
  fontFamily:
    'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace',
  fontSize: "13px",
  fontWeight: "500",
  margin: "0",
  letterSpacing: "0.5px",
};

const titleStyle = {
  color: "#171717",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 2px 0",
  lineHeight: "1.2",
};

const subtitleStyle = {
  color: "#737373",
  fontSize: "12px",
  margin: "0 0 2px 0",
};

const emailStyle = {
  color: "#737373",
  fontSize: "12px",
  margin: "0",
};
