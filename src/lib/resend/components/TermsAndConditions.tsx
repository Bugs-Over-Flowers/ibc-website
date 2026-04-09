import { Hr, Section, Text } from "@react-email/components";

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
        <strong>1. Registration Information</strong>
        <br />
        You confirm that all details you submitted are accurate and complete.
        Incorrect or incomplete information may affect your registration status.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>2. Data Privacy</strong>
        <br />
        Personal information collected during registration is used for event
        processing, participant coordination, and official event records. Data
        is handled by authorized personnel and protected using reasonable
        safeguards.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>3. Communication Consent</strong>
        <br />
        By registering, you agree to receive event-related updates,
        confirmations, reminders, and important announcements through your
        provided contact channels.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>4. Photography &amp; Media Consent</strong>
        <br />
        Event activities may be photographed or recorded. By attending, you
        consent to the use of your image, voice, or likeness in IBC
        documentation, website content, social media, and promotional materials.
        If you prefer not to be featured, please notify event staff.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>5. Event Changes</strong>
        <br />
        Iloilo Business Club reserves the right to modify event details,
        including date, time, venue, or speakers, due to unforeseen
        circumstances. Registered attendees will be notified of any changes via
        email.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>6. Code of Conduct</strong>
        <br />
        Attendees are expected to conduct themselves professionally and
        respectfully. IBC reserves the right to remove any participant who
        engages in disruptive or inappropriate behavior.
      </Text>

      <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
        <strong>7. Acknowledgment</strong>
        <br />
        By completing your registration, you acknowledge that you have read and
        agree to these terms and conditions.
      </Text>

      <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

      {/*<Text
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
      </Text>*/}
    </Section>
  );
}
