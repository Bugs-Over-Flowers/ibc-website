import type { WebsiteContentSectionDefaults } from "../types";

export function getLandingPageBenefitsDefaults(): WebsiteContentSectionDefaults {
  return {
    placeholders: {
      title: "Business Networking",
      subtitle: "",
      paragraph:
        "Connect with industry leaders and fellow entrepreneurs to expand your professional network.",
      visionParagraph: "",
      missionParagraph: "",
      icon: "Handshake",
      imageUrl: "",
      cardPlacement: "1",
    },
    cards: [
      {
        entryKey: "benefit_1",
        title: "Business Networking",
        subtitle: "",
        paragraph:
          "Connect with industry leaders and fellow entrepreneurs to expand your professional network.",
        icon: "Handshake",
        imageUrl: "",
        cardPlacement: 1,
        group: null,
      },
      {
        entryKey: "benefit_2",
        title: "Growth Opportunities",
        subtitle: "",
        paragraph:
          "Access exclusive business opportunities and partnerships that drive sustainable growth.",
        icon: "TrendingUp",
        imageUrl: "",
        cardPlacement: 2,
        group: null,
      },
      {
        entryKey: "benefit_3",
        title: "Community Support",
        subtitle: "",
        paragraph:
          "Be part of a supportive community that champions local businesses and entrepreneurship.",
        icon: "Users",
        imageUrl: "",
        cardPlacement: 3,
        group: null,
      },
      {
        entryKey: "benefit_4",
        title: "Excellence Recognition",
        subtitle: "",
        paragraph:
          "Celebrate achievements through our annual awards and recognition programs.",
        icon: "Award",
        imageUrl: "",
        cardPlacement: 4,
        group: null,
      },
      {
        entryKey: "benefit_5",
        title: "Regional Impact",
        subtitle: "",
        paragraph:
          "Contribute to the economic development and progress of Iloilo and Western Visayas.",
        icon: "Globe",
        imageUrl: "",
        cardPlacement: 5,
        group: null,
      },
      {
        entryKey: "benefit_6",
        title: "Innovation Hub",
        subtitle: "",
        paragraph:
          "Stay ahead with insights on industry trends, innovations, and best practices.",
        icon: "Lightbulb",
        imageUrl: "",
        cardPlacement: 6,
        group: null,
      },
    ],
  };
}
