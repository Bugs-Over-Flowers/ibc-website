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
import type { Database } from "@/lib/supabase/db.types";

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

interface MembershipStatusChangedEmailProps {
  businessName: string;
  previousStatus: MembershipStatus;
  currentStatus: MembershipStatus;
}

function getTransitionCopy(
  previousStatus: MembershipStatus,
  currentStatus: MembershipStatus,
): {
  intro: string;
  details: string;
} {
  if (previousStatus === "paid" && currentStatus === "unpaid") {
    return {
      intro:
        "Your membership has moved to unpaid status based on your current membership validity window.",
      details:
        "You may settle your annual dues to restore your paid status and continue receiving active member benefits.",
    };
  }

  if (previousStatus === "unpaid" && currentStatus === "cancelled") {
    return {
      intro:
        "Your membership has moved to cancelled status because dues remained unsettled past the allowed period.",
      details:
        "You may contact the IBC secretariat for the current reactivation process and documentary requirements.",
    };
  }

  return {
    intro: "Your membership status has been updated in our records.",
    details:
      "If you believe this change was made in error, please contact the IBC secretariat so we can assist you.",
  };
}

export default function MembershipStatusChangedEmail({
  businessName,
  previousStatus,
  currentStatus,
}: MembershipStatusChangedEmailProps) {
  const copy = getTransitionCopy(previousStatus, currentStatus);

  return (
    <Html>
      <Head />
      <Preview>IBC Membership Status Update</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>IBC Membership Status Update</Heading>

          <Text style={text}>Dear {businessName},</Text>
          <Text style={text}>{copy.intro}</Text>

          <Section style={statusSection}>
            <Text style={label}>Previous status</Text>
            <Text style={value}>{previousStatus}</Text>
            <Text style={label}>Current status</Text>
            <Text style={value}>{currentStatus}</Text>
          </Section>

          <Text style={text}>{copy.details}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            For questions, reply to this email or contact Iloilo Business Club.
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

const statusSection = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  margin: "24px auto",
  maxWidth: "520px",
  padding: "24px",
};

const label = {
  color: "#71717a",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
  marginTop: "16px",
};

const value = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "500",
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
