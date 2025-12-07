import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  pixelBasedPreset,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { RegistrationStoreEventDetails } from "@/hooks/registration.store";
import CustomFont from "../components/Font";
import Footer from "../components/Footer";
import TermsAndConditions from "../components/TermsAndConditions";

interface StandardRegistrationConfirmationTemplateProps {
  email: string;
  eventDetails: Pick<
    RegistrationStoreEventDetails,
    "eventTitle" | "eventStartDate" | "eventHeaderUrl" | "eventEndDate"
  >;
  self: {
    fullName: string;
    email: string;
  };
  otherParticipants?: {
    fullName: string;
    email: string;
  }[];
}
export default function StandardRegistrationConfirmationTemplate({
  eventDetails,
  otherParticipants,
  self,
}: StandardRegistrationConfirmationTemplateProps) {
  // Template implementation here
  if (!eventDetails.eventHeaderUrl) {
    throw new Error("Event header URL is required");
  }

  const previewString = `Registration Confirmation for ${eventDetails.eventTitle}`;
  const otherParticipantsString =
    otherParticipants &&
    otherParticipants.length > 0 &&
    ` and the following participants`;
  return (
    <Html>
      <Head>
        <CustomFont />
        <title>{previewString}</title>
      </Head>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body>
          <Preview>{previewString}</Preview>
          <Section>
            <Row align="center">
              <Container className="text-center">
                <Img
                  src={eventDetails.eventHeaderUrl}
                  alt={eventDetails.eventTitle}
                  width="100%"
                  style={{ maxWidth: "448px", margin: "0 auto" }}
                />
              </Container>
            </Row>
            <Row>
              <Text className="text-3xl text-center">
                You have successfully registered for
                <br />
                <strong>{eventDetails.eventTitle}</strong>!
              </Text>
            </Row>
            <br />
            <Row align="center">
              <Text className="text-center">
                Here is your Check-in Registration Code
              </Text>
            </Row>
            <Row className="text-center">
              {/** biome-ignore lint/performance/noImgElement: using react-email */}
              <img
                src="cid:qrCodeCID"
                alt="Check-in QR Code"
                width="300"
                height="300"
                style={{ maxWidth: "448px", margin: "0 auto" }}
              />
            </Row>
            <Row className="text-center">
              <Text className="text-center">
                Please keep a copy of the QR code for you{" "}
                {otherParticipantsString} to sign in to the event.
              </Text>
              <Section className="mx-4">
                <Heading as="h2">Participants under this registration:</Heading>
                <ol className="space-y-4">
                  <li className="text-start">
                    {self.fullName} - {self.email}
                  </li>
                  {otherParticipants &&
                    otherParticipants.length > 0 &&
                    otherParticipants.map((participant, index) => (
                      <li
                        key={`participant-${
                          // biome-ignore lint/suspicious/noArrayIndexKey: It's okay
                          index
                        }`}
                        className="text-start"
                      >
                        {participant.fullName} - {participant.email}
                      </li>
                    ))}
                </ol>
              </Section>
            </Row>
          </Section>
          <TermsAndConditions />
          <Footer />
        </Body>
      </Tailwind>
    </Html>
  );
}

StandardRegistrationConfirmationTemplate.PreviewProps = {
  eventDetails: {
    eventId: "1010",
    eventTitle: "Awarding Ceremony 2024",
    eventStartDate: "",
    eventEndDate: "",
    eventHeaderUrl: "https://placehold.co/600x400",
  },
  otherParticipants: [
    { fullName: "John Doe", email: "john.doe@example.com" },
    { fullName: "Jane Smith", email: "jane.smith@example.com" },
  ],
  self: {
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
  },
};
