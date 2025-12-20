import { Hr, Link, Section, Text } from "@react-email/components";

export default function TermsAndConditions() {
  return (
    <Section
      style={{
        marginTop: "32px",
        padding: "24px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
      }}
    >
      <Text
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "16px",
        }}
      >
        Terms & Conditions
      </Text>

      <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>1. Registration & Payment</strong>
        <br />
        All registrations are considered final upon receipt of payment. Payment
        must be completed within 48 hours of registration to secure your slot.
        Failure to pay within this period may result in automatic cancellation.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>2. Cancellation & Refunds</strong>
        <br />
        Cancellations made 7 days or more before the event are eligible for a
        full refund. Cancellations made within 7 days of the event are
        non-refundable. No-shows are not entitled to refunds.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>3. Event Changes</strong>
        <br />
        Iloilo Business Club reserves the right to modify event details,
        including date, time, venue, or speakers, due to unforeseen
        circumstances. Registered attendees will be notified of any changes via
        email.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>4. Code of Conduct</strong>
        <br />
        Attendees are expected to conduct themselves professionally and
        respectfully. IBC reserves the right to remove any participant who
        engages in disruptive or inappropriate behavior without refund.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>5. Photography & Media</strong>
        <br />
        By attending, you consent to being photographed or recorded for
        promotional purposes. If you prefer not to be included, please notify
        our staff at the event.
      </Text>

      <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

      <Text
        style={{
          fontSize: "11px",
          color: "#9ca3af",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        By completing your registration, you acknowledge that you have read and
        agree to these terms and conditions. For questions or concerns, please
        contact us at{" "}
        <Link
          href="mailto:info@iloilobusinessclub.com"
          style={{ color: "#2563eb" }}
        >
          info@iloilobusinessclub.com
        </Link>
      </Text>
    </Section>
  );
}
