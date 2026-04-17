import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export default function Email() {
  return (
    <Html>
      <Head />
      <Preview>Sample Email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Sample Email</Heading>
          <Text style={text}>This is a sample email template.</Text>
          <Container style={{ padding: "0 40px" }}>
            <Button
              href="https://example.com"
              style={{
                background: "#000",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "4px",
              }}
            >
              Click me
            </Button>
          </Container>
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
