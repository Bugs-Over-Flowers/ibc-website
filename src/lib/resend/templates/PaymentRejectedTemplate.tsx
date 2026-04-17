import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface PaymentRejectedTemplateProps {
  eventTitle: string;
  registrantName: string;
}

export default function PaymentRejectedTemplate({
  eventTitle,
  registrantName,
}: PaymentRejectedTemplateProps) {
  const previewText = `Action Required: Payment Rejected for ${eventTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto px-4 py-10">
            <Section>
              <Row>
                <Heading className="font-bold text-2xl text-red-600">
                  Payment Proof Rejected
                </Heading>
              </Row>
              <Hr className="my-4 border-gray-300" />
              <Row>
                <Text className="text-gray-700 text-lg">
                  Dear {registrantName},
                </Text>
                <Text className="text-gray-700">
                  We are writing to inform you that your payment proof for the
                  event <strong>{eventTitle}</strong> has been rejected.
                </Text>

                <Text className="font-bold text-green-700">
                  If you already paid online please bring clear copy of your
                  proof of payment on the event venue on the day of the event.
                </Text>

                <Text className="text-gray-700">
                  This may be due to an unclear image, incorrect amount, or
                  other issues with the provided proof.
                </Text>
                <Text className="text-gray-700">
                  Please contact us or you can pay onsite to complete your
                  registration.
                </Text>
              </Row>
              <Row className="mt-8">
                <Text className="text-gray-500 text-sm">
                  If you have any questions, please reply to this email.
                </Text>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
