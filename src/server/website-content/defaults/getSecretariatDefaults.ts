import type { WebsiteContentSectionDefaults } from "../types";

export function getSecretariatDefaults(): WebsiteContentSectionDefaults {
  return {
    placeholders: {
      title: "Herminia Ore",
      subtitle: "Finance, Marketing, and Promotion",
      paragraph: "",
      visionParagraph: "",
      missionParagraph: "",
      icon: "",
      imageUrl: "",
      cardPlacement: "1",
    },
    cards: [
      {
        entryKey: "secretariat_1",
        title: "Herminia Ore",
        subtitle: "Finance, Marketing, and Promotion",
        paragraph: "",
        icon: "",
        imageUrl: "",
        cardPlacement: 1,
        group: null,
      },
      {
        entryKey: "secretariat_2",
        title: "Clea Angela Drilon",
        subtitle: "Administrative Officer",
        paragraph: "",
        icon: "",
        imageUrl: "",
        cardPlacement: 2,
        group: null,
      },
      {
        entryKey: "secretariat_3",
        title: "Joel Germino",
        subtitle: "General Services",
        paragraph: "",
        icon: "",
        imageUrl: "",
        cardPlacement: 3,
        group: null,
      },
    ],
  };
}
