import { Section, Text } from "@react-email/components";

export default function Footer() {
  return (
    <Section>
      <Text className="mt-[24px] mb-0 text-[16px] text-gray-500 leading-[24px]">
        Best regards,
      </Text>
      <Text className="mt-[4px] mb-0 text-[16px] text-gray-500 leading-[24px]">
        Iloilo Business Club
      </Text>
    </Section>
  );
}
